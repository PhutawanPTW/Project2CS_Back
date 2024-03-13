import express from "express";

export const router = express.Router();

router.get("/", (req, res) => {
  res.send("Server is Started now in index.ts page");
});