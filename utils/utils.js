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

export { getAlbumsIDByName, getArtistsIDByName };
