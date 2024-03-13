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
const multer_1 = __importDefault(require("multer"));
const config_fb_1 = require("../api/config-fb");
const app_1 = require("firebase/app");
const storage_1 = require("firebase/storage");
// router กำหนดเส้นทาง ของ api
exports.router = express_1.default.Router();
(0, app_1.initializeApp)(config_fb_1.firebaseConfig);
const storage = (0, storage_1.getStorage)();
class FileMiddleware {
    constructor() {
        this.filename = "";
        // create multer object to save file in disk
        this.diskLoader = (0, multer_1.default)({
            // diskStorage = save to memmory
            storage: multer_1.default.memoryStorage(),
            // limit size
            limits: {
                fileSize: 67108864, // 64 MByte
            },
        });
    }
}
const fileUpload = new FileMiddleware();
exports.router.post("/", fileUpload.diskLoader.single("file"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filename = Math.round(Math.random() * 10000) + "png";
    const storageRef = (0, storage_1.ref)(storage, "image/" + filename);
    const metadata = {
        contentType: req.file.mimetype,
    };
    const snapshot = yield (0, storage_1.uploadBytesResumable)(storageRef, req.file.buffer, metadata);
    const downloadURL = yield (0, storage_1.getDownloadURL)(snapshot.ref);
    res.status(200).json({
        filename: downloadURL,
    });
}));
