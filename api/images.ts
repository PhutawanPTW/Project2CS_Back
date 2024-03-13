import express from "express";
import { conn, queryAsync } from "../dbconnect";
import mysql from "mysql";
import { User, imageUpload } from "../model/model";
export const router = express.Router();

router.get("/", (req, res) => {
  conn.query("SELECT i.userID, i.imageID, i.url, u.username, i.count FROM images i JOIN users u ON i.userID = u.userID", (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});



router.get("/:id", (req, res) => {
  let id = req.params.id;
  let sql = 'SELECT * FROM images where imageID = ?';
  sql = mysql.format(sql, [id]);

  conn.query(sql, (err, result) => {
    if (err) throw err;

    if (result.length > 0) {
      let imageObject = result[0];
      res.status(201).json(imageObject);
    } else {
      res.status(404).json({ message: "image not found" });
    }
  });
});



router.delete("/:id", (req, res) => {
  let id = req.params.id;

  let voteSql = 'DELETE FROM votes WHERE imageID = ?';
  voteSql = mysql.format(voteSql, [id]);

  conn.query(voteSql, (err, voteResult) => {
    if (err) throw err;

    let statsSql = 'DELETE FROM statistics WHERE imageID = ?';
    statsSql = mysql.format(statsSql, [id]);

    conn.query(statsSql, (err, statsResult) => {
      if (err) throw err;

      let imageSql = 'DELETE FROM images WHERE imageID = ?';
      imageSql = mysql.format(imageSql, [id]);

      conn.query(imageSql, (err, imageResult) => {
        if (err) throw err;

        res.json({ message: "Image " + id + " has been deleted" });
      });
    });
  });
});

router.delete("/", (req, res) => {
  let body = req.body;

  for(let i=0; i<body.id.length; i++){
    let voteSql = 'DELETE FROM votes WHERE imageID = ?';
    let statsSql = 'DELETE FROM statistics WHERE imageID = ?';
    let imageSql = 'DELETE FROM images WHERE imageID = ?';

    // Format SQL queries with the current ID
    voteSql = mysql.format(voteSql, [body.id[i]]);
    statsSql = mysql.format(statsSql, [body.id[i]]);
    imageSql = mysql.format(imageSql, [body.id[i]]);

    // Delete from votes table
    conn.query(voteSql, (err, voteResult) => {
      if (err) throw err;
    });

    // Delete from statistics table
    conn.query(statsSql, (err, statsResult) => {
      if (err) throw err;
    });

    // Delete from images table
    conn.query(imageSql, (err, imageResult) => {
      if (err) throw err;
    });
  }
  

  res.json({ message: "Images have been deleted" });
});



router.put("/:id", async (req, res) => {
  const id = + req.params.id;
  console.log(id);
  let update: imageUpload = req.body; // รับข้อมูลที่ต้องการอัปเดตจาก req.body
  console.log(req.body);
  let updateOriginal: imageUpload | undefined;

  let sql = mysql.format("select * from images where imageID = ?", [id]);

  let result = await queryAsync(sql);
  const rawData = JSON.parse(JSON.stringify(result));
  console.log(rawData);
  updateOriginal = rawData[0] as imageUpload;
  console.log(updateOriginal);

  let updateImage = { ...updateOriginal, ...update };
  console.log(update);
  console.log(updateImage);
  sql =
    "update  `images` set `url`=?, `uploadDate`=?, `count`=?, `userID`=? where `imageID`=?";
  sql = mysql.format(sql, [
    updateImage.url,
    updateImage.uploadDate,
    updateImage.count,
    updateImage.userID,
    id
  ]);
  conn.query(sql, (err, result) => {
    if (err) throw err;
    res.status(201).json({ affected_row: result.affectedRows });
  });
});