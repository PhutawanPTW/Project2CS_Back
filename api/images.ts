import express from "express";
import { conn } from "../dbconnect";
import mysql from "mysql";
import { User, imageUpload } from "../model/model";
export const router = express.Router();

router.get("/", (req, res) => {
  
    conn.query('SELECT * FROM images', (err, result) => {
      if(err) throw err;
      res.json(result);
    });
  });