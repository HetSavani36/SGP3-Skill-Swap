require('dotenv').config()
const cloudinary = require('cloudinary').v2
const fs=require('fs')


cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
    
});

const uploadOnCloudinary=async(localPath)=>{
    try {
        if (!localPath) return null
        const response=await cloudinary.uploader.upload(localPath,{resource_type:'auto'})
        fs.unlinkSync(localPath)
        return response.secure_url
    } catch (error) {
        console.log(error);
        try {
            fs.unlinkSync(localPath);
        } catch (fsErr) {
            console.error("Failed to delete local file:", fsErr);
        }
        return null
    }
}

module.exports=uploadOnCloudinary