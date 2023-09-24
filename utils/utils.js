import connection from "../database/dbconfig.js";

async function getArtistsIDByName(artistNames) {
    const artistIdArr = [];
    const query = `SELECT id FROM artists WHERE name = ?`;

    for (const artistName of artistNames) {
        const values = [artistName];

        try {
            if (typeof artistName !== "string") {
                throw new Error("artist is not of type string")
            }

            const [rows, fields] = await connection.execute(query, values);
            if (rows.length > 0) {
                artistIdArr.push(rows[0].id);
            }
        } catch (error) {
            console.error(`Error getting artist ID for ${artistName}: ${error.message}`);
            throw error;
        }
    }
    return artistIdArr;
}

async function getAlbumsIDByName(albumNames) {
    const albumsIdArr = [];

    for (const albumName of albumNames) {
        const query = `SELECT id FROM albums WHERE title = ?`;
        const values = [albumName];

        try {
            const [rows, fields] = await connection.execute(query, values);
            if (rows.length > 0) {
                albumsIdArr.push(rows[0].id);
            }
        } catch (error) {
            console.error(`Error getting album ID for ${albumName}: ${error.message}`);
            throw error;
        }
    }
    return albumsIdArr;
}


async function searchAll(request, response) {
    try {
        const searchValue = request.params.searchValue;
        const query = `
        SELECT tracks.title AS name, 'track' AS type 
        FROM tracks 
        WHERE title LIKE ?
        UNION
        SELECT 
        albums.title AS name,'album' AS type 
        FROM albums 
        WHERE title LIKE ?
        UNION
        SELECT 
        artists.name AS name, 'artist' AS type 
        FROM artists 
        WHERE name LIKE ?;
        `;
        const values = [`%${searchValue}%`, `%${searchValue}%`, `%${searchValue}%`];
        const [results, fields] = await connection.execute(query, values);
            if (results.length === 0 || !results) {
                response.status(404).json({message: `Could not find any results with the requested search value: ${searchValue}`});
            } else {
                response.status(200).json(results);
            }
    } catch (error) {
        response.status(500).json({message: "Internal server error"});
    }
}

async function getAlbumTracks(albumId) {
    if (albumId === undefined) {
        throw new Error('albumId is undefined');
    }
    try {
       const albumTracks = await getAssociatedIds('albums_tracks', 'track_id', 'album_id', albumId)
       if (albumTracks.length === 0) {
           throw new Error('No tracks found for album');
       } else {
              return albumTracks;
       }
    } catch (error) {
        throw error.message
    }
}


async function deleteFromTable(tableName, columnName, ids) {
    if (!Array.isArray(ids)) {
        ids = [ids];
    }
    console.log('deleteFromTable')
    console.log(`tableName: ${tableName} - columnName: ${columnName} - ids: ${ids}`)
    try {
        const placeholders = ids.map(() => '?').join(',');
        console.log(`placeholders: ${placeholders}`)
        const query = `DELETE FROM ${tableName} WHERE ${columnName} IN (${placeholders})`;
        console.log(`query: ${query}`)
        const values = [...ids];
        console.log(`values: ${values}`)
        await connection.execute(query, values);
    } catch (error) {
        throw error.message(`Internal server error while deleting from ${tableName}`);
    }
}

async function deleteFromAlbumsTracksTable(albumIds, trackIds) {
    try {
        for (const albumId of albumIds) {
            // Generate placeholders for trackIds
            const placeholders = trackIds.map(() => '?').join(',');
            // Construct the dynamic query with placeholders
            const query = `DELETE FROM albums_tracks WHERE album_id = ? AND track_id IN (${placeholders})`;
            // Create an array with albumId repeated for each trackId
            const values = [albumId, ...trackIds];
            const [result] = await connection.execute(query, values);

            if (result.affectedRows === 0) {
                console.log(`Could not find album by specified ID: ${albumId}`);
            } else {
                console.log(`Deleted ${result.affectedRows} rows from albums_tracks`);
            }
        }
    } catch (error) {
        throw error.message(`Internal server error while deleting from albums_tracks`);
    }
}

