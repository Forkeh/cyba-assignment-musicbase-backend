import express from "express";
import connection from "../database/dbconfig.js";
import { getAllTracks, getSingleTrack } from "./tracks.controllers.js";

const trackRouter = express.Router();

trackRouter.get("/", getAllTracks);

trackRouter.get("/:id", getSingleTrack);

export default trackRouter;
