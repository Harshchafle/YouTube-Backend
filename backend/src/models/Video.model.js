import mongoose from "mongoose";
import { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
    {
        videoFile : {
            type : String,
            required : [true, "Video file is required"]
        },
        thumbnail : {
            type : String,
            required : [true, "Thumbnail is required"]
        },
        owner : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User",
            required : true
        },
        title : {
            type : String,
            required : true,
            trim : true,
            index : true    // For faster search
        },
        description : {
            type : String,
            required : true
        },
        duration : {
            type : Number,  // In seconds, we'll get this from Cloudinary
            required : true
        },
        views : {
            type : Number,
            default : 0
        },
        isPublished : {
            type : Boolean,
            default : true
        }
    },
    {
        timestamps : true
    }
)

videoSchema.plugin(mongooseAggregatePaginate)       // this is pending

export const Video = mongoose.model("Video", videoSchema)