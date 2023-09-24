import connection from "../database/dbconfig.js";
import {createArtistAsync} from "../utils/createEverything.js";
import {
    deleteFromAlbumsTracksTable,
    deleteFromTable,
    deleteOrphanedRecords,
    getAlbumsByArtistId,
    getArtistsIDByName,
    getAssociatedIds
} from "../utils/utils.js";

async function getAllArtists(request, response) {
    try {
        const query = "SELECT * FROM artists";
        const [results, fields] = await connection.execute(query);
        response.status(200).json(results);
    }
    catch (error) {
        response.status(500).json({ message: "Internal server error while getting all artists" });
    }
}

async function getSingleArtist(request, response) {
    try {
        const id = request.params.id;
        const query = "SELECT * FROM artists WHERE id = ?";
        const values = [id];
        const [results, fields] = await connection.execute(query, values);
        if (results.length === 0) {
            response.status(404).json({ message: `Could not find artist by specified ID: ${id}` });
        } else {
            response.status(200).json(results[0]);
        }
    }
    catch (error) {
        response.status(500).json({ message: "Internal server error while getting artists by id" });
    }
}

async function createArtistEndpoint(request, response) {
    try {
        const artist = request.body;
        const artistId = await createArtistAsync(artist);

        if (artistId) {
            response.status(201).json(artistId);
        } else {
            response.status(404).json({ message: "Could not create artist" });
        }
    } catch (error) {
        response.status(500).json({ message: "Internal server error" });
    }
}


async function updateArtist(request, response) {
    try {
        const {name, image} = request.body;
        const id = request.params.id;
        const query = "UPDATE artists SET name = ?, image = ? WHERE id = ?";
        const values = [name, image, id];
        const [results, fields] = await connection.execute(query, values);
        if (results.length === 0 || !results) {
            response.status(404).json({ message: `Could not find artist by specified ID: ${id}` });
        } else {
            response.status(200).json(results);
        }
    } catch (error) {
        response.status(500).json({ message: "Internal server error while updating artist" });
    }
}

async function deleteArtist(request, response) {
    const artistId = request.params.id;
    console.log(artistId)
    try {
        // Get album IDs and track IDs associated with the artist
        const albumIds = await getAssociatedIds("artists_albums", "album_id", "artist_id", artistId);
        const trackIds = await getAssociatedIds("artists_tracks", "track_id", "artist_id", artistId);
        if (albumIds.length === 0 && trackIds.length === 0) {
            await removeArtist(artistId, response);
            return;
        }
        // Delete associations with tracks and albums
        await deleteFromTable("artists_albums", "artist_id", artistId);
        await deleteFromTable("artists_tracks", "track_id", trackIds);
        await deleteFromAlbumsTracksTable(albumIds, trackIds);

        // Delete orphaned albums and tracks
        await deleteOrphanedRecords("albums", "album_id", albumIds);
        await deleteOrphanedRecords("tracks", "track_id", trackIds);

        // Delete the artist
        await removeArtist(artistId, response);

    } catch (error) {
        response.status(500).json({ message: "Internal server error - failed deleting " });
    }
}

async function getAllAlbumsByArtist(req, res) {
    let artistId;

    if (req.params.artist.match(/^\d+$/)) {
        // The artist parameter is a numeric string, convert it to a number
        artistId = parseInt(req.params.artist, 10);
    } else if (typeof req.params.artist === 'string') {
        // Get artist id from name
        artistId = await getArtistsIDByName([req.params.artist]);
    } else {
        res.status(400).json({ message: "Invalid artist" });
    }

    try {
        // Call the reusable function to get albums by artistId
        const albums = await getAlbumsByArtistId(artistId);

        res.status(200).json(albums);
    } catch (error) {
        res.status(500).json({ message: "Internal server error while getting albums from specific artist" });
    }
}

async function searchArtists(request, response) {
    try {
        let searchResults = [];

        const searchValue = request.params.searchValue;
        if ( !searchValue) {
            response.status(400).json({ message: "no search value" });
            return;
        }

        const query = `SELECT * FROM Artists WHERE name LIKE ? `
        const values = [`%${searchValue}%`]
        const [results] = await connection.execute(query, values);

        const artists = [];
        const artistIds = [];
        for (const result of results) {
            artists.push(result);
        }
        if (artists.length === 0 || !artists) {
            response.status(404).json({ message: `Search value: ${searchValue} did not result in any matches` });
        } else {
                for (const artist of artists) {
                    const albums = await getAlbumsByArtistId(artist.id);
                    const artistObject = {
                        id: artist.id,
                        name: artist.name,
                        image: artist.image,
                        albums: albums
                    }
                searchResults.push(artistObject);
                }
        }
        response.status(200).json(searchResults);
    } catch (error) {
        response.status(500).json({ message: "Internal server error" });
    }
}

async function removeArtist(artistId, response) {
    const query = "DELETE FROM artists WHERE id = ?";
    const values = [artistId];
    const [results, fields] = await connection.execute(query, values);
    if (results.affectedRows === 0) {
        response.status(404).json({ message: `Could not find artist by specified ID: ${artistId}` });
    } else {
        response.status(200).json({ message: `Successfully deleted artist with ID: ${artistId}` });
    }
}

export {getSingleArtist, getAllArtists, createArtistEndpoint, updateArtist, deleteArtist, getAllAlbumsByArtist, searchArtists }

