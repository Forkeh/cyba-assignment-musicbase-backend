import { query } from "express";
import connection from "../database/dbconfig.js";

async function getAllTracks(req, res) {
    const query = `SELECT tracks.title, tracks.duration, 
    GROUP_CONCAT(artists.name ORDER BY artists.name ASC SEPARATOR ', ') AS artists
    FROM tracks
    INNER JOIN artists_tracks ON tracks.id = artists_tracks.track_id
    INNER JOIN artists ON artists_tracks.artist_id = artists.id
    GROUP BY tracks.title, tracks.duration;
    `;

    connection.query(query, (err, results, fields) => {
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

    const query = `SELECT tracks.title, tracks.duration, 
    GROUP_CONCAT(artists.name ORDER BY artists.name ASC SEPARATOR ', ') AS artists
    FROM tracks
    INNER JOIN artists_tracks ON tracks.id = artists_tracks.track_id
    INNER JOIN artists ON artists_tracks.artist_id = artists.id
    WHERE tracks.id = ?
    GROUP BY tracks.title, tracks.duration;
    `;

    connection.query(query, values, (err, results, fields) => {
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
    const values = [`%${searchValue}%`];

    const query = `SELECT * FROM tracks WHERE title LIKE ?`;

    connection.query(query, values, (err, results, fields) => {
        if (err) {
            res.status(500).json({ message: "Internal server error" });
        } else {
            //! Den kommer aldrig ned i 404. Tror heller ikke searchArtists() eller SearchAlbums() gør. FIX DET!
            if (results.length === 0) {
                console.log("tomt array");
                res.status(404).json({
                    message:
                        "Could not find any tracks with the requested search value: " +
                        searchValue,
                });
            } else {
                console.log("results");
                res.status(200).json(results);
            }
        }
    });
}

async function deleteTrackFromAlbumsTracks(req, res, next) {
    const id = req.params.id;
    const values = [id];

    const query = `DELETE FROM albums_tracks WHERE track_id = ?`;

    connection.query(query, values, (err, results, fields) => {
        if (err) {
            res.status(500).json({ message: "Internal server error" });
        } else {
            next();
            return;
        }
    });
}

async function deleteTrackFromArtistsTracks(req, res, next) {
    const id = req.params.id;
    const values = [id];

    const query = `DELETE FROM artists_tracks WHERE track_id = ?`;

    connection.query(query, values, (err, results, fields) => {
        if (err) {
            res.status(500).json({ message: "Internal server error" });
        } else {
            next();
            return;
        }
    });
}

async function deleteTrack(req, res) {
    const id = req.params.id;
    const values = [id];

    const query = `DELETE FROM tracks WHERE id = ?`;

    connection.query(query, values, (err, results, fields) => {
        if (err) {
            res.status(500).json({ message: "Internal server error" });
        } else {
            res.status(204).json();
        }
    });
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
    deleteTrackFromAlbumsTracks,
    deleteTrackFromArtistsTracks,
    updateTrack,
    searchTracks,
};
