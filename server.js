import express from "express";
import cors from "cors";

import * as Sentry from "@sentry/node";
import { ProfilingIntegration } from "@sentry/profiling-node";

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

Sentry.init({
    //Du fpr dsn fra sentry instillinger => projects => dsn
    dsn: "https://f7e8a503eeb555fa14f66c8d893452da@o4506036575928320.ingest.sentry.io/4506036617936896",
    integrations: [
        // enable HTTP calls tracing
        new Sentry.Integrations.Http({ tracing: true }),
        // enable Express.js middleware tracing
        new Sentry.Integrations.Express({ app }),
        new ProfilingIntegration(),
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0, // Capture 100% of the transactions, reduce in production!
    // Set sampling rate for profiling - this is relative to tracesSampleRate
    profilesSampleRate: 1.0, // Capture 100% of the transactions, reduce in production!
});

// The request handler must be the first middleware on the app
app.use(Sentry.Handlers.requestHandler());

// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());

// The error handler must be registered before any other error middleware and after all controllers
app.use(Sentry.Handlers.errorHandler());


// Middleware
app.use(express.json());
app.use(cors());
// initErrors();





// Optional fallthrough error handler
app.use(function onError(err, req, res, next) {
  // The error id is attached to `res.sentry` to be returned
  // and optionally displayed to the user for support.
  res.statusCode = 500;
  res.end(res.sentry + "\n");
});


// Routes
app.use("/", trackRouter, albumRouter, artistRouter);
app.use("/", async (req, res) => {
    res.send("Server.js is running🎉")
    // throw new Error("Winston error i /");
})
// Start server
app.listen(port, () => {
    // throw new Error("Error on listen");
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
