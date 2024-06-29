"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.memoryStorage();
const types = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/gif',
    'image/webp',
    'image/ico',
    'image/svg+xml', // SVG-изображения
    'image/bmp', // BMP-изображения
    'image/tiff', // TIFF-изображения
    'image/vnd.microsoft.icon', // ICO-изображения
    'image/vnd.adobe.photoshop', // Photoshop PSD-файлы
    'image/x-icon', // Ico-изображения
    'image/vnd.dwg' // DWG-изображения
];
const fileFilter = (req, file, cb) => {
    if (types.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(null, false);
    }
};
exports.upload = (0, multer_1.default)({ storage, fileFilter });
