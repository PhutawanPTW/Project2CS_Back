import express from "express";
import mysql from "mysql";
import { conn } from "../dbconnect";

export const router = express.Router();

router.get("/", (req, res) => {
  console.log("get");
  conn.query("SELECT * FROM time", (err, result) => {
    if (err) {
      console.error("Error querying database:", err);
      res.status(500).json({ error: "Internal server error" });
      return;
    }
    // ใช้ res.json() เพื่อส่งข้อมูลกลับไปยัง client
    res.json(result[0]);
  });
});
router.post("/", (req, res) => {
  // รับค่า time จาก request body
  const time = req.body.time;

  // ตรวจสอบว่า time ถูกส่งมาหรือไม่
  if (!time) {
    res.status(400).json({ error: "Missing time parameter" });
    return;
  }

  // สร้างคำสั่ง SQL UPDATE เพื่ออัปเดตค่า time
  const sql = "UPDATE time SET time = ?";

  // ทำการ execute คำสั่ง SQL UPDATE
  conn.query(sql, time, (err, result) => {
    if (err) {
      console.error("Error updating time:", err);
      res.status(500).json({ error: "Internal server error" });
      return;
    }

    // ส่งข้อมูลที่ได้อัปเดตไปยัง client
    res.json({ message: "Time updated successfully" });
  });
});
