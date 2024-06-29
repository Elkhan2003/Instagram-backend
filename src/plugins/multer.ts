import multer, { FileFilterCallback, StorageEngine } from 'multer';
import { Request } from 'express';

const storage: StorageEngine = multer.memoryStorage();

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

const fileFilter = (
	req: Request,
	file: Express.Multer.File,
	cb: FileFilterCallback
) => {
	if (types.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb(null, false);
	}
};

export const upload = multer({ storage, fileFilter });
