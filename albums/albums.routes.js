import express from "express";
import {
    createAlbum,
    deleteAlbum,
    getAllAlbums,
    getSingleAlbum,
    updateAlbum,
    updateAlbumsArtistsTable,
} from "./albums.controller.js";

const albumRouter = express.Router();

albumRouter.get("/albums/", getAllAlbums);

albumRouter.get("/albums/:id", getSingleAlbum);


albumRouter.get("/albums/:id/tracks", getAllTracksByAlbumID)


albumRouter.post("/albums/", createAlbum, updateAlbumsArtistsTable);


albumRouter.put("/albums/:id", updateAlbum);

albumRouter.delete("/albums/:id", deleteAlbum);

export default albumRouter;
