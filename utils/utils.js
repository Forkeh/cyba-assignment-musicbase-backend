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

    return tracksIdArr;
}

async function createArtistHelper(request, response, next) {
    const artistsIdArr = [];

    for (const artist of request.body[0].albumArtists) {
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

    request.body.albumArtistsID = artistsIdArr;
    next();
    return;
}

async function createAlbumHelper(request, response, next) {
    const values = [request.body[0].albumTitle, request.body[0].albumYearOfRelease, request.body[0].albumImage];
    const query = "INSERT INTO albums(title, year_of_release, image) VALUES (?,?,?)";

    connection.query(query, values, (error, results, fields) => {
        if (error) {
            console.log(error);
            console.log("error1");
            response.status(500).json({ message: "Internal server error" });
        } else {    
            request.body.albumID = results.insertId;
            next()
            return;
        }
    });
}

async function updateAlbumsArtistsTableHelper(request, response, next) {
    console.log("Album id her?: " + request.body.albumID);
    const query = `INSERT INTO albums_artists(album_id, artist_id) VALUES (?,?)`;

    for (const artistID of request.body.albumArtistsID) {
        const values = [request.body.albumID, artistID];

        connection.query(query, values, (error, results, fields) => {
            if (error) {
                response.status(500).json({ message: "Internal server error" });
            }
        });
    }
    
    next();
    return;
}

function createTrackHelper(track) {
    const query = `INSERT INTO tracks(title, duration) VALUES (?,?);`;
    const values = [track.title, track.duration];

    connection.query(query, values, (error, results, fields) => {
        if (error) {
            response.status(500).json({ message: "Internal server error creating track" });
        } else {
            const trackID = results.insertId;
            return trackID;
        }
    });
}

function CreateTrackInAlbumsTracksHelper(albumID, trackID) {
    const query = `INSERT INTO albums_tracks(album_id, track_id) VALUES (?,?);`;
    const values = [albumID, trackID];
    console.log("Album id: " + albumID);
    console.log("Track id: " + trackID);

    connection.query(query, values, (error, results, fields) => {
        if (error) {
            response.status(500).json({ message: "Internal server error CreateTrackInAlbumsTracksHelper" });
        }
    });
}

function CreateTrackInArtistsTracksHelper(artistsIdArr, trackID) {
    const query = `INSERT INTO artists_tracks(artist_id, track_id) VALUES (?,?);`;
    for (const artistID of artistsIdArr) {
        const values = [artistID, trackID];

        connection.query(query, values, (error, results, fields) => {
            if (error) {
                console.log(error);
                response.status(500).json({ message: "Internal server error CreateTrackInAlbumsTracksHelper" });
            }
        });
    }
}

async function populateAlbum(request, response, next) {
    for (const track of request.body.tracksArr) {
        request.body.trackArtistsID
        const trackArtistsID = [];
        

        for (const artist of request.body[0].albumArtists) {
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
                                trackArtistsID.push(results.insertId);
                            }
                        });
                    }
                }
            });
        }

        request.body.trackArtistsID = trackArtistsID;

        const trackQuery = `INSERT INTO tracks(title, duration) VALUES (?,?);`;
        const values = [track.title, track.duration];

        connection.query(trackQuery, values, (error, results, fields) => {
            if (error) {
                response.status(500).json({ message: "Internal server error creating track" });
            } else {
                request.body.trackID = results.insertId;
            }
        });

        
        const query = `INSERT INTO albums_tracks(album_id, track_id) VALUES (?,?);`;
        const theseValues = [request.body.albumID, request.body.trackID];
        console.log("Album id: " + request.body.albumID);
        console.log("Track id: " + request.body.trackID);

        connection.query(query, theseValues, (error, results, fields) => {
            if (error) {
                response.status(500).json({ message: "Internal server error CreateTrackInAlbumsTracksHelper" });
            }
        });


        const queryThis = `INSERT INTO artists_tracks(artist_id, track_id) VALUES (?,?);`;
        for (const artistID of request.body.trackArtistsID) {
            const values = [artistID, request.body.trackID];

            connection.query(queryThis, values, (error, results, fields) => {
                if (error) {
                    console.log(error);
                    response.status(500).json({ message: "Internal server error CreateTrackInAlbumsTracksHelper" });
                }
            });
        }



        // //TODO:1 Lav artist først
        // const artistsID = createArtistHelper(track.artists);
        // //TODO:2 Opret track
        // // const trackID = createTrackHelper(track);
        // //TODO:3 Opdater albums_tracks OG artists_tracks
        // CreateTrackInAlbumsTracksHelper(albumID, trackID);
        // CreateTrackInArtistsTracksHelper(artistsID, trackID);
    }
    response.status(204).json();
}



async function createFinishedAlbum(request, response, next) {
    const albumInformation = request.body[0];
    const albumTitle = albumInformation.albumTitle;
    const albumYearOfRelease = albumInformation.albumYearOfRelease;
    const albumImage = albumInformation.albumImage;
    const albumArtistsArr = albumInformation.albumArtists;
    request.body.tracksArr = request.body.slice(1);

    if (!albumInformation || !albumTitle || !albumYearOfRelease || !albumArtistsArr || !request.body.tracksArr) {
        response.status(500).json({ message: "Missing info" });
        return;
    }

    console.log(albumTitle, albumYearOfRelease, albumImage, albumArtistsArr);
    console.log(request.body.tracksArr);

    // //request.body.albumArtistsID (array) NR 1, ER TILFØJET
    // const artistsID = createArtistHelper(albumArtistsArr);
    // //request.body.albumID (int) NR2, ER TILFØJET
    // const albumID = createAlbumHelper(albumTitle, albumYearOfRelease, albumImage, albumArtistsArr);
    // console.log("Første albumID: " + albumID);
    // //NR 3 TAR IMOD request.body.albumArtistsID OG request.body.albumID TILFØJET
    // updateAlbumsArtistsTableHelper(artistsID, albumID);
    // //NR 4 TAR IMOD request.body.albumID og request.body.tracksArr
    // populateAlbum(albumID, tracksArr);

    // response.status(204).json();
    next();
    return;
}

export { getAlbumsIDByName, getArtistsIDByName, getTracksIDByName, createArtistHelper, createFinishedAlbum, createAlbumHelper, updateAlbumsArtistsTableHelper, populateAlbum };
