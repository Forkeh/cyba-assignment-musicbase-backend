import express from "express";
import {
    createAlbum,
    deleteAlbum,
    getAllAlbums,
    getSingleAlbum,
    updateAlbum,
} from "./albums.controller.js";

const albumRouter = express.Router();

albumRouter.get("/", getAllAlbums);

albumRouter.get("/:id", getSingleAlbum);

albumRouter.post("/", createAlbum);

albumRouter.put("/:id", updateAlbum);

albumRouter.delete("/:id", deleteAlbum);

export default albumRouter;
