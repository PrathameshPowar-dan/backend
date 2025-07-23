import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        // Upload the file
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });
        await fs.unlink(localFilePath)
        return response;
    } catch (error) {
        console.error('CLOUDINARY UPLOAD ERROR:', error.message);
        try {
            await fs.unlink(localFilePath);
            console.log('TEMP FILE DELETED:', localFilePath);
        } catch (unlinkErr) {
            console.error('FILE DELETE FAILED:', unlinkErr.message);
        }
        return null;
    }
};

export {uploadCloudinary};
