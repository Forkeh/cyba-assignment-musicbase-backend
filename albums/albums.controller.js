import connection from "../database/dbconfig.js";

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

async function searchAlbums(request, response) {
    const searchValue = request.params.searchValue;
    console.log(searchValue);
    const query = `SELECT title, year_of_release AS yearOfRelease, image FROM albums
    WHERE title LIKE ?`;
    const values = [`%${searchValue}%`];

    connection.query(query, values, (error, results, fields) => {
        if (error) {
            response.status(500).json({ message: "Internal server error" });
        } else {
            if (!results) {
                response.status(404).json({ message: "Could not find any albums" });
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

async function createAlbum(request, response) {
    const newAlbum = request.body;

    const values = [newAlbum.title, newAlbum.year_of_release, newAlbum.image];

    const query =
        "INSERT INTO albums (title, year_of_release, image) VALUES (? ,? ,?)";

    connection.query(query, values, (error, results, fields) => {
        if (error) {
            response.status(500).json({ message: "Internal server error" });
        } else {
            response.status(201).json(results);
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

export { getAllAlbums, getSingleAlbum, createAlbum, updateAlbum, deleteAlbum, searchAlbums };
