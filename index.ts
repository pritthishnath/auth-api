import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import db from "./db";
import router from "./routes";

dotenv.config();

const app = express();
const port = process.env.PORT || 3102;

app.use(
  morgan(
    `${port}|AUTH-API :method :url :status :response-time ms - :res[content-length]`
  )
);
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

db.connectMongoose();

app.use("/", router);

app.listen(port);
