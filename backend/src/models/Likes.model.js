import mongoose from "mongoose";
import { Schema } from "mongoose";

const likesSchema = mongoose.Schema(
    {
        targetType : {
            type : String,
            enum : ["Comment", "Video", "Tweet"],
            required : true,
        },
        targetId : {
            type : mongoose.Schema.Types.ObjectId,
            required : true,
            refPath : "targetType"
        },
        likedBy : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User",
            required : true
        }
    },
    {
        timestamps : true
    }
)

export const Like = mongoose.model("Like", likesSchema)