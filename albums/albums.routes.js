import express from "express";
import {
    createAlbum,
    deleteAlbum,
    getAllAlbums,
    getSingleAlbum,
    searchAlbums,
    updateAlbum,
    updateAlbumsArtistsTable,
    getAllAlbumDataByAlbumID
} from "./albums.controller.js";

const albumRouter = express.Router();

albumRouter.get("/albums/", getAllAlbums);
albumRouter.get("/albums/search/:searchValue", searchAlbums)
albumRouter.get("/albums/:id", getSingleAlbum);
albumRouter.get("/albums/:id/tracks", getAllAlbumDataByAlbumID)
albumRouter.post("/albums/", createAlbum);
albumRouter.put("/albums/:id", updateAlbum);
albumRouter.delete("/albums/:id", deleteAlbum); // fejler og giver 500 til postman ved test

export default albumRouter;
