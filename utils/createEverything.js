import {getArtistsIDByName} from "./utils.js";
import connection from "../database/dbconfig.js";

async function createAllAtOnce(req, res) {
    // modtager to arrays og et album:
    // artists[ string | object]
    // album: object
    // tracks[string | object]

    let {artists, album, tracks} = req.body;
    if (!artists || artists.length === 0 || !album || !tracks || tracks.length === 0) {
        res.status(400).json({ message: 'artists, album or tracks are missing'});

        try {
            let artistsIds = [], albumId = null, tracksIds = [];

            // loop over artists - de der er af type string finder vi id på og pusher til artistsIds- de der er type object opretter vi og modtager id retur og pusher til artistsIds
            for (const artist of artists) {
                if (typeof artist === 'string') {
                    artistsIds.push(await getArtistsIDByName(artist));
                } else if (typeof artist === 'object') {
                    artistsIds.push(await createArtist(artist)); //TODO vær sikker på at createArtist returnerer id
                } else {
                    throw new Error('artist is not a string or an object');
                }
            }
            // tilføj artistId'er til album objektet
            album.artists = artistsIds;
            // album oprettes med artistId’er fra artistsIds
            albumId = await createAlbum(album);

            // tilføj albumId  og artistId'er til tracks objektet
            for (const track of tracks) {

            }
            // loop over tracks -  tilføj albumId og artistId'er til tracks objektet og opret tracks
            for (const track of tracks) {
                if (typeof track === 'object') {
                    track.artists = artistsIds;
                    track.album = albumId;
                    tracksIds.push(await createTrack(track));
                } else {
                    throw new Error('track is not an object');
                }
            }
            res.status(201).json({ message: 'Artists, album and tracks created' });

        } catch (error) {
            res.status(500).json({ message: "internal server error" })
        }
    }
}

// Helper functions for creating artists, albums and tracks

async function createArtist(artist) {
    try {
        const { name, image } = artist;
        const query = "INSERT INTO artists(name, image) VALUES (?, ?)";
        const values = [name, image];
        const [results, fields] = await connection.execute(query, values);

        if (results.affectedRows > 0) {
            return { artistId: results.insertId };
        } else {
            throw new Error("Failed to create artist");
        }
    } catch (error) {
        // You can log the error for debugging purposes
        console.error(error);
        return { error: "An error occurred while creating the artist" };
    }
}

async function createAlbum(album) {
    const { title, yearOfRelease, image, artists } = album;

    if (!artists) {
        response.status(400).json({ message: "Include artists" });
    }

    try {
        const values = [title, yearOfRelease, image];
        const query = "INSERT INTO albums(title, year_of_release, image) VALUES (?,?,?)";
        const results = await connection.execute(query, values);
        const albumID = results[0].insertId;

        let artistIDArr = [];
        for (const artist of artists) {
            if (typeof artists === "string") {
                artistIDArr.push(getArtistsIDByName(artists));
            } else if (typeof artists === "number") {
                artistIDArr.push(artists);
            } else {
                throw new Error("artist is not a string or a number");
            }
        }
        console.log(`createArtist: artistId: ${artistIDArr}`);

        if (artistIDArr.length === 0) {
            throw new Error("artist not found");
        }

        await createAlbumInTable("artists_albums", "artist_id", artistIDArr, albumID, response);

        return albumID;
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