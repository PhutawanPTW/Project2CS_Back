import express from "express";
import path from "path";
import multer from "multer";
import { firebaseConfig } from "../api/config-fb";

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

class FileMiddleware {
  filename = "";
  // create multer object to save file in disk
  public readonly diskLoader = multer({
    // diskStorage = save to memmory
    storage: multer.memoryStorage(),
    // limit size
    limits: {
      fileSize: 67108864, // 64 MByte
    },
  });
}
const fileUpload = new FileMiddleware();
router.post("/", fileUpload.diskLoader.single("file"), async (req, res) => {
  const filename = Math.round(Math.random() * 10000) + "png";
  const storageRef = ref(storage, "image/" + filename);
  const metadata = {
    contentType: req.file!.mimetype,
  };
  const snapshot = await uploadBytesResumable(
    storageRef,
    req.file!.buffer,
    metadata
  );
  const downloadURL = await getDownloadURL(snapshot.ref);
  res.status(200).json({
    filename: downloadURL,
  });
});
