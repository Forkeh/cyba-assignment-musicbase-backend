import express from "express";
import {
    createAlbum,
    deleteAlbum,
    getAllAlbums,
    getSingleAlbum,
    updateAlbum,
} from "./albums.controller.js";

const albumRouter = express.Router();

albumRouter.get("/albums/", getAllAlbums);

albumRouter.get("/albums/:id", getSingleAlbum);

albumRouter.post("/albums/", createAlbum);

albumRouter.put("/albums/:id", updateAlbum);

albumRouter.delete("/albums/:id", deleteAlbum);

export default albumRouter;
