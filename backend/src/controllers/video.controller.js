import mongoose from "mongoose";
import ApiErrors from "../utils/ApiErrors";
import { ApiResponses } from "../utils/ApiResponses";
import { asyncHandler } from "../utils/asyncHandler";
import { uploadOnCloudinary } from "../utils/cloudinary";
import { Video } from "./../models/Video.model";
import { v2 as cloudinary } from "cloudinary";
import fs from 'fs/promises';
import { title } from "process";



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
    /*
    Step 1: Extract and validate query parameters
        - Get page, limit, sortBy, sortType, query, userId from req.query
        - Set defaults: page=1, limit=10, sortBy=createdAt, sortType=desc
        - Convert strings to numbers where needed

    Step 2: Build MongoDB aggregation pipeline
        - Stage 1: $match - Filter only published videos
        - Stage 2: $match - If userId provided, filter by owner
        - Stage 3: $match - If query provided, search in title/description
        - Stage 4: $lookup - Populate owner details (username, avatar)
        - Stage 5: $sort - Sort by specified field
        - Stage 6: $skip - Skip videos from previous pages
        - Stage 7: $limit - Limit results per page

    Step 3: Execute aggregation with pagination plugin
        - Use mongooseAggregatePaginate (you already added this to schema!)
        - Get total count, page info, and results

    Step 4: Return response
        - Send videos array with pagination metadata
    */

    const { 
        page = 1, 
        limit = 10, 
        query, 
        sortBy = "createdAt", 
        sortType = "desc", 
        userId 
    } = req.query;

    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)

    // Build match condition
    const matchStage ={
        isPublished : true
    }

    // if user Id provided , filter by owner
    if (userId) {
        matchStage.owner = mongoose.Types.ObjectId(userId)
    }

    // If search query provided, add text search
    if (query) {
        matchStage.$or = [
            { title : { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } }
        ]
    }

    // Build aggregation pipeline
    
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