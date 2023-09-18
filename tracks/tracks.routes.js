import express from "express";
import {
    deleteTrackFromAlbumsTracks,
    deleteTrackFromArtistsTracks,
    getAllTracks,
    getSingleTrack,
    deleteTrack,
    updateTrack,
    searchTracks,
    createTrack,
    CreateTrackInAlbumsTracks,
    CreateTrackInArtistsTracks,
} from "./tracks.controllers.js";

const trackRouter = express.Router();

trackRouter.get("/tracks", getAllTracks);
trackRouter.get("/tracks/:id", getSingleTrack);
trackRouter.get("/tracks/search/:searchValue", searchTracks);
trackRouter.delete("/tracks/:id", deleteTrackFromAlbumsTracks, deleteTrackFromArtistsTracks, deleteTrack);
trackRouter.put("/tracks/:id", updateTrack);
trackRouter.post("/tracks", createTrack, CreateTrackInAlbumsTracks, CreateTrackInArtistsTracks);

export default trackRouter;
