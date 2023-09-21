import mysql from "mysql2/promise";
import "dotenv/config";
import fs from "fs/promises";

const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    multipleStatements: true,
});

if (process.env.DB_CERT) {
    connection.ssl = { ca: await fs.readFile("DigiCertGlobalRootCA.crt.pem") };
}

export default connection;
