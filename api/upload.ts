import express from "express";
import multer from "multer";
import { firebaseConfig } from "../api/config-fb";
import mysql from "mysql";
import { conn } from "../dbconnect";
import { initializeApp } from "firebase/app";
import { deleteObject } from "firebase/storage";
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

const load = multer({ storage: multer.memoryStorage() });

router.post("/:id", load.single("filename"), async (req, res) => {
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

const upload = multer({ storage: multer.memoryStorage() });

router.put("/profile/:userID", upload.single("image"), async (req, res) => {
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

    const { userID } = req.params;

    let sql = "UPDATE `users` SET `image` = ? WHERE `userID` = ?";
    sql = mysql.format(sql, [downloadURL, userID]);

    // Assuming `conn` is your MySQL connection object
    conn.query(sql, (err, result) => {
      if (err) throw err;
      res.status(200).json({
        message: "Profile image updated successfully.",
        affected_row: result.affectedRows,
      });
    });
    console.log("Profile user updated successfully.");
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



router.put(
  "/changeImage/:imageID",
  upload.single("fileimage"),
  async (req, res) => {
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

      const { imageID } = req.params;

      // Delete all related data for the old imageID
      let deleteSql = "DELETE FROM `votes` WHERE `imageID` = ?";
      deleteSql = mysql.format(deleteSql, [imageID]);

      conn.query(deleteSql, (err, result) => {
        if (err) throw err;
        console.log("Deleted related votes data");
      });

      deleteSql = "DELETE FROM `statistics` WHERE `imageID` = ?";
      deleteSql = mysql.format(deleteSql, [imageID]);

      conn.query(deleteSql, (err, result) => {
        if (err) throw err;
        console.log("Deleted related statistics data");
      });

      // Update the image data with the new image URL and count
      let updateSql =
        "UPDATE `images` SET `url` = ?, `uploadDate` = ?, `count` = ? WHERE `imageID` = ?";
      updateSql = mysql.format(updateSql, [
        downloadURL,
        dateTime,
        1000,
        imageID,
      ]);

      conn.query(updateSql, (err, result) => {
        if (err) throw err;
        console.log("Updated image data");
        res.status(200).json({ message: "Image updated successfully." });
      });
    } catch (error) {
      return res.status(400).send(error);
    }
  }
);
