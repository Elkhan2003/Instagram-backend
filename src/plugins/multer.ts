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
	'image/svg+xml',
	'image/bmp',
	'image/tiff',
	'image/vnd.microsoft.icon',
	'image/vnd.adobe.photoshop',
	'image/x-icon',
	'image/vnd.dwg'
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
