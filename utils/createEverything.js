import connection from "../database/dbconfig.js";

async function createAllAtOnce(req, res) {
    let { artists, album, tracks } = req.body;
    // console.log(req.body);
    if (!artists || artists.length === 0 || !album || !tracks || tracks.length === 0) {
        res.status(400).json({ message: "artists, album or tracks are missing" });
    }

    try {
        let artistsIdsArr = [], albumId;
        //artistsIdsArr = [1, 3, 2]
        
        // loop over artists - de der er af type string finder vi id på og pusher til artistsIds- de der er type object opretter vi og modtager id retur og pusher til artistsIds
        for (const artist of artists) {
            if (typeof artist === "string") {
                // console.log(`artist name: ${artist}`);
                const artistID = await getArtistsIDByName(artist);

                artistsIdsArr.push(artistID);
            } else if (typeof artist === "object") {
                // console.log(`artist name: ${artist.name}`);
                const artistID = await createArtist(artist);

                artistsIdsArr.push(artistID);
            } else {
                throw new Error("artist is not a string or an object");
            }
        }
        // tilføj artistId'er til album objektet. album.artists er et ARRAY
        album.artistIDArr = artistsIdsArr;
        // console.log(`artistsIdsArr: ${artistsIdsArr}`);
        // album oprettes med artistId’er fra artistsIds
        albumId = await createAlbum(album);
        console.log(`ALBUMID: ${albumId}`);

        //? Alis forsøg
        for (const track of tracks) {
            if (typeof track === "object") {
                track.albumID = albumId;
                await createTrack(track);
            } else {
                throw new Error("track is not an object");
            }
        }

        res.status(201).json({ message: "Artists, album and tracks created" });
    } catch (error) {
        res.status(500).json({ message: "internal server error" });
    }
}

async function getArtistsIDByName(artistName) {
    const query = `SELECT id FROM artists WHERE name = ?`;
    const values = [artistName];
    
    try {
        const [results] = await connection.execute(query, values);
        if (results.length > 0) {
            return results[0].id;
        }

    } catch (error) {
        // Handle the error here if needed
        console.error(`Error getting artist ID for ${artistName}: ${error.message}`);
        // You might want to throw the error or handle it accordingly
        throw error;
    }

    
}

async function createTrack(track) {
    //track indeholder title STRING, duration INT, artists STRING ARR af artist-navne, albumID INT
    // console.log(track);
    try {
        const { title, duration, artists, albumID } = track;

        //TODO: Vi skal lave oprette artists eller hente deres id'her

        let artistsIdsArr = [],
            albumId;
        //artistsIdsArr = [1, 3, 2]

        // loop over artists - de der er af type string finder vi id på og pusher til artistsIds- de der er type object opretter vi og modtager id retur og pusher til artistsIds
        for (const artist of artists) {
            if (typeof artist === "string") {
                // console.log(`artist name: ${artist}`);
                const artistID = await getArtistsIDByName(artist);

                artistsIdsArr.push(artistID);
            } else if (typeof artist === "object") {
                // console.log(`artist name: ${artist.name}`);
                const artistID = await createArtist(artist);

                artistsIdsArr.push(artistID);
            } else {
                throw new Error("artist is not a string or an object");
            }
        }



        //TODO:=================================


        let trackID = await validateIfTrackExists(track);
        console.log(`trackID: ${trackID}`);
        //If track already exists
        if (trackID) {
            // Call the function to create associations
            await createTrackInTable("albums_tracks", "album_id", albumID, trackID);
        } else {
            console.log(`Track does not exist`);
            //Create track
            const query = /*sql*/ `INSERT INTO tracks(title, duration) VALUES (?,?)`;
            const values = [title, duration];
            const [result] = await connection.execute(query, values);
            trackID = result.insertId;
            console.log(`trackID in the else statement: ${trackID}`);

            // Call the function to create associations
            await createTrackInTable("artists_tracks", "artist_id", artistsIdsArr, trackID);
            await createTrackInTable("albums_tracks", "album_id", [albumID], trackID);
        }
    } catch (error) {
        return error.message;
    }
}

async function validateIfTrackExists(track) {
    console.log("Entering validateIfTrackExists");
    const { title, duration } = track;
    console.log(track);
    const query = /*sql*/ `SELECT id FROM tracks WHERE title = ? AND duration = ?`;
    const values = [title, duration];

    const [results] = await connection.execute(query, values);
    console.log(results);
    if (results.length > 0) {
        //TODO: Test with song that already exists!
        console.log(`Hello world!!!! ${results[0].id}`);
        return results[0].id;
    } else if (results.length === 0) {
        console.log("NULL");
        return null;
    }
}

// Helper functions for creating artists, albums and tracks

async function createArtist(artist) {
    try {
        const { name, image } = artist;

        if (!name || !image) {
            throw new Error("artist object is missing properties");
        }

        const query = "INSERT INTO artists(name, image) VALUES (?, ?)";
        const values = [name, image];
        const [results] = await connection.execute(query, values);

        if (results.affectedRows > 0) {
            return results.insertId;
        } else {
            throw new Error("Failed to create artist");
        }
    } catch (error) {
        // You can log the error for debugging purposes

        console.error(error);
        return { error: "An error occurred while creating the artist" };
    }
}

//TODO: refactor
async function createAlbum(album) {
    console.log("Creating album");
    const { title, yearOfRelease, image, artistIDArr } = album;
    console.log(title);
    console.log(yearOfRelease);
    console.log(image);
    console.log(artistIDArr);

    if (!artistIDArr || artistIDArr.length === 0) {
        throw new Error("Include artists");
    }

    try {
        const values = [title, yearOfRelease, image];
        const query = "INSERT INTO albums(title, year_of_release, image) VALUES (?,?,?)";
        const results = await connection.execute(query, values);
        const albumID = results[0].insertId;

        await createAlbumInTable("artists_albums", "artist_id", artistIDArr, albumID);

        return albumID;
    } catch (error) {
        if (error.message) {
            return error.message;
        } else {
            return { error: "Internal server error at createAlbum" };
        }
    }
}

async function createAlbumInTable(tableName, idColumnName, id, albumId) {
    try {
        const query = `INSERT INTO ${tableName}(${idColumnName}, album_id) VALUES (?, ?)`;
        for (const itemID of id) {
            const values = [itemID, albumId];
            await connection.query(query, values);
        }
    } catch (error) {
        return { error: "An error occurred while populating artists_albums table" };
    }
}

async function createTrackInTable(tableName, idColumnName, id, trackId) {
    //await createTrackInTable("albums_tracks", "album_id", albumID, trackID);
    try {
        const query = `INSERT INTO ${tableName}(${idColumnName}, track_id) VALUES (?, ?)`;
        for (const itemID of id) {
            const values = [itemID, trackId];
            await connection.query(query, values);
        }
    } catch (error) {
        return { error: `Could not create junction table for track in ${tableName}` };
    }
}

export { createAllAtOnce };
