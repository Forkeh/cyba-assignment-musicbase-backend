import connection from "../database/dbconfig.js";
import { getArtistsIDByName } from "../utils/utils.js";

async function getAllAlbums(request, response) {
    const query = "SELECT Albums.title, Albums.year_of_release AS yearOfRelease, Albums.image FROM albums";

    connection.query(query, (error, results, fields) => {
        if (error) {
            response.status(500).json({ message: "Internal server error" });
        } else {
            if (!results) {
                response.status(404).json({ message: "Could not find any albums" });
            } else {
                response.status(200).json(results);
            }
        }
    });
}

async function searchAlbums(request, response) {
    const searchValue = request.params.searchValue;
    console.log(searchValue);
    const query = `
    SELECT
    Albums.title,
    Albums.year_of_release AS YearOfRelease,
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

    connection.query(query, values, (error, results, fields) => {
        if (error) {
            response.status(500).json({ message: "Internal server error" });
        } else {
            console.log('album search results:')
            console.log(results)
            if (results.length === 0 || !results) {
                response.status(404).json({ message: `Could not find any albums with the requested search value: ${searchValue}` });
            } else {
                response.status(200).json(results);
            }
        }
    })
}

async function getSingleAlbum(request, response) {
    const id = request.params.id;
    const query = "SELECT * FROM albums WHERE id = ?";
    const values = [id];

    connection.query(query, values, (error, results, fields) => {
        if (error) {
            response.status(500).json({ message: "Internal server error" });
        } else {
            if (!results[0]) {
                response.status(404).json({ message: "Could not find album by specified ID: " + id });
            } else {
                response.status(200).json(results[0]);
            }
        }
    });
}

async function createAlbum(request, response, next) {
    //Request.body består af et objekt med følgende properties: title STRING, duration INT, artists STRING ARR, albums STRING ARR
    const newAlbum = request.body;
    const values = [newAlbum.title, newAlbum.year_of_release, newAlbum.image];
    const query = "INSERT INTO albums (title, year_of_release, image) VALUES (?,?,?)";

    if (!newAlbum.artists) {
        response.status(400).json({ message: "Include artists" });
    } else {
        console.log(`Artists: ${newAlbum.artists}`);
        request.body.artistsID = await getArtistsIDByName(newAlbum.artists);
        console.log(request.body.artistsID);
    }

    connection.query(query, values, (error, results, fields) => {
        if (error) {
            console.log("error1");
            response.status(500).json({ message: "Internal server error" });
        } else {
            request.body.albumID = results.insertId;
            next();
            return;
        }
    });
}

async function updateAlbumsArtistsTable(request, response) {
    const query = `INSERT INTO artists_albums(artist_id, album_id) VALUES (?,?)`
    const artistsIdArr = request.body.artistsID;
    
    for (const artistID of artistsIdArr) {
        const values = [artistID, request.body.albumID];

        connection.query(query, values, (error, results, fields) => {
            if (error) {
                response.status(500).json({ message: "Internal server error" });
            } 
        });
    }
    
    response.status(204).json();
}

async function updateAlbum(request, response) {
    const updatedAlbum = request.body;
    const id = request.params.id;
    const values = [
        updatedAlbum.title,
        updatedAlbum.year_of_release,
        updatedAlbum.image,
        id,
    ];
    const query =
        "UPDATE albums SET title = ?, year_of_release = ?, image = ? WHERE id = ?";

    connection.query(query, values, (error, results, fields) => {
        if (error) {
            response.status(500).json({ message: "Internal server error" });
        } else {
            response.status(200).json(results);
        }
    });
}

async function deleteAlbum(request, response) {
    const id = request.params.id;
    const query = "DELETE FROM albums WHERE id = ?";

    connection.query(query, [id], (error, results, fields) => {
        if (error) {
            response.status(500).json({ message: "Internal server error" });
        } else {
            response.status(204).json();
        }
    });
}

async function getAllTracksByAlbumID(request, response) {
    const id = request.params.id;
    const values = [id];
    const query = `SELECT tracks.title AS 'title', tracks.duration AS 'duration' FROM tracks
    INNER JOIN albums_tracks ON tracks.id = albums_tracks.track_id
    INNER JOIN albums ON albums_tracks.album_id = albums.id
    WHERE album_id = ?;
    `;

    connection.query(query, values, (error, results, fields) => {
        if (error) {
            response.status(500).json({ message: "Internal server error" });
        } else {
            if (results.length) {
                response.status(200).json(results);
            } else {
                response.status(404).json({ message: `Could not find tracks with specified album with ID: ${id}` });
            }
        }
    })
} 

export {
    getAllAlbums,
    getSingleAlbum,
    createAlbum,
    updateAlbum,
    deleteAlbum,
    updateAlbumsArtistsTable,
    getAllTracksByAlbumID,
    searchAlbums
};