import connection from "../database/dbconfig.js";
import {getAlbumsIDByName, getArtistsIDByName} from "../utils/utils.js";

const getQuery = `
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
    GROUP BY Tracks.title, Tracks.duration;
    `;

async function getAllTracks(req, res) {
    connection.query(getQuery, (err, results, fields) => {
        if (err) {
            console.log(err);
            res.status(500).json({ message: "Internal server error" });
        } else {
            res.status(200).json(results);
        }
    });
}

async function getSingleTrack(req, res) {
    const id = req.params.id;
    const values = [id];

    connection.query(getQuery, values, (err, results, fields) => {
        if (err) {
            console.log(err);
            res.status(500).json({ message: "Internal server error" });
        } else {
            res.status(200).json(results[0]);
        }
    });
}

async function searchTracks(req, res) {
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
    connection.query(query, values, (err, results, fields) => {
        if (err) {
            res.status(500).json({ message: "Internal server error" });
        } else {
            if (results.length === 0) {
                res.status(404).json({ message: `Could not find any tracks with the requested search value: ${searchValue}` });
            } else {
                console.log("results");
                res.status(200).json(results);
            }
        }
    });
}

// async function deleteTrackFromAlbumsTracks(req, res, next) {
//     const id = req.params.id;
//     const values = [id];
//
//     const query = `DELETE FROM albums_tracks WHERE track_id = ?`;
//
//     connection.query(query, values, (err, results, fields) => {
//         if (err) {
//             res.status(500).json({ message: "Internal server error" });
//         } else {
//             next();
//             return;
//         }
//     });
// }
//
// async function deleteTrackFromArtistsTracks(req, res, next) {
//     const id = req.params.id;
//     const values = [id];
//
//     const query = `DELETE FROM artists_tracks WHERE track_id = ?`;
//
//     connection.query(query, values, (err, results, fields) => {
//         if (err) {
//             res.status(500).json({ message: "Internal server error" });
//         } else {
//             next();
//             return;
//         }
//     });
// }
//
// async function deleteTrack(req, res) {
//     const id = req.params.id;
//     const values = [id];
//     const query = `DELETE FROM tracks WHERE id = ?`;
//
//     connection.query(query, values, (err, results, fields) => {
//         if (err) {
//             res.status(500).json({ message: "Internal server error" });
//         } else {
//             res.status(204).json();
//         }
//     });
// }
//
// async function createTrack(request, response, next) {
//     //Request.body består af et objekt med følgende properties: title STRING, duration INT, artists STRING ARR, albums STRING ARR
//     const newTrack = request.body;
//
//     if (!newTrack.artists || !newTrack.albums ) {
//         response.status(400).json({ message: "Include artists and/or albums" });
//         return
//     } else {
//         console.log(`Artists: ${newTrack.artists}`);
//         console.log(`Albums: ${newTrack.albums}`);
//         request.body.artistsID = await getArtistsIDByName(newTrack.artists);
//         request.body.albumsID = await getAlbumsIDByName(newTrack.albums);
//         console.log(request.body.artistsID);
//         console.log(request.body.albumsID);
//     }
//
//     const query = `INSERT INTO tracks(title, duration) VALUES (?, ?)`;
//     const values = [newTrack.title, newTrack.duration];
//
//     connection.query(query, values, (error, results, fields) => {
//         if (error) {
//             response.status(500).json({ message: "Internal server error at createTrack" });
//         } else {
//             request.body.trackID = results.insertId;
//             next();
//             return;
//         }
//     });
// }
//
// async function CreateTrackInAlbumsTracks(request, response, next) {
//     const trackID = request.body.trackID;
//     const albumsIdArr = request.body.albumsID;
//     const query = `INSERT INTO albums_tracks(album_id, track_id) VALUES (?,?)`;
//
//     for (const albumID of albumsIdArr) {
//         const values = [albumID, trackID];
//
//         connection.query(query, values, (error, results, fields) => {
//             if (error) {
//                 response.status(500).json({ message: "Internal server error at middleware CreateTrackInAlbumsTracks" });
//             }
//         });
//     }
//
//     next();
//     return;
// }
//
// async function CreateTrackInArtistsTracks(request, response) {
//     const trackID = request.body.trackID;
//     const artistsIdArr = request.body.artistsID;
//     const query = `INSERT INTO artists_tracks(artist_id, track_id) VALUES (?,?)`;
//
//     for (const artistID of artistsIdArr) {
//         const values = [artistID, trackID];
//
//         connection.query(query, values, (error, results, fields) => {
//             if (error) {
//                 response.status(500).json({ message: "Internal server error at middleware CreateTrackInArtistsTracks" });
//             }
//         });
//     }
//
//     response.status(204).json();
// }

async function createTrack(request, response) {
    const {artists, albums, title, duration} = request.body;

    if (!artists || !albums) {
        response.status(400).json({ message: "Include artists and/or albums" });
        return;
    }

    try {
        // Create the track in the "tracks" table
        const query = `INSERT INTO tracks(title, duration) VALUES (?, ?)`;
        const values = [title, duration];
        const result = await connection.execute(query, values);
        const trackId = result[0].insertId;

        // Associate the track with artists and albums
        const artistsId = await getArtistsIDByName(artists);
        const albumsId = await getAlbumsIDByName(albums);

        // Call the function to create associations
        await createTrackInTable("artists_tracks", "artist_id", artistsId, trackId, response);
        await createTrackInTable("albums_tracks", "album_id", albumsId, trackId, response);

        response.status(201).json({ message: "Track created"});
    } catch (error) {
        response.status(500).json({ message: "Internal server error at createTrack" });
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

    try {
        // Delete the track from the "tracks" table
        const query = `DELETE FROM tracks WHERE id = ?`;
        const values = [id];
        await connection.query(query, values);

        // Delete associations with artists and albums
        await deleteFromTable("artists_tracks", "track_id", id, res);
        await deleteFromTable("albums_tracks", "track_id", id, res);

        res.status(204).json();
    } catch (error) {
        res.status(500).json({ message: "Internal server error at deleteTrack" });
    }
}


async function deleteFromTable(tableName, columnName, id, res) {
    try {
        const query = `DELETE FROM ${tableName} WHERE ${columnName} = ?`;
        const values = [id];
        await connection.query(query, values);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}

//Update track

async function updateTrack(req, res) {
    const id = req.params.id;
    const updatedTrack = req.body;
    const values = [updatedTrack.title, updatedTrack.duration, id];

    const query = `UPDATE tracks SET title = ?, duration = ? WHERE id = ?`;

    connection.query(query, values, (err, results, fields) => {
        if (err) {
            res.status(500).json({ message: "Internal server error" });
        } else {
            res.status(200).json(results);
        }
    });
}

export {
    getAllTracks,
    getSingleTrack,
    deleteTrack,
    // deleteTrackFromAlbumsTracks,
    // deleteTrackFromArtistsTracks,
    updateTrack,
    searchTracks,
    createTrack
    // CreateTrackInAlbumsTracks,
    // CreateTrackInArtistsTracks
};
