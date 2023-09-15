import express from "express";
import connection from "../database/dbconfig.js";
import { createArtist, deleteArtist, getAllAlbumsByArtistId, getAllArtists, getSingleArtist, updateArtist } from "./artists.controller.js";

const artistRouter = express.Router();

artistRouter.get("/", getAllArtists);

artistRouter.get("/:id", getSingleArtist);

artistRouter.post("/", createArtist);

artistRouter.put("/:id", updateArtist);

artistRouter.delete("/:id", deleteArtist);

//#7 branch - få alle albums fra en bestemt artist ud fra artistID
artistRouter.get("/:id/albums", getAllAlbumsByArtistId);

export default artistRouter