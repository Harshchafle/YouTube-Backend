import {v2 as cloudinary} from "cloudinary";


cloudinary.config({
    cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
    api_key : process.env.CLOUDINARY_CLOUD_API,
    api_secret : process.env.CLOUDINARY_CLOUD_SECRET
})

// file upload method
const uploadOnCloudinary = async (localeFilepath) => {
    try{
        if(!localeFilepath) return null
        const res = await cloudinary.uploader.upload(localeFilepath, {resource_type : auto})
        console.log("file upload successful ",res)
        return res
    }
    catch(error){
        fs.unlink(localeFilepath) 
        return null
    }
}

export default {uploadOnCloudinary}