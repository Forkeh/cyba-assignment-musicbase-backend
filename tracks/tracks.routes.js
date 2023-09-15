import express from "express";
import connection from "../database/dbconfig.js";
import { getAllTracks, getSingleTrack } from "./tracks.controllers.js";

const trackRouter = express.Router();

trackRouter.get("/", getAllTracks);

trackRouter.get("/:id", getSingleTrack);

trackRouter.post("/", async (req, res) => {
    const newTrack = req.body;
    const query = `INSERT INTO tracks(title, duration) VALUES (?, ?)`;
    const values = [newTrack.title, newTrack.duration];

    connection.query(query, values, (err, results, fields) => {
        if (err) {
            console.log(err);
            res.status(500);
        } else {
            res.status(201).json(results);
        }
    });
});

export default trackRouter;
