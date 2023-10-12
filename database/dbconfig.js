import mysql from "mysql2/promise";
import "dotenv/config";
import fs from "fs/promises";
import Debug from "debug";
const dbDebug = Debug("app:db");
//Inde i env filen: DEBUG="app:startup, app:db"

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    multipleStatements: true,
};

if (process.env.DB_CERT) {
    dbConfig.ssl = { ca: await fs.readFile("DigiCertGlobalRootCA.crt.pem") };
}

const connection = await mysql.createConnection(dbConfig).then(dbDebug("Connected to Database"));

export default connection;

