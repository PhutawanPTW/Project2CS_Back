import express from "express";
import { router as index } from "./api/index";
import { router as users } from "./api/users";
import { router as upload } from "./api/upload";
import { router as images } from "./api/images";
import { router as vote } from "./api/vote";
import bodyParser from "body-parser";
import cors from "cors";

export const app = express();
app.use(
  cors({
    origin: "*",
  })
);

// app.use("/" , (rea , res)=>{
//    res.send("Hello world");
// });

app.use(bodyParser.json());
app.use(bodyParser.text());
app.use("/", index);
app.use("/users", users);
app.use("/images", images);
app.use("/images/count", images);
app.use("/upload", upload);
app.use("/vote", vote);