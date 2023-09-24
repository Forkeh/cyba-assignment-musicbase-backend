import express from "express";
import {
    getAllTracks,
    getSingleTrack,
    deleteTrack,
    updateTrack,
    searchTracks,
    createTrack,
} from "./tracks.controller.js";
import {createAllAtOnce} from "../utils/createEverything.js";
import {searchAll} from "../utils/utils.js";


const trackRouter = express.Router();

trackRouter.route("/tracks")
    .get(getAllTracks)
    .post(createTrack);

trackRouter.route("/tracks/:id")
    .get(getSingleTrack)
    .put(updateTrack)
    .delete(deleteTrack);

trackRouter.route("/tracks/search/:searchValue")
    .get(searchTracks);

trackRouter.route("/artists/albums/tracks/:searchValue")
    .get(searchAll);

trackRouter.route("/artists/albums/tracks")
    .post(createAllAtOnce);

export default trackRouter;
