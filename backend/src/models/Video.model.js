import mongoose from "mongoose";
import { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
    {
        videoFile : {
            type : String,
            required : true
        },
        thumbNail : {
            type : String,
            required : true
        },
        title : {
            type : String,
            required : true
        },
        description : {
            type : String,
            required : true
        },
        duration : {
            type : Number,
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