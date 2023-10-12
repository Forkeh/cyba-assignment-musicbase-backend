import winston from "winston";

export default function logger() {
    process.on("uncaughtException", ex => {
        console.log("We got an uncaught exception");
        winston.error(ex.message, ex);
    });

    //subscribing to unhandledRejection event:
    process.on("unhandledRejection", ex => {
        console.log("We got an unhandled promise rejection. ");
        winston.error(ex.message, ex);
        process.exit(1); //if we want to exit the proces. Anything else than 0 means failure
    });

    winston.add(
        new winston.transports.File({
            name: "info",
            filename: "./info.log",
            level: "info",
            options: { useUnifiedTopology: true, useNewUrlParser: true },
        })
    );

    winston.add(
        new winston.transports.File({
            name: "error",
            filename: "./error.log",
            level: "error",
            options: { useUnifiedTopology: true, useNewUrlParser: true },
        })
    );

    winston.add(
        new winston.transports.Console({
            options: {
                useUnifiedTopology: true,
                useNewUrlParser: true,
            },
        })
    );
}
