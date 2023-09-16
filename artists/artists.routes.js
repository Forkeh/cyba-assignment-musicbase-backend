import express from "express";
import connection from "../database/dbconfig.js";
import { createArtist, deleteArtist, getAllAlbumsByArtistId, getAllArtists, getSingleArtist, searchArtists, updateArtist } from "./artists.controller.js";

const artistRouter = express.Router();

artistRouter.get("/artists/", getAllArtists);

artistRouter.get("/artists/:id", getSingleArtist);

artistRouter.get("/artists/search/:searchValue", searchArtists)

artistRouter.post("/artists/", createArtist);

artistRouter.put("/artists/:id", updateArtist);

artistRouter.delete("/artists/:id", deleteArtist);

//#7 branch - få alle albums fra en bestemt artist ud fra artistID
artistRouter.get("/artists/:id/albums", getAllAlbumsByArtistId);

export default artistRouter