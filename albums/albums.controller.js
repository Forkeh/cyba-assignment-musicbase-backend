import connection from "../database/dbconfig.js";
import {deleteFromTable, getArtistsIDByName, getAssociatedIds} from "../utils/utils.js";

async function getAllAlbums(request, response) {
    try {
        const query = "SELECT id, title, year_of_release AS yearOfRelease, image FROM albums";
        const [results, fields] = await connection.execute(query);
        if (results.length === 0 || !results) {
            response.status(404).json({ message: "Could not find any albums" });
        }
        response.status(200).json(results);

    } catch (error) {
        response.status(500).json({ message: "Internal server error" });
    }
}

async function getSingleAlbum(request, response) {
    try {
        const id = request.params.id;
        const query = "SELECT * FROM albums WHERE id = ?";
        const values = [id];
        const [results, fields] = await connection.execute(query, values);
        if (results.length === 0 || !results) {
            response.status(404).json({ message: "Could not find album by specified ID: " + id });
        } else {
            response.status(200).json(results[0]);
        }
    } catch (error) {
        response.status(500).json({ message: "Internal server error" });
    }
}

async function searchAlbums(request, response) {
    try {
        const searchValue = request.params.searchValue;
        const query = `
        SELECT
        Albums.title,
        Albums.year_of_release AS yearOfRelease,
        Albums.image,
        GROUP_CONCAT(DISTINCT Artists.name ORDER BY Artists.name ASC SEPARATOR ', ') AS Artists,
        GROUP_CONCAT(DISTINCT Tracks.title ORDER BY Tracks.title ASC SEPARATOR ', ') AS TracksOnAlbum
        FROM Albums
        LEFT JOIN Artists_Albums ON Albums.id = Artists_Albums.album_id
        LEFT JOIN Artists ON Artists_Albums.artist_id = Artists.id
        LEFT JOIN Albums_Tracks ON Albums.id = Albums_Tracks.album_id
        LEFT JOIN Tracks ON Albums_Tracks.track_id = Tracks.id
        WHERE albums.title LIKE ?
        GROUP BY Albums.title, Albums.year_of_release, Albums.image;
        `;
        const values = [`%${searchValue}%`];
        const [results, fields] = await connection.execute(query, values);
        if (results.length === 0 || !results) {
            response.status(404).json({message: `Could not find any albums with the requested search value: ${searchValue}`});
        } else {
            response.status(200).json(results);
        }
    } catch (error) {
        response.status(500).json({message: "Internal server error"});
    }
}

async function createAlbum(request, response) {
    //Request.body: title: string, yearOfRelease: int, image: string, artist: string | int
    const { title, yearOfRelease, image, artist } = request.body;
    let artistId;

    if (!artist || !title || !yearOfRelease || !image) {
        throw new Error("Missing required parameters");
    } else if (artist.match(/^\d+$/)) {
        // The artist parameter is a numeric string, convert it to a number
        artistId = parseInt(artist, 10);
    } else if (typeof artist === "string") {
        // Get artist id from name
        artistId = await getArtistsIDByName([artist]);
    } else {
        throw new Error("Invalid artist");
    }

    try {
        const values = [title, yearOfRelease, image];
        const query = "INSERT INTO albums(title, year_of_release, image) VALUES (?,?,?)";
        const [results] = await connection.execute(query, values);
        if (results.length === 0 || !results) {
            throw new Error("Could not create album");
        }
        const albumID = results.insertId;

        await createAlbumInTable("artists_albums", "artist_id", artistId, albumID, response);

        response.status(201).json({ message: "Album created" });
    } catch (error) {

        if (error.message) {
            response.status(400).json({ message: `${error.message}` });
        } else {
            response.status(500).json({ message: "Internal server error at createAlbum" });
        }
    }
}

async function createAlbumInTable(tableName, idColumnName, id, albumId) {
    console.log(id)
    try {
        const query = `INSERT INTO ${tableName}(${idColumnName}, album_id) VALUES (?, ?)`;
        if (!Array.isArray(id)) {
            const [results] = await connection.query(query, [id, albumId]);
            if (results.affectedRows === 0 || !results) {
                throw new Error(`Could not create album in ${tableName}`);
            } else {
                return;
            }
        }
        for (const itemID of id) {
            const values = [itemID, albumId];
            const [result] = await connection.query(query, values);
            if (result.affectedRows === 0 || !result) {
                throw new Error(`Could not create album in ${tableName}`);
            }
        }
    } catch (error) {
        throw error.message;
    }
}

