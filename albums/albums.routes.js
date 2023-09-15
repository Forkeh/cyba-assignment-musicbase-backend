import express from "express";
import connection from "../database/dbconfig.js";

const albumRouter = express.Router();

albumRouter.get("/", async (request, response) => {
    const query = "SELECT * FROM albums";

    connection.query(query, (error, results, fields) => {
        if (error) {
            console.log(error);
        } else {
            response.json(results);
        }
    });
});

albumRouter.get("/:id", async (request, response) => {
    const id = request.params.id;
    const query = "SELECT * FROM albums WHERE id = ?";
    const values = [id];

    connection.query(query, values, (error, results, fields) => {
        if (error) {
            console.log(error);
        } else {
            response.json(results);
        }
    });
});

export default albumRouter;
