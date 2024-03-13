"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const dbconnect_1 = require("../dbconnect");
const mysql_1 = __importDefault(require("mysql"));
exports.router = express_1.default.Router();
exports.router.get("/", (req, res) => {
    dbconnect_1.conn.query("SELECT i.userID, i.imageID, i.url, u.username, i.count FROM images i JOIN users u ON i.userID = u.userID", (err, result) => {
        if (err)
            throw err;
        res.json(result);
    });
});
exports.router.get("/:id", (req, res) => {
    let id = req.params.id;
    let sql = 'SELECT * FROM images where imageID = ?';
    sql = mysql_1.default.format(sql, [id]);
    dbconnect_1.conn.query(sql, (err, result) => {
        if (err)
            throw err;
        if (result.length > 0) {
            let imageObject = result[0];
            res.status(201).json(imageObject);
        }
        else {
            res.status(404).json({ message: "image not found" });
        }
    });
});
exports.router.delete("/:id", (req, res) => {
    let id = req.params.id;
    let voteSql = 'DELETE FROM votes WHERE imageID = ?';
    voteSql = mysql_1.default.format(voteSql, [id]);
    dbconnect_1.conn.query(voteSql, (err, voteResult) => {
        if (err)
            throw err;
        let statsSql = 'DELETE FROM statistics WHERE imageID = ?';
        statsSql = mysql_1.default.format(statsSql, [id]);
        dbconnect_1.conn.query(statsSql, (err, statsResult) => {
            if (err)
                throw err;
            let imageSql = 'DELETE FROM images WHERE imageID = ?';
            imageSql = mysql_1.default.format(imageSql, [id]);
            dbconnect_1.conn.query(imageSql, (err, imageResult) => {
                if (err)
                    throw err;
                res.json({ message: "Image " + id + " has been deleted" });
            });
        });
    });
});
exports.router.delete("/", (req, res) => {
    let body = req.body;
    for (let i = 0; i < body.id.length; i++) {
        let voteSql = 'DELETE FROM votes WHERE imageID = ?';
        let statsSql = 'DELETE FROM statistics WHERE imageID = ?';
        let imageSql = 'DELETE FROM images WHERE imageID = ?';
        // Format SQL queries with the current ID
        voteSql = mysql_1.default.format(voteSql, [body.id[i]]);
        statsSql = mysql_1.default.format(statsSql, [body.id[i]]);
        imageSql = mysql_1.default.format(imageSql, [body.id[i]]);
        // Delete from votes table
        dbconnect_1.conn.query(voteSql, (err, voteResult) => {
            if (err)
                throw err;
        });
        // Delete from statistics table
        dbconnect_1.conn.query(statsSql, (err, statsResult) => {
            if (err)
                throw err;
        });
        // Delete from images table
        dbconnect_1.conn.query(imageSql, (err, imageResult) => {
            if (err)
                throw err;
        });
    }
    res.json({ message: "Images have been deleted" });
});
exports.router.put("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = +req.params.id;
    console.log(id);
    let update = req.body; // รับข้อมูลที่ต้องการอัปเดตจาก req.body
    console.log(req.body);
    let updateOriginal;
    let sql = mysql_1.default.format("select * from images where imageID = ?", [id]);
    let result = yield (0, dbconnect_1.queryAsync)(sql);
    const rawData = JSON.parse(JSON.stringify(result));
    console.log(rawData);
    updateOriginal = rawData[0];
    console.log(updateOriginal);
    let updateImage = Object.assign(Object.assign({}, updateOriginal), update);
    console.log(update);
    console.log(updateImage);
    sql =
        "update  `images` set `url`=?, `uploadDate`=?, `count`=?, `userID`=? where `imageID`=?";
    sql = mysql_1.default.format(sql, [
        updateImage.url,
        updateImage.uploadDate,
        updateImage.count,
        updateImage.userID,
        id
    ]);
    dbconnect_1.conn.query(sql, (err, result) => {
        if (err)
            throw err;
        res.status(201).json({ affected_row: result.affectedRows });
    });
}));
