import express from "express";
import { conn, queryAsync } from "../dbconnect";
import mysql from "mysql";
import { User, imageUpload } from "../model/model";
export const router = express.Router();

router.get("/today", (req, res) => {
  // let sql = `
  //   SELECT i.userID, i.imageID, u.username, i.url, s.voteScore, s.date,
  //     RANK() OVER (ORDER BY s.voteScore DESC) AS rankToday 
  //   FROM 
  //     images i 
  //     JOIN statistics s ON i.imageID = s.imageID
  //     JOIN users u ON i.userID = u.userID 
  //   WHERE
  //     DATE(s.date) = CURRENT_DATE()
  //   ORDER BY 
  //     s.voteScore DESC 
  //   `;

    let sql = `
    SELECT 
    i.userID, 
    i.imageID, 
    u.username, 
    i.url, 
    i.count,

    RANK() OVER (ORDER BY i.count DESC) AS rankToday 
FROM 
    images i 
JOIN 
    users u ON i.userID = u.userID 
ORDER BY 
    i.count DESC`;

  conn.query(sql, (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});


router.get("/yesterday", (req, res) => {
  let date = Date();
  console.log(date);
  let sql = `
    SELECT 
    i.userID, 
    i.imageID, 
    u.username, 
    i.url, 
    s.voteScore, 
    s.date,
    RANK() OVER (ORDER BY s.voteScore DESC) AS rankYesterday
FROM 
    images i 
JOIN 
    statistics s ON i.imageID = s.imageID
JOIN 
    users u ON i.userID = u.userID 
WHERE 
    DATE(s.date) = CURDATE() - INTERVAL 1 DAY
ORDER BY 
    s.voteScore DESC`;

  conn.query(sql, (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});

  
