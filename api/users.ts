import express from "express";
import { conn } from "../dbconnect";
import mysql from "mysql";
import { User, imageUpload } from "../model/model";
export const router = express.Router();

//เอา user ทั้งหมด
router.get("/", (req, res) => {
  console.log("get");
  conn.query("SELECT * FROM users", (err, result) => {
    if (err) throw err;
    res.json(result);
    
  });
});

router.get("/member", (req, res) => {
  let type = "user";
  let sql = "SELECT * FROM users where type = ?";
  sql = mysql.format(sql, [type]);

  conn.query(sql, (err, result) => {
    if (err) throw err;

    if (result.length > 0) {
      res.status(201).json(result);
    } else {
      res.status(404).json({ message: "User not found" });
    }
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

router.get("/profile/:id", (req, res) => {
  let id = req.params.id;
  let sql = "SELECT image FROM users WHERE userID = ?";
  sql = mysql.format(sql, [id]);

  conn.query(sql, (err, result) => {
    if (err) throw err;

    if (result.length > 0) {
      let userImage = result[0].image;
      res.status(201).json({ image: userImage });
    } else {
      res.status(404).json({ message: "User image not found" });
    }
  });
});

router.put("/:id", (req, res) => {
  
  let id = req.params.id;
  let user = req.body;
  console.log(user.oldPassword);
  let oldPassword = req.body.oldPassword;
  let newPassword = user.newPassword;
  let newUsername = user.username;
  let newEmail = user.email;
  let sqlSelect = "SELECT * FROM users WHERE userID = ?";
  let sqlUsernameCheck = "SELECT * FROM users WHERE username = ?";
  let sqlUpdate = "UPDATE `users` SET ";
  let values = [];
  let updateValues : any[] = [];

  if (newUsername) {
    sqlUpdate += "`username` = ?, ";
    updateValues.push(newUsername);
  }
  if (newPassword) {
    sqlUpdate += "`password` = ?, ";
    updateValues.push(newPassword);
  }
  if (newEmail) {
    sqlUpdate += "`email` = ?, ";
    updateValues.push(newEmail);
  }
  sqlUpdate = sqlUpdate.slice(0, -2); // ลบเครื่องหมาย comma ที่เหลือหลังตัวแปรที่สุดท้าย
  sqlUpdate += " WHERE `userID` = ?";
  updateValues.push(id);

  // ตรวจสอบว่ารหัสผ่านเก่าตรงกับที่เก็บในฐานข้อมูลหรือไม่
  conn.query(sqlSelect, [id], (err, result) => {
    if (err) throw err;

    if (result.length > 0) {
      let storedPassword = result[0].password;
      console.log(storedPassword);
      console.log(oldPassword);
      if (storedPassword === oldPassword) {

        conn.query(sqlUsernameCheck, [newUsername], (err, usernameResult) => {
          if (err) throw err;

          if (usernameResult.length === 0 || usernameResult[0].userID === id) {

            conn.query(sqlUpdate, updateValues, (err, result) => {
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

