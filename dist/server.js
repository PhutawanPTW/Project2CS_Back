"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const app_1 = require("./app");
const dbconnect_1 = require("./dbconnect");
const port = process.env.port || 3000;
const server = http_1.default.createServer(app_1.app);
dbconnect_1.conn.connect((err) => {
    if (err) {
        console.log("Connect database fail", err);
        return;
    }
    console.log("Success connect");
});
server.listen(port, () => {
    console.log("Server is started now!");
});
