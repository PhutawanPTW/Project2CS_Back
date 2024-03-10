import express from "express";
import { conn, queryAsync } from "../dbconnect";
import mysql from "mysql";
import { User, imageUpload } from "../model/model";
export const router = express.Router();

router.get("/", (req, res) => {
  conn.query("SELECT * FROM images", (err, result) => {
    if (err) throw err;
    res.json(result);
  });
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



