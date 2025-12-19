import {v2 as cloudinary} from "cloudinary";
import fs from 'fs/promises'


cloudinary.config({
    cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
    api_key : process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUDINARY_API_SECRET
})

// file upload method
const uploadOnCloudinary = async (localeFilepath) => {
    try{
        if(!localeFilepath) return null
        const res = await cloudinary.uploader.upload(localeFilepath, {resource_type : 'auto'})
        // console.log("file upload successful ")
        await fs.unlink(localeFilepath)
        return res
    }
    catch(error){
        await fs.unlink(localeFilepath) 
        console.error('Error during file upload:', error);
        return null
    }
}

export { uploadOnCloudinary }