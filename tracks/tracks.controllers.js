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
        } else {
            res.json(results);
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
        } else {
            res.json(results[0]);
        }
    });
}

export { getAllTracks, getSingleTrack };
