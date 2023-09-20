import connection from "../database/dbconfig.js";

async function getArtistsIDByName(artistNames) {
    const artistIdArr = [];
    const query = `SELECT id FROM artists WHERE name = ?`;

    for (const artistName of artistNames) {
        const values = [artistName];

        try {
            if (typeof artistName !== "string") {
                throw new Error("artist is not of type string")
            }

            const [rows, fields] = await connection.execute(query, values);
            if (rows.length > 0) {
                artistIdArr.push(rows[0].id);
            }
        } catch (error) {
            console.error(`Error getting artist ID for ${artistName}: ${error.message}`);
            throw error;
        }
    }
    return artistIdArr;
}

async function getAlbumsIDByName(albumNames) {
    const albumsIdArr = [];

    for (const albumName of albumNames) {
        const query = `SELECT id FROM albums WHERE title = ?`;
        const values = [albumName];

        try {
            const [rows, fields] = await connection.execute(query, values);
            if (rows.length > 0) {
                albumsIdArr.push(rows[0].id);
            }
        } catch (error) {
            console.error(`Error getting album ID for ${albumName}: ${error.message}`);
            throw error;
        }
    }
    return albumsIdArr;
}


async function searchAll(request, response) {
    try {
        const searchValue = request.params.searchValue;
        const query = `
        SELECT tracks.title AS name, 'track' AS type 
        FROM tracks 
        WHERE title LIKE ?
        UNION
        SELECT 
        albums.title AS name,'album' AS type 
        FROM albums 
        WHERE title LIKE ?
        UNION
        SELECT 
        artists.name AS name, 'artist' AS type 
        FROM artists 
        WHERE name LIKE ?;
        `;
        const values = [`%${searchValue}%`, `%${searchValue}%`, `%${searchValue}%`];
        const [results, fields] = await connection.execute(query, values);
            if (results.length === 0 || !results) {
                response.status(404).json({message: `Could not find any results with the requested search value: ${searchValue}`});
            } else {
                response.status(200).json(results);
            }
    } catch (error) {
        response.status(500).json({message: "Internal server error"});
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

export { getAlbumsIDByName, getArtistsIDByName, searchAll, deleteFromTable };
