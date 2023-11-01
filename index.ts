import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import db from "./db";
import router from "./routes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

db.connectMongoose();

app.use("/", router);

app.listen(3165, () => console.log("Listening on PORT 3165"));
