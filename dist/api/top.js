"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const dbconnect_1 = require("../dbconnect");
exports.router = express_1.default.Router();
exports.router.get("/today", (req, res) => {
    let sql = `
    SELECT i.userID, i.imageID, u.username, i.url, s.voteScore, s.date,
      RANK() OVER (ORDER BY s.voteScore DESC) AS rankToday 
    FROM 
      images i 
      JOIN statistics s ON i.imageID = s.imageID
      JOIN users u ON i.userID = u.userID 
    WHERE
      DATE(s.date) = CURRENT_DATE()
    ORDER BY 
      s.voteScore DESC 
    LIMIT 10`;
    dbconnect_1.conn.query(sql, (err, result) => {
        if (err)
            throw err;
        res.json(result);
    });
});
exports.router.get("/yesterday", (req, res) => {
    let sql = `
    SELECT i.userID, i.imageID, u.username, i.url, s.voteScore, s.date,
      RANK() OVER (ORDER BY s.voteScore DESC) AS rankYesterday 
    FROM 
      images i 
      JOIN statistics s ON i.imageID = s.imageID
      JOIN users u ON i.userID = u.userID 
    WHERE 
      DATE(s.date) = DATE(DATE_SUB(CURDATE(), INTERVAL 1 DAY))
    ORDER BY 
      s.voteScore DESC 
    LIMIT 10`;
    dbconnect_1.conn.query(sql, (err, result) => {
        if (err)
            throw err;
        res.json(result);
    });
});
