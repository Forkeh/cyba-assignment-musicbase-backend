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
    const newAlbum = request.body;
    
    const values = [newAlbum.title, newAlbum.year_of_release, newAlbum.image];
    
    const query = "INSERT INTO albums (title, year_of_release, image) VALUES (?,?,?)";
    
    
    
    
    connection.query(query, values, (error, results, fields) => {
        if (error) {
            console.log("error1");
            response.status(500).json({ message: "Internal server error" });
        } else {
            
            request.body.albumID = results.insertId;
            next()
            return
            // updateAlbumsArtistsTable(albumID, artistsArr);
        }
    });
}

async function updateAlbumsArtistsTable(request, response) {
    const query = `INSERT INTO artists_albums(artist_id, album_id) VALUES (?,?)`
    const artistsArr = request.body.artists;
    const values = [artistsArr[0], request.body.albumID];
    
    connection.query(query, values, (error, results, fields) => {
        if (error) {
            console.log("error2");
            response.status(500).json({ message: "Internal server error" });
        } else {
            if (artistsArr.length > 1) {
                request.body.artist = artistsArr.shift();
                updateAlbumsArtistsTable(request, response);
            } else {
                response.status(202).json(results);
            }
        }
    })
}

// function updateAlbumsArtistsTable(albumID, artistsArr) {

//     for(let i=0; i < artistsArr.length; i++) {

    
//     const query = `INSERT INTO artists_albums(artist_id, album_id) VALUES (?,?)`;

//     const values = [artistsArr[i], albumID];

//     connection.query(query, values, (error, results, fields) => {
//         if (error) {
//             response.status(500).json({ message: "Internal server error" });
//         } else {
//             if (i < artistsArr.length - 1) {
//                 continue;
//             }
//             response.json(results)
//         }
//     });
//     }
    
// }

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