async function updateAlbum(request, response) {
    try {
        const {title, yearOfRelease, image} = request.body;
        const id = request.params.id;
        const query = "UPDATE albums SET title = ?, year_of_release = ?, image = ? WHERE id = ?";
        const values = [title, yearOfRelease, image, id];
        const [results, fields] = await connection.execute(query, values);
        if (results.length === 0 || !results) {
            response.status(404).json({ message: `Could not find album by specified ID: ${id}` });
        } else {
            response.status(200).json(results[0]);
        }
    } catch (error) {
        response.status(500).json({ message: "Internal server error" });
    }
}

async function deleteAlbum(request, response) {
    const albumID = request.params.id;
    
    try {
        // find tracks associated with album
        const albumTracks = await getAssociatedIds("albums_tracks", "track_id", "album_id", albumID);
        if (albumTracks.length > 0) {
            // delete associations with tracks
            await deleteFromTable("albums_tracks", "album_id", albumID, response);
            // delete associations with artists
            await deleteFromTable("artists_tracks", "track_id", albumTracks, response);
            // delete tracks
            await deleteFromTable("tracks", "id", albumTracks, response);
        }
        // Delete associations with artists
        await deleteFromTable("artists_albums", "album_id", albumID, response);
        const query = "DELETE FROM albums WHERE id = ?";
        await connection.execute(query, [albumID]);

        response.status(204).json();
    } catch (error) {
        response.status(500).json({ message: "Internal server error in deleteAlbum" });
    }
}

async function getAllAlbumDataByAlbumID(request, response) {
    const albumId = request.params.id;
    if (!albumId) {
        response.status(400).json({ message: "Missing album ID" });
        return
    }
    try {
        let albumData = {};
        // get album data
        const albumQuery = "SELECT * FROM albums WHERE id = ?";
        const [albumResults] = await connection.execute(albumQuery, [albumId]);
        if (albumResults.length === 0 || !albumResults) {
            response.status(404).json({ message: `Could not find album by specified ID: ${albumId}` });
            return
        }
        albumData = albumResults[0];

        // get artist associated with album
        const albumArtists = await getAssociatedIds("artists_albums", "artist_id", "album_id", albumId);
        for (const artist of albumArtists) {
            const artistsQuery = "SELECT id, name FROM artists WHERE id = ?";
            const [artistsResults] = await connection.execute(artistsQuery, [artist]);
            console.log(artistsResults)
            if (artistsResults.length === 0 || !artistsResults) {
                response.status(404).json({ message: `Could not find artist by specified ID: ${artist}` });
                return
            }
            // add artist name and id to the album object
            albumData.artists = artistsResults;
        }

        // get tracks associated with album
        let tracks = [];
        const albumTracks = await getAssociatedIds("albums_tracks", "track_id", "album_id", albumId);
            for (const track of albumTracks) {
                const tracksQuery = "SELECT * FROM tracks WHERE id = ?";
                const [tracksResults] = await connection.execute(tracksQuery, [track]);
                if (tracksResults.length === 0 || !tracksResults) {
                    response.status(404).json({ message: `Could not find track by specified ID: ${track}` });
                    return
                }

                // get artists associated with tracks
                const trackArtists = await getAssociatedIds("artists_tracks", "artist_id", "track_id", track);
                for (const artist of trackArtists) {
                    const artistsQuery = "SELECT name FROM artists WHERE id = ?";
                    const [artistsResults] = await connection.execute(artistsQuery, [artist]);
                    if (artistsResults.length === 0 || !artistsResults) {
                        response.status(404).json({ message: `Could not find artist by specified ID: ${artist}` });
                        return
                    }
                    // add artist name and id to the track object
                    tracksResults[0].artists = artistsResults[0];
                }
                // add track as an object to tracks array
                tracks.push(tracksResults[0]);
            }

        // add tracks and artists to album data
        albumData.tracks = tracks;

        // send album data
        response.status(200).json(albumData);
    } catch (error) {
        response.status(500).json(error.message);
    }
}

export {
    getAllAlbums,
    getSingleAlbum,
    createAlbum,
    updateAlbum,
    deleteAlbum,
    getAllAlbumDataByAlbumID,
    searchAlbums
};