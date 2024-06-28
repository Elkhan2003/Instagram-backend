"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_1 = require("../../plugins/supabase");
const uploadPhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send({
                message: 'No file uploaded'
            });
        }
        const fileExt = req.file.mimetype.split('/')[1];
        const originalName = req.file.originalname.split('.')[0].replace(/ /g, '_');
        const uploadDate = new Date()
            .toISOString()
            .replace(/:/g, '-')
            .split('.')[0];
        const fileName = `${originalName}_${uploadDate}.${fileExt}`;
        // Upload the file to Supabase storage
        const { data, error } = await supabase_1.supabase.storage
            .from('avatars')
            .upload(`uploads/${fileName}`, req.file.buffer);
        if (error) {
            console.error('Error in uploadPhoto:', error);
            return res.status(500).send({
                message: 'An error occurred while uploading the photo'
            });
        }
        res.status(200).send({ file: fileName });
    }
    catch (e) {
        console.error('Error in uploadPhoto:', e);
        res
            .status(500)
            .send({ message: 'An error occurred while uploading the photo' });
    }
};
exports.default = { uploadPhoto };
