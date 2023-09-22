import express from "express";
import {
    createAlbum,
    deleteAlbum,
    getAllAlbums,
    getSingleAlbum,
    searchAlbums,
    updateAlbum,
    getAllAlbumDataByAlbumID
} from "./albums.controller.js";


const albumRouter = express.Router();

albumRouter.route("/albums/")
    .get(getAllAlbums)
    .post(createAlbum);

albumRouter.route("/albums/:id")
    .get(getSingleAlbum)
    .put(updateAlbum)
    .delete(deleteAlbum);

albumRouter.route("/albums/search/:searchValue")
    .get(searchAlbums);

albumRouter.route("/albums/:id/tracks")
    .get(getAllAlbumDataByAlbumID);


export default albumRouter;
