import {getArtistsIDByName} from "./utils.js";
import connection from "../database/dbconfig.js";

async function createAllAtOnce(req, res) {
    let {artists, album, tracks} = req.body;
    if (!artists || artists.length === 0 || !album || !tracks || tracks.length === 0) {
        res.status(400).json({ message: 'artists, album or tracks are missing' });
    }

        try {
            let artistsIdsArr, albumId, tracksIdsArr;

            // loop over artists - de der er af type string finder vi id på og pusher til artistsIds- de der er type object opretter vi og modtager id retur og pusher til artistsIds
            for (const artist of artists) {
                if (typeof artist === 'string') {
                    artistsIdsArr = await getArtistsIDByName(artist);
                } else if (typeof artist === 'object') {
                    artistsIdsArr = await createArtist(artist);
                } else {
                    throw new Error('artist is not a string or an object');
                }
            }
            // tilføj artistId'er til album objektet. album.artists er et ARRAY
            album.artists = artistsIdsArr;

            // album oprettes med artistId’er fra artistsIds
            albumId = await createAlbum(album);


            //? Alis forsøg
            for (const track of tracks) {
                if (typeof track === "object") {
                    track.albumID = albumId;
                    await createTrack(track);
                } else {
                    throw new Error("track is not an object");
                }
            }

            // loop over tracks -  tilføj albumId og artistId'er til tracks objektet og opret tracks
            // for (const track of tracks) {
            //     if (typeof track === 'object') {
            //         track.artists = artistsIds;
            //         track.album = albumId;
            //         tracksIds.push(await createTrack(track));
            //     } else {
            //         throw new Error('track is not an object');
            //     }
            // }

            res.status(201).json({ message: 'Artists, album and tracks created' });

        } catch (error) {
            res.status(500).json({ message: "internal server error" })
        }
}


async function createTrack(track) {
    //track indeholder title STRING, duration INT, artists STRING ARR af artist-navne, albumID INT
    
    try {
        const { title, duration, artists, albumID } = track
        let trackID = validateIfTrackExists(track);

        //If track already exists
        if (trackID) {
            // Call the function to create associations
            await createTrackInTable("artists_tracks", "artist_id", artists, trackID);
            await createTrackInTable("albums_tracks", "album_id", albumID, trackID);
            
        } else {
            //Create track
            const query = /*sql*/ `INSERT INTO tracks(title, duration) VALUES (?,?)`;
            const values = [title, duration];
            const result = await connection.execute(query, values);
            trackID = result[0].insertId;

            // Call the function to create associations
            await createTrackInTable("artists_tracks", "artist_id", artists, trackID);
            await createTrackInTable("albums_tracks", "album_id", albumID, trackID);
        }

    } catch (error) {
        return error.message;
    }

}

async function validateIfTrackExists(track) {
    const { title, duration, artists, albumID } = track;
    const query = /*sql*/ `
        SELECT id FROM track WHERE name = ? AND duration = ?
        `;
    const values = [title, duration];

    const results = connection.execute(query, values);

    if (results[0].length > 0) {
        return results[0].id;
    } else {
        return null;
    }
}

// Helper functions for creating artists, albums and tracks

async function createArtist(artist) {
    try {
        const { name, image } = artist;
        
        if (!name || !image) {
            throw new Error("artist object is missing properties")
        }

        const query = "INSERT INTO artists(name, image) VALUES (?, ?)";
        const values = [name, image];
        const results = await connection.execute(query, values);
        console.log(results)
        if (results[0].affectedRows > 0) {
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
    const { title, yearOfRelease, image, artistIDArr } = album;

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

export {createAllAtOnce};