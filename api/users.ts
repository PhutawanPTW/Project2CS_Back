import express from "express";
import { conn } from "../dbconnect";
import mysql from "mysql";
import { User, imageUpload } from "../model/model";
export const router = express.Router();

//เอา user ทั้งหมด
router.get("/", (req, res) => {
  conn.query("SELECT * FROM users", (err, result) => {
    if (err) throw err;
    res.json(result);
    
  });
});

//ค้นหาจาก id
router.get("/:id", (req, res) => {
  let id = req.params.id;
  let sql = "SELECT * FROM users where userID = ?";
  sql = mysql.format(sql, [id]);

  conn.query(sql, (err, result) => {
    if (err) throw err;

    if (result.length > 0) {
      let userObject = result[0];
      res.status(201).json(userObject);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  });
});

//insert user
router.post("/", (req, res) => {
  let user: User = req.body;
  let sql =
    "INSERT INTO `users` (`username`, `password`, `email` , `type` , `image`) VALUES (?, ?, ?, ?,?)";
  let image = "https://cdn-icons-png.freepik.com/256/1077/1077114.png";
  sql = mysql.format(sql, [
    user.username,
    user.password,
    user.email,
    user.type,
    image,
  ]);
  console.log(user.password);

  conn.query(sql, (err, result) => {
    if (err) throw err;
    res
      .status(201)
      .json({ affected_row: result.affectedRows, last_idx: result.insertId });
  });
});

router.post("user/upload", (req, res) => {
  let upload: imageUpload = req.body;
  let sql =
    "INSERT INTO `images` (`url`, `uploadDate`, `count`) VALUES (?,?,?)";
  // sql = mysql.format(sql, [
  //   user.username,
  //   user.password,
  //   user.email,
  //   user.type,
  //   image
  // ]);
});

router.put("update/:id", (req, res) => {
  let id = req.params.id;
  let user: User = req.body;
  let oldPassword = req.body.oldPassword; // รหัสผ่านเก่า
  let newPassword = req.body.newPassword; // รหัสผ่านใหม่
  let newUsername = req.body.username; // ชื่อผู้ใช้ใหม่
  let sqlSelect = "SELECT * FROM users WHERE userID = ?";
  let sqlUsernameCheck = "SELECT * FROM users WHERE username = ?";
  let sqlUpdate = "UPDATE `users` SET `username` = ?, `password` = ?, `image` = ? WHERE `userID` = ?";
  let image = user.image || "https://cdn-icons-png.freepik.com/256/1077/1077114.png";

  // ตรวจสอบว่ารหัสผ่านเก่าตรงกับที่เก็บในฐานข้อมูลหรือไม่
  conn.query(sqlSelect, [id], (err, result) => {
    if (err) throw err;

    if (result.length > 0) {
      let storedPassword = result[0].password;

      // เปรียบเทียบรหัสผ่านเก่ากับรหัสผ่านที่เก็บ
      if (storedPassword === oldPassword) {
        // ตรวจสอบว่าชื่อผู้ใช้ใหม่ถูกใช้แล้วหรือยัง
        conn.query(sqlUsernameCheck, [newUsername], (err, usernameResult) => {
          if (err) throw err;

          // ถ้าชื่อผู้ใช้ใหม่ยังไม่ถูกใช้หรือเป็นของผู้ใช้ที่กำลังอัปเดต
          if (usernameResult.length === 0 || usernameResult[0].userID === id) {
            // ดำเนินการต่อไปกับการอัปเดต
            // เตรียมคำสั่ง SQL สำหรับการอัปเดต
            let updateSql = mysql.format(sqlUpdate, [newUsername, newPassword, image, id]);

            // ดำเนินการอัปเดตคำสั่ง
            conn.query(updateSql, (err, result) => {
              if (err) throw err;
              res.status(200).json({ affected_row: result.affectedRows });
            });
          } else {
            res.status(400).json({ message: "ชื่อผู้ใช้ถูกใช้แล้ว" });
          }
        });
      } else {
        res.status(400).json({ message: "รหัสผ่านเก่าไม่ตรงกัน" });
      }
    } else {
      res.status(404).json({ message: "ไม่พบผู้ใช้" });
    }
  });
});

