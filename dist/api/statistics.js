"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const mysql_1 = __importDefault(require("mysql"));
const dbconnect_1 = require("../dbconnect");
exports.router = express_1.default.Router();
exports.router.get("/:id/:day", (req, res) => {
    let day = req.params.day;
    let id = req.params.id;
    let sql = 'SELECT * FROM statistics WHERE imageID = ? AND date >= CURDATE() - INTERVAL ? DAY order by date';
    sql = mysql_1.default.format(sql, [id, day]);
    dbconnect_1.conn.query(sql, (err, result) => {
        if (err)
            throw err;
        res.status(201).json(result);
    });
});
