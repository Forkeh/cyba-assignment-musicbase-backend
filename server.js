import express from "express";
import cors from "cors";
import connection from "./database/dbconfig.js";
import artistRouter from "./artists/artists.routes.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.listen(port, () => {
    console.log(`Server is running on ${port}`);
})


app.use(artistRouter)