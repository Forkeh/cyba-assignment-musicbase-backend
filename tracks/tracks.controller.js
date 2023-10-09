import connection from "../database/dbconfig.js";
import {getAlbumsIDByName, getArtistsIDByName, getIdsByNameOrID} from "../utils/utils.js";
import { deleteFromTable } from "../utils/utils.js";


async function getAllTracks(req, res) {
    try {
        const query = `
        SELECT
        Tracks.id AS id,
        Tracks.title,
        Tracks.duration,
        GROUP_CONCAT(DISTINCT Artists.name ORDER BY Artists.name ASC SEPARATOR ', ') AS artists,
        GROUP_CONCAT(DISTINCT Albums.title ORDER BY Albums.title ASC SEPARATOR ', ') AS albums
        FROM Tracks
        LEFT JOIN Artists_Tracks ON Tracks.id = Artists_Tracks.track_id
        LEFT JOIN Artists ON Artists_Tracks.artist_id = Artists.id
        LEFT JOIN Albums_Tracks ON Tracks.id = Albums_Tracks.track_id
        LEFT JOIN Albums ON Albums_Tracks.album_id = Albums.id
        GROUP BY Tracks.title, Tracks.duration;
        `;
        const [results, fields] = await connection.execute(query);
        if (results.length === 0 || !results) {
            res.status(404).json({ message: "Could not find any tracks" });
        } else {
        res.status(200).json(results);
        }
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}

async function getSingleTrack(req, res) {
    try {
        const id = req.params.id;
        const query = "SELECT * FROM tracks WHERE id = ?";
        const values = [id];
        const [results, fields] = await connection.execute(query, values);
        if (results.length === 0 || !results) {
            res.status(404).json({ message: "Could not find track by specified ID: " + id });
        } else {
            res.status(200).json(results[0]);
        }
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}

async function searchTracks(req, res) {
    try {
        const searchValue = req.params.searchValue;
        const query = `
        SELECT
        Tracks.title,
        Tracks.duration,
        GROUP_CONCAT(DISTINCT Artists.name ORDER BY Artists.name ASC SEPARATOR ', ') AS artists,
        GROUP_CONCAT(DISTINCT Albums.title ORDER BY Albums.title ASC SEPARATOR ', ') AS albums
        FROM Tracks
        LEFT JOIN Artists_Tracks ON Tracks.id = Artists_Tracks.track_id
        LEFT JOIN Artists ON Artists_Tracks.artist_id = Artists.id
        LEFT JOIN Albums_Tracks ON Tracks.id = Albums_Tracks.track_id
        LEFT JOIN Albums ON Albums_Tracks.album_id = Albums.id
        WHERE Tracks.title LIKE ?
        GROUP BY Tracks.title, Tracks.duration;
        `;
        const values = [`%${searchValue}%`];

        const [results, fields] = await connection.execute(query, values);
        if (results.length === 0 || !results) {
            res.status(404).json({ message: `Could not find any tracks with the requested search value: ${searchValue}` });
        } else {
            res.status(200).json(results);
        }
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}

async function createTrack(request, response) {
    const { title, duration, artists, albums } = request.body;

    if (!artists || artists.length === 0 || !albums || albums.length === 0) {
        throw new Error("Artists and albums must be provided");
    }

    // Ensure artists and albums are always arrays
    const artistsArray = Array.isArray(artists) ? artists : [artists];
    const albumsArray = Array.isArray(albums) ? albums : [albums];

    // Get IDs for artists and albums using the utility function
    const artistsId = await getIdsByNameOrID(artistsArray, "artists");
    const albumsId = await getIdsByNameOrID(albumsArray, "albums");
    console.log("artistsId and albumsId")
    console.log(artistsId)
    console.log(albumsId)

    try {
        // Create the track in tracks table
        const query = `INSERT INTO tracks(title, duration) VALUES (?, ?)`;
        const values = [title, duration];
        const [result] = await connection.execute(query, values);
        const trackId = result.insertId;

        // Call the function to create associations
        await createTrackInTable("artists_tracks", "artist_id", artistsId, trackId, response);
        await createTrackInTable("albums_tracks", "album_id", albumsId, trackId, response);

        response.status(201).json({ message: "Track created" });
    } catch (error) {
        if (error.message) {
            response.status(400).json({ message: `${error.message}` });
        } else {
            response.status(500).json({ message: "Internal server error at createTrack" });
        }
    }
}
async function createTrackInTable(tableName, idColumnName, id, trackId, res) {
    try {
        const query = `INSERT INTO ${tableName}(${idColumnName}, track_id) VALUES (?, ?)`;
        for (const itemID of id) {
            const values = [itemID, trackId];
            await connection.query(query, values);
        }
    } catch (error) {
        res.status(500).json({ message: `Internal server error at CreateTrackIn${tableName}` });
    }
}

async function deleteTrack(req, res) {
    const id = req.params.id;
    if (!id) {
        throw new Error("Track ID must be provided");
    }

    // check if track exists in the database
    const query = `SELECT * FROM tracks WHERE id = ?`;
    const [results] = await connection.execute(query, [id]);
    if (results.length === 0 || !results) {
        res.status(404).json({ message: `Could not find track by specified ID: ${id}` });
        return;
    }

    try {
        // Delete associations with artists and albums
        await deleteFromTable("artists_tracks", "track_id", id);
        await deleteFromTable("albums_tracks", "track_id", id);

        // Delete the track from the "tracks" table
        const query = `DELETE FROM tracks WHERE id = ?`;
        const values = [id];
        await connection.query(query, values);

        res.status(204).json();
    } catch (error) {
        if (error.message) {
            res.status(400).json({ message: `${error.message}` });
            return;
        }
        res.status(500).json({ message: "Internal server error at deleteTrack" });
    }
}


//Update track
async function updateTrack(req, res) {
    try {
    const id = req.params.id;
    const updatedTrack = req.body;
    const values = [updatedTrack.title, updatedTrack.duration, id];
    const query = `UPDATE tracks SET title = ?, duration = ? WHERE id = ?`;
    const [results, fields] = await connection.query(query, values);
        if (results.length === 0 || !results) {
            res.status(404).json({ message: `Could not find track by specified ID: ${id}` });
        } else {
            res.status(200).json(results);
        }
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}

export {
    getAllTracks,
    getSingleTrack,
    deleteTrack,
    updateTrack,
    searchTracks,
    createTrack
};
