import express from "express";
import connection from "../database/dbconfig.js";
import { createArtist, deleteArtist, getAllArtists, getSingleArtist, updateArtist } from "./artists.controller.js";

const artistRouter = express.Router();

artistRouter.get("/", getAllArtists);

artistRouter.get("/:id", getSingleArtist);

artistRouter.post("/", createArtist);

artistRouter.put("/:id", updateArtist);

artistRouter.delete("/:id", deleteArtist);

export default artistRouter