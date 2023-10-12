import express from "express";
import cors from "cors";
import artistRouter from "./artists/artists.routes.js";
import albumRouter from "./albums/albums.routes.js";
import trackRouter from "./tracks/tracks.routes.js";
import { searchAll } from "./utils/utils.js";
import logger from "./log.js"



const app = express();
const port = process.env.PORT || 3000;
logger()
// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/", trackRouter, albumRouter, artistRouter);
app.use("/", async (req, res) => {
    res.send("Server.js is running🎉")
})

throw new Error('ERROR!')

// Start server
app.listen(port, () => {
    console.log(`Server is running on ${port}`);
});




