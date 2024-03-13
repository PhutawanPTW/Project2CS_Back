import express from "express";
import { conn } from "../dbconnect";
import mysql from "mysql";
import { User, Vote, imageUpload } from "../model/model";
export const router = express.Router();


router.post("/", (req, res) => {
    let vote: Vote = req.body;
    let voteDate = new Date();

    let sql = "INSERT INTO `votes` (`userID`, `imageID`, `elorating`, `voteDate`) VALUES (?, ?, ?, ?)";
    sql = mysql.format(sql, [
        vote.userID,
        vote.imageID,
        vote.elorating,
        voteDate
    ]);

    conn.query(sql, (err, result) => {
        if (err) throw err;
        let img_sql = "SELECT * FROM images WHERE imageID = ?";
        img_sql = mysql.format(img_sql, [vote.imageID]);
        conn.query(img_sql, (err, img_result) => {
            if (err) throw err;
            let statisticSql = "SELECT * FROM statistics WHERE imageID = ? AND DATE(date) = CURDATE()";
            statisticSql = mysql.format(statisticSql, [img_result[0].imageID]);
            conn.query(statisticSql, (err, statisticResult) => {
                if (err) throw err;
                if (statisticResult.length > 0) {
                    console.log("already have data!");
                    if (statisticResult[0].date !== voteDate) {
                        let updateStatSql = "UPDATE statistics SET voteScore = ? WHERE imageID = ? AND DATE(date) = CURDATE()";
                        updateStatSql = mysql.format(updateStatSql, [
                            img_result[0].count,
                            img_result[0].imageID,
                        ]);

                        conn.query(updateStatSql, (err, updateStatResult) => {
                            if (err) {
                                console.error("Error updating existing statistics:", err);
                                return res.status(500).json({ message: "Internal Server Error" });
                            }

                            return res.status(200).json({ message: "Vote count and statistics updated successfully" });
                        });
                    } else {
                        console.log("err")
                        return res.status(200).json({ message: "Vote count already exists for today" });
                    }
                } else {
                    console.log("make new");
                    let newStatSql = "INSERT INTO `statistics` (`voteScore`, `date`, `imageID`) VALUES (?, ?, ?)";
                    newStatSql = mysql.format(newStatSql, [
                        img_result[0].count,
                        voteDate,
                        img_result[0].imageID
                    ]);

                    conn.query(newStatSql, (err, newStatResult) => {
                        if (err) {
                            console.error("Error inserting new statistics:", err);
                            return res.status(500).json({ message: "Internal Server Error" });
                        }

                        return res.status(200).json({ message: "Vote count and statistics updated successfully" });
                    });
                }
            });
        });

    });
});
