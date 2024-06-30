import { Request, Response } from 'express';
import { supabase } from '../../plugins/supabase';

const sanitizeFilename = (filename: string) => {
	return filename
		.replace(/[^a-z0-9_\-\.]/gi, '_')
		.replace(/_+/g, '_')
		.toLowerCase();
};

const uploadPhoto = async (req: Request, res: Response) => {
	try {
		if (!req.file) {
			return res.status(400).send({
				message: 'No file uploaded'
			});
		}

		const fileExt = req.file.mimetype.split('/')[1];
		const originalName = req.file.originalname.split('.')[0];
		const sanitizedOriginalName = sanitizeFilename(originalName);
		const uploadDate = new Date()
			.toISOString()
			.replace(/:/g, '-')
			.split('.')[0];
		const fileName = `${sanitizedOriginalName}_${uploadDate}.${fileExt}`;

		const { data, error } = await supabase.storage
			.from('avatars')
			.upload(`uploads/${fileName}`, req.file.buffer);

		if (error) {
			console.error('Error in uploadPhoto:', error);
			return res.status(500).send({
				message: 'An error occurred while uploading the photo'
			});
		}

		res.status(200).send({
			fileName: fileName,
			url: `https://gpseoginiqlrcwtfimkw.supabase.co/storage/v1/object/public/${data?.fullPath}`
		});
	} catch (e) {
		console.error('Error in uploadPhoto:', e);
		res
			.status(500)
			.send({ message: 'An error occurred while uploading the photo' });
	}
};

export default { uploadPhoto };
