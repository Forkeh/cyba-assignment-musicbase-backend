import connection from "../database/dbconfig.js";

async function getAllArtists(request, response) {
    const query = "SELECT * FROM artists";
    connection.query(query, (error, results, fields) => {
        if (error) {
            response.status(500).json({ message: "Internal server error" });
        } else {
            if (!results) {
                response.status(404).json({ message: "Could not find any artists"});
            } else {
                response.status(200).json(results);
            }
        }
    });
}

async function getSingleArtist(request, response) {
    const id = request.params.id;
    const query = "SELECT * FROM artists WHERE id = ?";
    const values = [id];

    connection.query(query, values, (error, results, fields) => {
        if (error) {
            response.status(500).json({ message: "Internal server error" });
        } else {
            if (!results[0]) {
                response.status(404).json({ message: "Could not find artist by specified ID: " + id });
            } else {
                response.status(200).json(results[0]);
            }
        }
    })
}

async function createArtist(request, response) {
    const newArtist = request.body;
    const query = "INSERT INTO artists(name,image) VALUES (?,?)";
    //!Default value virker ikke i sql databasen, når image er null. Fix det.
    const values = newArtist.image ? [newArtist.name, newArtist.image] : [newArtist.name];

    connection.query(query, values, (error, results, fields) => {
        if (error) {
            response.status(500).json({ message: "Internal server error" });
        } else {
            response.status(201).json(results);
        }
    });
}

async function updateArtist(request, response) {
    const id = request.params.id;
    const updatedArtist = request.body;
    const query = "UPDATE artists SET name = ?, image = ? WHERE id = ?";
    const values = [updatedArtist.name, updatedArtist.image, id];

    connection.query(query, values, (error, results, fields) => {
        if (error) {
            response.status(500).json({ message: "Internal server error" });
        } else {
            response.status(200).json(results);
        }
    });
}

async function deleteArtist(request, response) {
    const id = request.params.id;
    const query = "DELETE FROM artists WHERE id = ?";
    const values = [id];

    connection.query(query, values, (error, results, fields) => {
        if (error) {
            response.status(500).json({ message: "Internal server error" });
        } else {
            response.status(204).json();
        }
    })
}

async function getAllAlbumsByArtistName(request, response) {
    const searchValue = request.params.searchValue;
    const values = [`%${searchValue}%`];
    const query = `WITH previous_result AS (
    SELECT id AS id FROM artists WHERE name LIKE '%Y%')
    SELECT albums.title AS 'title', albums.year_of_release AS 'yearOfRelease', albums.image AS 'image', artists.name AS artist
    FROM albums
    INNER JOIN artists_albums ON albums.id = artists_albums.album_id
    INNER JOIN artists ON artists_albums.artist_id = artists.id
    INNER JOIN previous_result ON artists.id = previous_result.id;`;

    connection.query(query, values, (error, results, fields) => {
        if (error) {
            response.status(500).json({ message: "Internal server error" });
        } else {
            if (results.length) {
                response.status(200).json(results);
            } else {
                response.status(404).json({ message: `Could not find albums with specified artist with ID: ${id}` });
            }
        }
    })
}

async function searchArtists(request, response) {
    const searchValue = request.params.searchValue;
    const query = `SELECT name, image FROM artists WHERE name LIKE ?`
    const values = [`%${searchValue}%`]

    connection.query(query, values, (error, results, fields) => {
        if (error) {

        } else {
            if (results.length) {
                response.status(200).json(results);
            } else {
                response.status(404).json({ message: `Could not find artists with specified search value: ${searchValue}` });
            }
        }
    })
}



export {getSingleArtist, getAllArtists, createArtist, updateArtist, deleteArtist, getAllAlbumsByArtistName, searchArtists }

