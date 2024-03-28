import express from "express";
import mysql from "mysql";
import { conn } from "../dbconnect";
export const router = express.Router();

router.get("/:id", (req, res) => {
  let id = req.params.id;
  let sql = 'SELECT * FROM statistics WHERE imageID = ? AND date < CURDATE() - INTERVAL 7  DAY order by date';
  sql = mysql.format(sql, [id]);

  conn.query(sql, (err, result) => {
    if (err) throw err;
    res.status(201).json(result);
  });
});

router.get("/:id/:day", (req, res) => {
    let day = req.params.day;
    let id = req.params.id;
    let sql = 'SELECT * FROM statistics WHERE imageID = ? AND date >= CURDATE() - INTERVAL ? DAY order by date';
    sql = mysql.format(sql, [id,day]);
  
    conn.query(sql, (err, result) => {
      if (err) throw err;
      res.status(201).json(result);
    });
  });
  