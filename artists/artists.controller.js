import connection from "../database/dbconfig.js";

async function getAllArtists(request, response) {
    try {
        const query = "SELECT * FROM artists";
        const [results, fields] = await connection.execute(query);
        response.status(200).json(results);
    }
    catch (error) {
        response.status(500).json({ message: "Internal server error" });
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
        response.status(500).json({ message: "Internal server error" });
    }
}

async function createArtist(request, response) {
    try {
        const {name, image} = request.body;
        const query = "INSERT INTO artists(name, image) VALUES (?,?)";
        const values = [name, image];
        const [results, fields] = await connection.execute(query, values);
        if (results.length === 0 || !results) {
            response.status(404).json({ message: `Could not create artist` });
        } else {
            response.status(201).json(results[0].insertId);
        }
    } catch (error) {
        response.status(500).json({ message: "Internal server error" });
    }
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

//TODO: DER SKAL OGSÅ SLETTES I JUNCTION-TABLES!!
async function deleteArtist(request, response) {
    try {
        const id = request.params.id;
        const query = "DELETE FROM artists WHERE id = ?";
        const values = [id];
        const [results, fields] = await connection.execute(query, values);
        if (results.length === 0 || !results) {
            response.status(404).json({ message: `Could not find artist by specified ID: ${id}` });
        } else {
            response.status(204).json();
        }
    } catch (error) {
        response.status(500).json({ message: "Internal server error" });
    }
}


async function getAllAlbumsByArtistName(request, response) {
    const searchValue = request.params.searchValue;
    const query = `WITH previous_result AS (
    SELECT id AS id FROM artists WHERE name LIKE '%Y%')
    SELECT albums.title AS 'title', albums.year_of_release AS 'yearOfRelease', albums.image AS 'image', artists.name AS artist
    FROM albums
    INNER JOIN artists_albums ON albums.id = artists_albums.album_id
    INNER JOIN artists ON artists_albums.artist_id = artists.id
    INNER JOIN previous_result ON artists.id = previous_result.id;`;
    const values = [`%${searchValue}%`];

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
    const query = `
    SELECT
    Artists.name,
    Artists.image,
    GROUP_CONCAT(DISTINCT Albums.title ORDER BY Albums.title ASC SEPARATOR ', ') AS Albums,
    GROUP_CONCAT(DISTINCT Tracks.title ORDER BY Tracks.title ASC SEPARATOR ', ') AS Tracks
    FROM Artists
    LEFT JOIN Artists_Albums ON Artists.id = Artists_Albums.artist_id
    LEFT JOIN Albums ON Artists_Albums.album_id = Albums.id
    LEFT JOIN Artists_Tracks ON Artists.id = Artists_Tracks.artist_id
    LEFT JOIN Tracks ON Artists_Tracks.track_id = Tracks.id
    WHERE name LIKE ?
    GROUP BY Artists.name, Artists.image; 
    `
    const values = [`%${searchValue}%`]

    connection.query(query, values, (error, results, fields) => {
        if (error) {
            response.status(500).json({ message: "Internal server error" });
        } else {
            if (results.length === 0 || !results) {
                response.status(404).json({ message: `Could not find artists with specified search value: ${searchValue}` });
            } else {
                response.status(200).json(results);
            }
        }
    })
}



export {getSingleArtist, getAllArtists, createArtist, updateArtist, deleteArtist, getAllAlbumsByArtistName, searchArtists }

