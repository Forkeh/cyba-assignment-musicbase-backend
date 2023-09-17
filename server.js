import express from "express";
import cors from "cors";
import connection from "./database/dbconfig.js";
import artistRouter from "./artists/artists.routes.js";
import albumRouter from "./albums/albums.routes.js";
import trackRouter from "./tracks/tracks.routes.js";
import { searchAll } from "./utils/utils.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.listen(port, () => {
    console.log(`Server is running on ${port}`);
});



//Søg blandt alle 3 tabeller
app.get("/search/:searchValue", searchAll)



app.use("/", trackRouter, albumRouter, artistRouter);
