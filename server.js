import express from "express";
import cors from "cors";
import artistRouter from "./artists/artists.routes.js";
import albumRouter from "./albums/albums.routes.js";
import trackRouter from "./tracks/tracks.routes.js";
import { searchAll } from "./utils/utils.js";

import Debug from "debug";
import winston from "winston";

const startDebug = Debug("app:startup");
//Inde i env filen: DEBUG="app:startup"

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());
initErrors();

// Routes
app.use("/", trackRouter, albumRouter, artistRouter);
app.use("/", async (req, res) => {
    res.send("Server.js is running🎉")
    // throw new Error("Winston error i /");
})
// Start server
app.listen(port, () => {
    console.log(`Server is running on ${port}`);
    startDebug("Start debugger is running");
    // winston.info("Winston info")
});





export function initErrors() {
    
    process.on("unhandledRejection", (ex) => {
        console.log("We got an unhandled rejection");
        winston.error(ex.message, ex);
    })

    process.on("uncaughtException", (ex) => {
        console.log("We got an unchaught exception");
        winston.error(ex.message, ex);
    });

    winston.add(
        new winston.transports.File({
            filename: "logfile.log",
            level: "info",
            options: {useUnifiedTopology: true, useNewUrlParser: true},
        })
    )

    winston.add(
        new winston.transports.Console({
            options: { useUnifiedTopology: true, useNewUrlParser: true },
        })
    );

    winston.add(
        new winston.transports.File({
            filename: "error.log",
            level: "error",
            options: { useUnifiedTopology: true, useNewUrlParser: true },
        })
    );
}
