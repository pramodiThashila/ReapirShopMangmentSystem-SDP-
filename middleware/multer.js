const multer = require("multer");
const cloudinary = require("../src/config/cloudinary"); // Fix the path
const path = require("path");
const fs = require("fs");

// Configure Multer for local file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage,
    fileFilter: (req, file, cb) => {
        // Accept images only
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

// Function to upload file to cloudinary
const uploadToCloudinary = async (filePath) => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder: "repair_shop_products"
        });
        
        // Delete local file after successful upload
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        
        return result;
    } catch (error) {
        // Clean up on error
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        throw error;
    }
};

module.exports = { upload, uploadToCloudinary };