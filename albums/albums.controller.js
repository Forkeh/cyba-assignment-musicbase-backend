import connection from "../database/dbconfig.js";

async function getAllAlbums(request, response) {
    const query = "SELECT * FROM albums";

    connection.query(query, (error, results, fields) => {
        if (error) {
            console.log(error);
        } else {
            response.json(results);
        }
    });
}

async function getSingleAlbum(request, response) {
    const id = request.params.id;
    const query = "SELECT * FROM albums WHERE id = ?";
    const values = [id];

    connection.query(query, values, (error, results, fields) => {
        if (error) {
            console.log(error);
        } else {
            response.json(results[0]);
        }
    });
}

async function createAlbum(request, response) {
    const newAlbum = request.body;

    const values = [newAlbum.title, newAlbum.year_of_release, newAlbum.image];

    const query =
        "INSERT INTO albums (title, year_of_release, image) VALUES (? ,? ,?)";

    connection.query(query, values, (error, results, fields) => {
        if (error) {
            console.log(error);
        } else {
            response.json(results);
        }
    });
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
            console.log(error);
        } else {
            response.json(results);
        }
    });
}

async function deleteAlbum(request, response) {
    const id = request.params.id;
    const query = "DELETE FROM albums WHERE id = ?";

    connection.query(query, [id], (error, results, fields) => {
        if (error) {
            console.log(error);
        } else {
            response.json(results);
        }
    });
}

export { getAllAlbums, getSingleAlbum, createAlbum, updateAlbum, deleteAlbum };
