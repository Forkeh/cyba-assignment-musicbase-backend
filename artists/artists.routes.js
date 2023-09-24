import express from "express";
import { createArtistEndpoint, deleteArtist, getAllAlbumsByArtist, getAllArtists, getSingleArtist, updateArtist, searchArtists } from "./artists.controller.js";

const artistRouter = express.Router();


artistRouter.route("/artists/")
    .get(getAllArtists)
    .post(createArtistEndpoint);

artistRouter.route("/artists/:id")
    .get(getSingleArtist)
    .put(updateArtist)
    .delete(deleteArtist);

artistRouter.route("/artists/search/:searchValue")
    .get(searchArtists);

artistRouter.route("/artists/albums/:artist")
    .get(getAllAlbumsByArtist);


export default artistRouter