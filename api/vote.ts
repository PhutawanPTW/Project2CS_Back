import express from "express";
import { conn } from "../dbconnect";
import mysql from "mysql";
import { User, Vote, imageUpload } from "../model/model";
export const router = express.Router();


router.post("/", (req, res) => {
    let vote: Vote = req.body;

    let sql = "INSERT INTO `votes` (`userID`, `imageID`, `elorating`, `voteDate`) VALUES (?, ?, ?, NOW())";
    sql = mysql.format(sql, [
        vote.userID,
        vote.imageID,
        vote.elorating,
    ]);

    conn.query(sql, (err, result) => {
        if (err) {
            console.error("Error updating vote count:", err);
            return res.status(500).json({ message: "Internal Server Error" });
        }
        return res.status(200).json({ message: "Vote count updated successfully" });
    });
});