"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.memoryStorage();
const fileFilter = (req, file, cb) => {
    cb(null, true);
};
exports.upload = (0, multer_1.default)({ storage, fileFilter });
// import multer, { FileFilterCallback, StorageEngine } from 'multer';
// import { Request } from 'express';
// const storage: StorageEngine = multer.memoryStorage();
// const types = [
// 	'image/png',
// 	'image/jpeg',
// 	'image/jpg',
// 	'image/gif',
// 	'image/webp',
// 	'image/ico',
// 	'image/svg+xml',
// 	'image/bmp',
// 	'image/tiff',
// 	'image/vnd.microsoft.icon',
// 	'image/vnd.adobe.photoshop',
// 	'image/x-icon',
// 	'image/vnd.dwg',
// 	'image/heic',
// 	'image/heif'
// ];
// const fileFilter = (
// 	req: Request,
// 	file: Express.Multer.File,
// 	cb: FileFilterCallback
// ) => {
// 	if (types.includes(file.mimetype)) {
// 		cb(null, true);
// 	} else {
// 		cb(null, false);
// 	}
// };
// export const upload = multer({ storage, fileFilter });
