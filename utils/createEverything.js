import connection from "../database/dbconfig.js";

async function createAllAtOnce(req, res) {
    let { artists, album, tracks } = req.body;

    try {
        if (!artists || artists.length === 0 || !album || !tracks || tracks.length === 0) {
            res.status(400).json({ message: "Missing or empty values in artists, album, or tracks" });
            return;
        }
        // handle artists
        album.artistIDArr = await getArtistIDs(artists);
        // handle album
        const albumId = await createAlbum(album);

        // handle tracks
        for (const track of tracks) {
            if (typeof track === "object") {
                track.albumID = albumId;
                await createTrack(track);
            } else {
                throw new Error("Invalid track data: track is not an object");
            }
        }
        res.status(201).json({ message: "Artists, album, and tracks created" });
    } catch (error) {
        console.error("Error:", error); // Log the error for debugging purposes
        res.status(500).json({ message: "Internal server error" });
    }
}

// utils
async function createArtistAsync(artist) {
    try {
        const { name, image } = artist;

        if (!name || !image) {
            throw new Error("artist object is missing properties");
        }

        const query = "INSERT INTO artists(name, image) VALUES (?, ?)";
        const values = [name, image];
        const [results] = await connection.execute(query, values);

        if (results.affectedRows > 0) {
            return results.insertId;
        } else {
            throw new Error("Failed to create artist");
        }
    } catch (error) {
        console.error(error);
        throw error
    }
}

async function getArtistIDs(artists) {
    const artistsIdsArr = [];

    for (const artist of artists) {
        if (typeof artist === "string") {
            const artistID = await getArtistsIDByName(artist);
            artistsIdsArr.push(artistID);
        } else if (typeof artist === "object") {
            const artistID = await createArtistAsync(artist);
            artistsIdsArr.push(artistID);
        } else {
            throw new Error("artist is not a string or an object");
        }
    }
    return artistsIdsArr;
}

async function getArtistsIDByName(artistName) {
    const query = `SELECT id FROM artists WHERE name = ?`;
    const values = [artistName];

    try {
        const [results] = await connection.execute(query, values);
        if (results.length > 0) {
            return results[0].id;
        }
    } catch (error) {
        console.error(`Error getting artist ID for ${artistName}: ${error.message}`);
        throw error;
    }
}

async function createAlbum(album) {
    const { title, yearOfRelease, image, artistIDArr } = album;
    if (!artistIDArr || artistIDArr.length === 0) {
        throw new Error("album object is missing artistIDs in properties");
    }

    try {
        const values = [title, yearOfRelease, image];
        const query = "INSERT INTO albums(title, year_of_release, image) VALUES (?,?,?)";
        const [results] = await connection.execute(query, values);
        const albumID = results.insertId;

        await createAlbumInTable("artists_albums", "artist_id", artistIDArr, albumID);

        return albumID;
    } catch (error) {
        if (error.message) {
            return error.message;
        } else {
            return { error: "Internal server error at createAlbum" };
        }
    }
}

async function createAlbumInTable(tableName, idColumnName, id, albumId) {
    try {
        const query = `INSERT INTO ${tableName}(${idColumnName}, album_id) VALUES (?, ?)`;
        for (const itemID of id) {
            const values = [itemID, albumId];
            await connection.query(query, values);
        }
    } catch (error) {
        throw error;
    }
}

async function createTrackInTable(tableName, idColumnName, id, trackId) {
    try {
        const query = `INSERT INTO ${tableName}(${idColumnName}, track_id) VALUES (?, ?)`;
        for (const itemID of id) {
            const values = [itemID, trackId];
            await connection.query(query, values);
        }
    } catch (error) {
        // return { error: `Could not create junction table for track in ${tableName}` };
        throw error;
    }
}

async function createTrack(track) {
    try {
        const { title, duration, artists, albumID } = track;

        if (!title || !duration || !artists || !albumID) {
            throw new Error("track object is missing properties");
        }

        const artistsIdsArr = await getArtistIDs(artists);
        let trackID = await validateIfTrackExists(track);

        if (trackID) {
            // track already exists
            await createTrackInTable("albums_tracks", "album_id", [albumID], trackID);
        } else {
            // create track
            const query = /*sql*/ `INSERT INTO tracks(title, duration) VALUES (?,?)`;
            const values = [title, duration];
            const [result] = await connection.execute(query, values);
            trackID = result.insertId;

            // call the function to create associations
            await createTrackInTable("artists_tracks", "artist_id", artistsIdsArr, trackID);
            await createTrackInTable("albums_tracks", "album_id", [albumID], trackID);
        }
    } catch (error) {
        throw error;
    }
}

async function validateIfTrackExists(track) {
    const { title, duration } = track;
    const query = /*sql*/ `SELECT id FROM tracks WHERE title = ? AND duration = ?`;
    const values = [title, duration];
    const [results] = await connection.execute(query, values);

    if (results.length > 0) {
        // If a matching track is found, return its ID
        return results[0].id;
    }
    // If no matching track is found, return null
    return null;
}

export { createAllAtOnce, createArtistAsync };
