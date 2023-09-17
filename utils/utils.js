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

function createArtistHelper(artists) {
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

function createAlbumHelper(albumTitle, albumYearOfRelease, albumImage) {
    const values = [albumTitle, albumYearOfRelease, albumImage];
    const query = "INSERT INTO albums(title, year_of_release, image) VALUES (?,?,?)";

    connection.query(query, values, (error, results, fields) => {
        if (error) {
            console.log("error1");
            response.status(500).json({ message: "Internal server error" });
        } else {
            const albumID = results.insertId;
            console.log("HVAD ER ALBUMID ?: " + albumID);
            return albumID
        }
    });
}

function updateAlbumsArtistsTableHelper(artistsIdArr, albumID) {
    console.log("Album id her?: " + albumID);
    const query = `INSERT INTO albums_artists(album_id, artist_id) VALUES (?,?)`;
    
    for (const artistID of artistsIdArr) {
        const values = [albumID, artistID];

        connection.query(query, values, (error, results, fields) => {
            if (error) {
                response.status(500).json({ message: "Internal server error" });
            }
        })
    }
}

function createTrackHelper(track) {
    const query = `INSERT INTO tracks(title, duration) VALUES (?,?);`
    const values = [track.title, track.duration];

    connection.query(query, values, (error, results, fields) => {
        if (error) {
            response.status(500).json({ message: "Internal server error creating track" });
        } else {
            const trackID = results.insertId;
            return trackID;
        }
    })
}

function CreateTrackInAlbumsTracksHelper(albumID, trackID) {
    const query = `INSERT INTO albums_tracks(album_id, track_id) VALUES (?,?);`
    const values = [albumID, trackID];
    console.log("Album id: " + albumID);
    console.log("Track id: " + trackID);

    connection.query(query, values, (error, results, fields) => {
        if (error) {
            response.status(500).json({ message: "Internal server error CreateTrackInAlbumsTracksHelper" });
        }
    })
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
        })
    }
}

function populateAlbum(albumID, tracksArr) {
    for (const track of tracksArr) {
        //TODO:1 Lav artist først
        const artistsID = createArtistHelper(track.artists);
        //TODO:2 Opret track
        const trackID = createTrackHelper(track);
        //TODO:3 Opdater albums_tracks OG artists_tracks
        CreateTrackInAlbumsTracksHelper(albumID, trackID);
        CreateTrackInArtistsTracksHelper(artistsID, trackID);
    }
} 


async function createFinishedAlbum(request, response, next) {
    const albumInformation = request.body[0];
    const albumTitle = albumInformation.albumTitle;
    const albumYearOfRelease = albumInformation.albumYearOfRelease;
    const albumImage = albumInformation.albumImage;
    const albumArtistsArr = albumInformation.albumArtists;
    const tracksArr = request.body.slice(1);

    if (!albumInformation || !albumTitle || !albumYearOfRelease || !albumArtistsArr || !tracksArr) {
        response.status(500).json({ message: "Missing info" });
    }
        
    console.log(albumTitle, albumYearOfRelease, albumImage, albumArtistsArr);
    console.log(tracksArr);

    const artistsID = createArtistHelper(albumArtistsArr);
    const albumID = createAlbumHelper(albumTitle, albumYearOfRelease, albumImage, albumArtistsArr);
    console.log("Første albumID: " + albumID);
    updateAlbumsArtistsTableHelper(artistsID, albumID);
    populateAlbum(albumID, tracksArr);

    response.status(204).json();
}

export { getAlbumsIDByName, getArtistsIDByName, getTracksIDByName, createArtistHelper, createFinishedAlbum};
