import express from "express";
import multer from "multer";
import { firebaseConfig } from "../api/config-fb";
import mysql from "mysql";
import { conn } from "../dbconnect";
import { initializeApp } from "firebase/app";
import {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytesResumable,
} from "firebase/storage";

// router กำหนดเส้นทาง ของ api
export const router = express.Router();

initializeApp(firebaseConfig);
const storage = getStorage();

// class FileMiddleware {
//   filename = "";
//   // create multer object to save file in disk
//   public readonly diskLoader = multer({
//     // diskStorage = save to memory
//     storage: multer.memoryStorage(),
//     // limit size
//     limits: {
//       fileSize: 67108864, // 64 MByte
//     },
//   });
// }

const upload = multer({ storage: multer.memoryStorage() });

router.post("/profileuser", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded!");
    }
    const dateTime = giveCurrentDateTime();

    const storageRef = ref(
      storage,
      `profile_images/${req.file.originalname + "       " + dateTime}`
    );

    const metadata = {
      contentType: req.file.mimetype,
    };

    const snapshot = await uploadBytesResumable(
      storageRef,
      req.file.buffer,
      metadata
    );
    const downloadURL = await getDownloadURL(snapshot.ref);

    const { userID, username, password, type, email } = req.body;

    let sql =
      "INSERT INTO `users`(`userID`, `username`, `password`, `image`, `type`, `email`) VALUES (?, ?, ?, ?, ?, ?)";
    sql = mysql.format(sql, [
      userID,
      username,
      password,
      downloadURL,
      type,
      email,
    ]);

    // Assuming `conn` is your MySQL connection object
    conn.query(sql, (err, result) => {
      if (err) throw err;
      res
        .status(201)
        .json({ affected_row: result.affectedRows, last_idx: result.insertId });
    });
    console.log("Profile user uploaded successfully.");
  } catch (error) {
    return res.status(400).send(error);
  }
});

router.post("/:id", upload.single("filename"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded!");
    }
    const dateTime = giveCurrentDateTime();

    const storageRef = ref(
      storage,
      `files/${req.file.originalname + "       " + dateTime}`
    );

    const metadata = {
      contentType: req.file.mimetype,
    };

    const snapshot = await uploadBytesResumable(
      storageRef,
      req.file.buffer,
      metadata
    );
    const downloadURL = await getDownloadURL(snapshot.ref);
    const pictureId = req.params.id;
    let sql =
      "INSERT INTO `images`(`url`, `uploadDate`, `count`, `userID`) VALUES (?, ?, ?, ?)";
    sql = mysql.format(sql, [downloadURL, dateTime, 1000, pictureId]);

    // Assuming `conn` is your MySQL connection object
    conn.query(sql, (err, result) => {
      if (err) throw err;
      res
        .status(201)
        .json({ affected_row: result.affectedRows, last_idx: result.insertId });
    });
    console.log("File successfully uploaded.");
  } catch (error) {
    return res.status(400).send(error);
  }
});

const giveCurrentDateTime = () => {
  const today = new Date();
  const date =
    today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
  const time =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  const dateTime = date + " " + time;
  return dateTime;
};

export default router;
