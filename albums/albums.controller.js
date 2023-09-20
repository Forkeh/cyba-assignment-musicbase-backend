import connection from "../database/dbconfig.js";
import { deleteFromTable, getArtistsIDByName } from "../utils/utils.js";

async function getAllAlbums(request, response) {
    try {
        const query = "SELECT Albums.title, Albums.year_of_release AS yearOfRelease, Albums.image FROM albums";
        const [results, fields] = await connection.execute(query);
        if (results.length === 0 || !results) {
            response.status(404).json({ message: "Could not find any albums" });
        }
        response.status(200).json(results);

    } catch (error) {
        response.status(500).json({ message: "Internal server error" });
    }
}

async function getSingleAlbum(request, response) {
    try {
        const id = request.params.id;
        const query = "SELECT * FROM albums WHERE id = ?";
        const values = [id];
        const [results, fields] = await connection.execute(query, values);
        if (results.length === 0 || !results) {
            response.status(404).json({ message: "Could not find album by specified ID: " + id });
        } else {
            response.status(200).json(results[0]);
        }
    } catch (error) {
        response.status(500).json({ message: "Internal server error" });
    }
}

async function searchAlbums(request, response) {
    try {
        const searchValue = request.params.searchValue;
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
        const [results, fields] = await connection.execute(query, values);
        if (results.length === 0 || !results) {
            response.status(404).json({message: `Could not find any albums with the requested search value: ${searchValue}`});
        } else {
            response.status(200).json(results);
        }
    } catch (error) {
        response.status(500).json({message: "Internal server error"});
    }
}

async function createAlbum(request, response) {
    //Request.body består af et objekt med følgende properties: title STRING, yearOfRelease INT, image STRING, artists STRING ARR
    const { title, yearOfRelease, image, artists } = request.body;

    if (!artists) {
        response.status(400).json({ message: "Include artists" });
    } 

    try {
        const values = [title, yearOfRelease, image];
        const query = "INSERT INTO albums(title, year_of_release, image) VALUES (?,?,?)";
        const results = await connection.execute(query, values);
        const albumID = results[0].insertId;
        let artistIDArr = [];
        
        artistIDArr.push(getArtistsIDByName(artists));
        console.log(artistIDArr);

        if (artistIDArr.length === 0) {
            throw new Error("artist not found");
        }

        await createAlbumInTable("artists_albums", "artist_id", artistIDArr, albumID, response);

        response.status(201).json({ message: "Album created" });
    } catch (error) {

        if (error.message) {
            response.status(400).json({ message: `${error.message}` });
        } else {
            response.status(500).json({ message: "Internal server error at createAlbum" });
        }
    }
}

async function createAlbumInTable(tableName, idColumnName, id, albumId, res) {
    try {
        const query = `INSERT INTO ${tableName}(${idColumnName}, album_id) VALUES (?, ?)`;
        for (const itemID of id) {
            const values = [itemID, albumId];
            await connection.query(query, values);
        }
    } catch (error) {
        res.status(500).json({ message: `Internal server error at CreateTrackIn${tableName}` });
    }
}

async function updateAlbum(request, response) {
    try {
        const {title, yearOfRelease, image} = request.body;
        const id = request.params.id;
        const query = "UPDATE albums SET title = ?, year_of_release = ?, image = ? WHERE id = ?";
        const values = [title, yearOfRelease, image, id];
        const [results, fields] = await connection.execute(query, values);
        if (results.length === 0 || !results) {
            response.status(404).json({ message: `Could not find album by specified ID: ${id}` });
        } else {
            response.status(200).json(results[0]);
        }
    } catch (error) {
        response.status(500).json({ message: "Internal server error" });
    }
}

async function deleteAlbum(request, response) {
    const albumID = request.params.id;
    
    try {
        // Delete associations with artists
        await deleteFromTable("artists_albums", "album_id", albumID, response);
        const query = "DELETE FROM albums WHERE id = ?";
        await connection.execute(query, [albumID]);

        response.status(204).json();
    } catch (error) {
        response.status(500).json({ message: "Internal server error in deleteAlbum" });
    }
}


//TODO: refactor to try-catch
async function getAllAlbumDataByAlbumID(request, response) {
    const id = request.params.id;
    const values = [id];
    const query = `
    SELECT
    Albums.title,
    Albums.year_of_release AS YearOfRelease,
    Albums.image,
    GROUP_CONCAT(DISTINCT Artists.name ORDER BY Artists.name ASC SEPARATOR ', ') AS ArtistsOnAlbum,
    GROUP_CONCAT(DISTINCT Tracks.title ORDER BY Tracks.title ASC SEPARATOR ', ') AS TracksOnAlbum
    FROM Albums
    LEFT JOIN Albums_Tracks ON Albums.id = Albums_Tracks.album_id
    LEFT JOIN Tracks ON Albums_Tracks.track_id = Tracks.id
    LEFT JOIN Artists_Tracks ON Tracks.id = Artists_Tracks.track_id
    LEFT JOIN Artists ON Artists_Tracks.artist_id = Artists.id
    WHERE Albums.id = ?
    GROUP BY Albums.title, Albums.year_of_release, Albums.image;
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
    getAllAlbumDataByAlbumID,
    searchAlbums
};