async function deleteOrphanedRecords(tableName, columnName, ids) {
    try {
        // loop through ids and delete if no longer associated with any other records
        for (const id of ids) {
            let query;
            if (tableName === 'albums') {
                // if album is not associated with any albums_tracks, delete it
                query = `
                    DELETE FROM ${tableName}
                    WHERE id = ? 
                    AND (SELECT COUNT(*) FROM albums_tracks WHERE album_id = ?) = 0
                    AND (SELECT COUNT(*) FROM artists_albums WHERE album_id = ?) = 0
                `;
            } else if (tableName === 'tracks') {
                // if track is not associated with any artists_tracks or albums_tracks, delete it
                query = `
                    DELETE FROM ${tableName}
                    WHERE id = ?
                    AND (SELECT COUNT(*) FROM artists_tracks WHERE track_id = ?) = 0
                    AND (SELECT COUNT(*) FROM albums_tracks WHERE track_id = ?) = 0
                `;
            }
            const [results] = await connection.execute(query, [id, id, id]);
            if (results && results.affectedRows > 0) {
                console.log(`Deleted ${results.affectedRows} rows from ${tableName}`);
            } else {
                console.log(`No rows deleted from ${tableName}`);
            }
        }
        console.log(`Deleted orphaned records from ${tableName}`)
    } catch (error) {
        throw error.message(`Internal server error while deleting orphaned records from ${tableName}`);
    }
}


async function getAssociatedIds(tableName, columnName, conditionColumn, id) {
    try {
        const query = `SELECT ${columnName} FROM ${tableName} WHERE ${conditionColumn} = ?`;
        const values = [id];
        const [results] = await connection.execute(query, values);

        const mappedResults =  results.map((result) => result[columnName]);
        if (Array.isArray(mappedResults)) {
            return mappedResults;
        } else {
            return [mappedResults];
        }

    } catch (error) {
        throw error.message(`Internal server error while getting associated IDs from ${tableName}`);
    }
}

async function getAlbumsByArtistId(artistId) {
    const albumIds = await getAssociatedIds("artists_albums", "album_id", "artist_id", artistId);

    // Initialize an array to store album objects
    const albums = [];

    // Fetch album information for each album ID
    for (const albumId of albumIds) {
        const albumQuery = "SELECT * FROM albums WHERE id = ?";
        const albumValues = [albumId];
        const [albumResult] = await connection.execute(albumQuery, albumValues);

        if (albumResult.length > 0) {
            const album = albumResult[0];
            // Fetch track information for each track ID
            const trackIds = await getAssociatedIds("albums_tracks", "track_id", "album_id", albumId);
            let tracks = [];
            let trackArtists = [];

            for (const trackId of trackIds) {
                const trackQuery = "SELECT * FROM tracks WHERE id = ?";
                const trackValues = [trackId];
                const [trackResult] = await connection.execute(trackQuery, trackValues);

                if (trackResult.length > 0) {
                    tracks.push(trackResult[0]);
                    // Fetch artist information for each track
                    const artistIds = await getAssociatedIds("artists_tracks", "artist_id", "track_id", trackId);
                    for (const artistId of artistIds) {
                        const artistQuery = "SELECT name FROM artists WHERE id = ?";
                        const artistValues = [artistId];
                        const [artistResult] = await connection.execute(artistQuery, artistValues);
                        const artistNames = artistResult[0].name;

                        if (!trackArtists.includes(artistNames)) {
                            trackArtists.push(artistNames);
                        }
                    }
                }
            }

            // Create an array of track objects for the album
            const trackObjects = tracks.map(track => ({
                title: track.title,
                duration: track.duration,
                artists: trackArtists,
            }));
            // Create an album object and add it to the albums array
            const albumObject = {
                title: album.title,
                yearOfRelease: album.year_of_release,
                image: album.image,
                artist: artistId,
                tracks: trackObjects,
            };
            albums.push(albumObject);
        }
    }

    return albums;
}

export {
    getAlbumsIDByName,
    getArtistsIDByName,
    searchAll,
    deleteFromTable,
    deleteOrphanedRecords,
    getAssociatedIds,
    deleteFromAlbumsTracksTable,
    getAlbumTracks,
    getAlbumsByArtistId
};
