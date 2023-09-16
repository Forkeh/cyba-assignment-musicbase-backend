import connection from "../database/dbconfig.js";
import { getArtistsIDByName } from "../utils/utils.js";

async function getAllAlbums(request, response) {
    const query = "SELECT * FROM albums";

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
    const values = [artistsIdArr[0], request.body.albumID];
    
    connection.query(query, values, (error, results, fields) => {
        if (error) {
            console.log("error2");
            response.status(500).json({ message: "Internal server error" });
        } else {
            if (artistsIdArr.length > 1) {
                artistsIdArr.shift();
                updateAlbumsArtistsTable(request, response);
            } else {
                response.status(202).json(results);
            }
        }
    })
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

export { getAllAlbums, getSingleAlbum, createAlbum, updateAlbum, deleteAlbum, updateAlbumsArtistsTable };
