import express from "express";
import connection from "../database/dbconfig.js";
import {
    deleteTrackFromAlbumsTracks,
    deleteTrackFromArtistsTracks,
    getAllTracks,
    getSingleTrack,
    deleteTrack,
    updateTrack,
    searchTracks,
} from "./tracks.controllers.js";

const trackRouter = express.Router();

trackRouter.get("/tracks", getAllTracks);

trackRouter.get("/tracks/:id", getSingleTrack);

trackRouter.get("/tracks/search/:searchValue", searchTracks);

trackRouter.delete(
    "/tracks/:id",
    deleteTrackFromAlbumsTracks,
    deleteTrackFromArtistsTracks,
    deleteTrack
);

trackRouter.put("/tracks/:id", updateTrack);

// trackRouter.post("/", async (req, res) => {
//     const newTrack = req.body;
//     const query = `INSERT INTO tracks(title, duration) VALUES (?, ?)`;
//     const values = [newTrack.title, newTrack.duration];

//     connection.query(query, values, (err, results, fields) => {
//         if (err) {
//             console.log(err);
//             res.status(500);
//         } else {
//             res.status(201).json(results);
//         }
//     });
// });

export default trackRouter;
