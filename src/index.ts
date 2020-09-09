import mongoose from "mongoose";
import * as express from "express";
import { v2 as cloudinary } from "cloudinary";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { authRouter } from "./routes";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

mongoose.connect(
  `mongodb+srv://admin:${process.env.DB_PASSWORD}@cluster0.ofskr.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,
  { useNewUrlParser: true, useUnifiedTopology: true },
);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

global.XMLHttpRequest = require("xhr2");

const app = express.default();

app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

mongoose.set("useFindAndModify", false);
const dbConnection = mongoose.connection;
dbConnection.on("error", (err) => console.log(`Connection error: ${err}`));
dbConnection.once("open", () => console.log("Connected to DB!"));

app.use("/auth", authRouter);

app.listen({ port: 4001 }, () => {
  console.log("🚀 Server ready at");
});
