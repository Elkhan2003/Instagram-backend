import { Request, Response } from 'express';
import { supabase } from '../../plugins/supabase';
import moment from 'moment/moment';

const sanitizeFilename = (filename: string) => {
	return filename
		.replace(/[^a-z0-9_\-\.]/gi, '_')
		.replace(/_+/g, '_')
		.toLowerCase();
};

const uploadFile = async (req: Request, res: Response) => {
	try {
		if (!req.file) {
			return res.status(400).send({
				message: 'No file uploaded'
			});
		}

		const fileExt = req.file.mimetype.split('/')[1];
		const originalName = req.file.originalname.split('.')[0];
		const sanitizedOriginalName = sanitizeFilename(originalName);
		// const uploadDate = new Date()
		// 	.toISOString()
		// 	.replace(/:/g, '-')
		// 	.split('.')[0];
		const uploadDate = moment().utcOffset(6).format('YYYY-MM-DD_HH:mm:ss_Z');
		const fileName = `${uploadDate}_${sanitizedOriginalName}.${fileExt}`;

		const { data, error } = await supabase.storage
			.from('file')
			.upload(`uploads/${fileName}`, req.file.buffer);

		if (error) {
			console.error('Error in uploadFile:', error);
			return res.status(500).send({
				message: 'An error occurred while uploading the file'
			});
		}

		res.status(200).send({
			name: fileName,
			format: req.file.mimetype,
			url: `https://mkbzjrvekdhtmgberujy.supabase.co/storage/v1/object/public/${data?.fullPath}`
		});
	} catch (e) {
		console.error('Error in uploadFile:', e);
		res
			.status(500)
			.send({ message: 'An error occurred while uploading the file' });
	}
};

const uploadMultipleFiles = async (req: Request, res: Response) => {
	try {
		if (!req.files || !Array.isArray(req.files)) {
			return res.status(400).send({
				message: 'No files uploaded'
			});
		}

		const uploadPromises = req.files.map(async (file) => {
			const fileExt = file.mimetype.split('/')[1];
			const originalName = file.originalname.split('.')[0];
			const sanitizedOriginalName = sanitizeFilename(originalName);
			// const uploadDate = new Date()
			// 	.toISOString()
			// 	.replace(/:/g, '-')
			// 	.split('.')[0];
			// const fileName = `${sanitizedOriginalName}_${uploadDate}.${fileExt}`;
			const uploadDate = moment().utcOffset(6).format('YYYY-MM-DD_HH:mm:ss_Z');
			const fileName = `${uploadDate}_${sanitizedOriginalName}.${fileExt}`;

			const { data, error } = await supabase.storage
				.from('file')
				.upload(`uploads/${fileName}`, file.buffer);

			if (error) {
				throw error;
			}

			return {
				name: fileName,
				format: file.mimetype,
				url: `https://mkbzjrvekdhtmgberujy.supabase.co/storage/v1/object/public/${data?.fullPath}`
			};
		});

		const uploadedFiles = await Promise.all(uploadPromises);

		res.status(200).send(uploadedFiles);
	} catch (e) {
		console.error('Error in uploadMultipleFiles:', e);
		res
			.status(500)
			.send({ message: 'An error occurred while uploading the files' });
	}
};

export default { uploadFile, uploadMultipleFiles };
