import express from "express";
import { conn } from "../dbconnect";
import mysql from "mysql";
import { User, imageUpload } from "../model/model";
export const router = express.Router();

//เอา user ทั้งหมด
router.get("/", (req, res) => {
  
  conn.query('SELECT * FROM users', (err, result) => {
    if(err) throw err;
    res.json(result);
  });
});

//ค้นหาจาก id
router.get("/:id", (req, res) => {
  let id = req.params.id;
  let sql = 'SELECT * FROM users where userID = ?';
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
  let sql = "INSERT INTO `users` (`username`, `password`, `email` , `type` , `image`) VALUES (?, ?, ?, ?,?)";
  let image = 'https://cdn-icons-png.freepik.com/256/1077/1077114.png';
  sql = mysql.format(sql, [
    user.username,
    user.password,
    user.email,
    user.type,
    image
  ]);
  console.log(user.password);

  conn.query(sql, (err, result) => {
    if (err) throw err;
    res.status(201).json({ affected_row: result.affectedRows, last_idx: result.insertId });
  })
})

router.post("user/upload" , (req , res)=>{
  let upload : imageUpload = req.body;
  let sql = "INSERT INTO `images` (`url`, `uploadDate`, `count`) VALUES (?,?,?)";
  // sql = mysql.format(sql, [
  //   user.username,
  //   user.password,
  //   user.email,
  //   user.type,
  //   image
  // ]);
})