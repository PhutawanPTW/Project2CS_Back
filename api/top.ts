import express from "express";
import { conn, queryAsync } from "../dbconnect";
import mysql from "mysql";
import { User, imageUpload } from "../model/model";
export const router = express.Router();

router.get("/today", (req, res) => {
  let sql = `
    SELECT i.userID, i.imageID, u.username, i.url, s.voteScore, 
      RANK() OVER (ORDER BY s.voteScore DESC) AS RankingToday 
    FROM 
      images i 
      JOIN statistics s ON i.imageID = s.imageID
      JOIN users u ON i.userID = u.userID 
    WHERE 
      DATE(s.date) = CURDATE()
    ORDER BY 
      s.voteScore DESC 
    LIMIT 10`;

  conn.query(sql, (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});


router.get("/yesterday", (req, res) => {
  let sql = `
    SELECT i.userID, i.imageID, u.username, i.url, s.voteScore, 
      RANK() OVER (ORDER BY s.voteScore DESC) AS RankYesterday 
    FROM 
      images i 
      JOIN statistics s ON i.imageID = s.imageID
      JOIN users u ON i.userID = u.userID 
    WHERE 
      DATE(s.date) = DATE(DATE_SUB(CURDATE(), INTERVAL 1 DAY))
    ORDER BY 
      s.voteScore DESC 
    LIMIT 10`;

  conn.query(sql, (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});

  
