import connection from "../database/dbconfig.js";

async function getArtistsIDByName(artistNames) {
    const artistIdArr = [];

    for (const artistName of artistNames) {
        const query = `SELECT id FROM artists WHERE name = ?`;
        const values = [artistName];

        connection.query(query, values, (error, results) => {
            if (error) {
                response.status(500).json({ message: "Error with getting artist ID" });
            } else {
                artistIdArr.push(results[0].id);
            }
        });
    }

    return artistIdArr;
}

async function getAlbumsIDByName(albumNames) {
    const albumsIdArr = [];

    for (const albumName of albumNames) {
        const query = `SELECT id FROM albums WHERE title = ?`;
        const values = [albumName];

        connection.query(query, values, (error, results) => {
            if (error) {
                response.status(500).json({ message: "Error with getting album ID" });
            } else {
                albumsIdArr.push(results[0].id);
            }
        });
    }

    return albumsIdArr;
}

async function searchAll(request, response) {
    const searchValue = request.params.searchValue;
    const query = `SELECT tracks.title AS name, 'track' AS type FROM tracks WHERE title LIKE ?
    UNION
    SELECT albums.title AS name,'album' AS type FROM albums WHERE title LIKE ?
    UNION
    SELECT artists.name AS name, 'artist' AS type FROM artists WHERE name LIKE ?;`;
    const values = [`%${searchValue}%`, `%${searchValue}%`, `%${searchValue}%`];
    
    connection.query(query, values, (error, results, fields) => {
        if (error) {
            console.log(error);
            response.status(500).json({ message: "Server error with searching all" });
        } else {
            if (!results) {
                response.status(404).json({ message: "Could not find any match" });
            } else {
                response.status(200).json(results);
            }
        }
    })
}

export { getAlbumsIDByName, getArtistsIDByName, searchAll };
