import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from 'multer'
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath,foldername) => {
  try {
    if (!localFilePath) return null;
    //upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: foldername, // Store images in a folder
    });
    // file has been uploaded successfull
    //console.log("file is uploaded on cloudinary ", response.url);
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
        return null;
  }
};

const getMulterUpload = (folderName) => {
    const storage = new CloudinaryStorage({
        cloudinary,
        params: {
            folder: `Foxboro/${folderName}`,
            allowedFormats: ['jpg', 'png', 'jpeg', 'gif'],
            transformation: [{ width: 500, height: 500, crop: 'limit' }]
        }
    });

    return multer({ storage });
};

export { uploadOnCloudinary,getMulterUpload };
