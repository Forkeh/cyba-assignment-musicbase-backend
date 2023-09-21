import express from "express";
import {
    getAllTracks,
    getSingleTrack,
    deleteTrack,
    updateTrack,
    searchTracks,
    createTrack,
} from "./tracks.controllers.js";
import {createAllAtOnce} from "../utils/createEverything.js";

const trackRouter = express.Router();

trackRouter.get("/tracks", getAllTracks);
trackRouter.get("/tracks/:id", getSingleTrack);
trackRouter.get("/tracks/search/:searchValue", searchTracks);
trackRouter.delete("/tracks/:id", deleteTrack);
trackRouter.put("/tracks/:id", updateTrack);
trackRouter.post("/tracks", createTrack);

trackRouter.post("/artists/albums/tracks", createAllAtOnce);

export default trackRouter;
