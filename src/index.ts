import mongoose from "mongoose";
import * as express from "express";
import cors from "cors";
import cookieParser from "cookie-parser"
import bodyParser from "body-parser";

const password = "sJ2dzkNEkoKoy9uk";
const dbName = "message_board";
mongoose.connect(
`mongodb+srv://admin:${password}@cluster0.ofskr.mongodb.net/${dbName}?retryWrites=true&w=majority`,
{ useNewUrlParser: true, useUnifiedTopology: true }
);

const app = express.default();

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

mongoose.set('useFindAndModify', false);
const dbConnection = mongoose.connection;
dbConnection.on("error", (err) => console.log(`Connection error: ${err}`));
dbConnection.once("open", () => console.log("Connected to DB!"));

app.listen({ port: 4001 }, () => {
console.log(`🚀 Server ready at`)
})