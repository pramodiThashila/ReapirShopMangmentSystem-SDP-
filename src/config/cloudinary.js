
const cloudinary = require("cloudinary").v2;
// const cloudinary = require("../config/cloudinary");
console.log("Cloudinary Loaded:", cloudinary.config());

// Configure Cloudinary with hardcoded credentials
cloudinary.config({
    cloud_name: "dq7wwoghp", 
    api_key: "523353779431514", 
    api_secret: "W-zjs22NgNsNsAr9Dw3nLaWyi7M", 
});

//console.log("Cloudinary Config in cloudinary.js:", cloudinary.config()); // Debug log

module.exports = cloudinary;