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

async function getTracksIDByName(trackNames) {
    const tracksIdArr = [];

    for (const trackName of trackNames) {
        const query = `SELECT id FROM tracks WHERE title = ?`;
        const values = [trackName];

        connection.query(query, values, (error, results) => {
            if (error) {
                response.status(500).json({ message: "Error with getting track ID" });
            } else {
                tracksIdArr.push(results[0].id);
            }
        });
    }

    return tracksIdArr
}

async function createArtistHelper(artists) {
    const artistsIdArr = [];

    if (!artists) {
        response.status(400).json({ message: "Include artists" });
    } else {
        for (const artist of artists) {
            const query = "SELECT id FROM artists WHERE name = ?";
            
            connection.query(query, [artist], (error, results, fields) => {
                if (error) {
                    response.status(500).json({ message: "Internal server error" });
                } else {
                    if (!results[0].id) {
                        const createQuery = "INSERT INTO artists(name,image) VALUES (?,?)";
                        const values = [artist, null];

                        connection.query(createQuery, values, (error, results, fields) => {
                            if (error) {
                                response.status(500).json({ message: "Could not create artist" });
                            } else {
                                artistsIdArr.push(results.insertId);
                            }
                        });
                    }
                }
            });


        }
    }

    return artistsIdArr
}

async function createAlbumHelper(albumTitle, albumYearOfRelease, albumImage) {
    //Request.body består af et objekt med følgende properties: title STRING, duration INT, artists STRING ARR
    const values = [albumTitle, albumYearOfRelease, albumImage];
    const query = "INSERT INTO albums (title, year_of_release, image) VALUES (?,?,?)";

    connection.query(query, values, (error, results, fields) => {
        if (error) {
            console.log("error1");
            response.status(500).json({ message: "Internal server error" });
        } else {
            const albumID = results.insertId;
            return albumID
        }
    });
}


async function createFinishedAlbum(request, response, next) {
    const albumInformation = request.body[0];
    const albumTitle = albumInformation.albumTitle;
    const albumYearOfRelease = albumInformation.albumYearOfRelease;
    const albumImage = albumInformation.albumImage;
    const albumArtistsArr = albumInformation.albumArtists;
    const songArr = request.body.slice(1);

    if (!albumInformation || !albumTitle || !albumYearOfRelease || !albumArtistsArr || songArr) {
        response.status(500).json({ message: "Missing info" });
    }
        
    
    
    console.log(albumTitle, albumYearOfRelease, albumImage, albumArtistsArr);
    console.log(songArr);

    const artistsID = await createArtistHelper(albumArtistsArr);
    const albumID = await createAlbumHelper(albumTitle, albumYearOfRelease, albumImage, albumArtistsArr)


    response.send()
}

export { getAlbumsIDByName, getArtistsIDByName, getTracksIDByName, createArtistHelper, createFinishedAlbum};
