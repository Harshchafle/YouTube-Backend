import ApiErrors from "../utils/ApiErrors";
import { ApiResponses } from "../utils/ApiResponses";
import { asyncHandler } from "../utils/asyncHandler";
import { uploadOnCloudinary } from "../utils/cloudinary";
import { Video } from "./../models/Video.model";
import { v2 as cloudinary } from "cloudinary";
import fs from 'fs/promises';



const uploadVideo = asyncHandler( async (req, res) => {
    const videoLocalPath = req.files?.path;
    const thumbnailLocalPath = req.files?.path;
    const { title, description } = req.body;

    if(!videoLocalPath){
        throw new ApiErrors(400, "Video File is Required")
    }

    try {
        // Upload to Cloudinary
        videoUpload = await uploadOnCloudinary(videoLocalPath)
        thumbnailUpload = await uploadOnCloudinary(thumbnailLocalPath)

        if(!videoUpload.url || !thumbnailUpload.url){
            throw new ApiErrors(500, "Failed to upload files to Cloudinary")
        }

        // Save to MongoDB
        const video = Video.create({
            videoFile : videoUpload.url,
            thumbnail : thumbnailUpload.url,
            owner : req.user._id,
            title,
            description,
            duration : videoUpload.duration,
        })

        return res.status(200).json(
            new ApiResponses(200, video, "Video Uploaded Successfully")
        )
    }
    catch (error) {

        if(videoUpload.public_id) {
            await cloudinary.uploader.destroy(videoUpload.public_id, {
                resource_type : "video"
            });
            console.log("Cleaned video from Cloudinary");
        }
        
        if(thumbnailUpload.public_id) {
            await cloudinary.uploader.destroy(thumbnailUpload.public_id)
            console.log("Cleaned up thumbnail from Cloudinary");
        }

        throw new ApiErrors(500, "Video upload failed, please try again")
    }
    finally {

        if(fs.existSync(videoLocalPath)){
            fs.unlink(videoLocalPath);
        }

        if(fs.existSync(thumbnailLocalPath)){
            fs.unlink(thumbnailLocalPath);
        }
    }
})

const getAllVideos = asyncHandler( async (req, res) => {

})

const getVideoById = asyncHandler( async (req, res) => {

})

const updateVideo = asyncHandler( async (req, res) => {

})

const deleteVideo = asyncHandler( async (req, res) => {

})

export {
    uploadVideo,
    getAllVideos,
    getVideoById,
    updateVideo,
    deleteVideo,
}