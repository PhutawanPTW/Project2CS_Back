"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const index_1 = require("./api/index");
const users_1 = require("./api/users");
const upload_1 = require("./api/upload");
const images_1 = require("./api/images");
const vote_1 = require("./api/vote");
const statistics_1 = require("./api/statistics");
const top_1 = require("./api/top");
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
exports.app = (0, express_1.default)();
exports.app.use((0, cors_1.default)({
    origin: "*",
}));
// app.use("/" , (rea , res)=>{
//    res.send("Hello world");
// });
exports.app.use(body_parser_1.default.json());
exports.app.use(body_parser_1.default.text());
exports.app.use("/", index_1.router);
exports.app.use("/users", users_1.router);
exports.app.use("/images", images_1.router);
exports.app.use("/upload", upload_1.router);
exports.app.use("/vote", vote_1.router);
exports.app.use("/statistics", statistics_1.router);
exports.app.use("/top", top_1.router);
