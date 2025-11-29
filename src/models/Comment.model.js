import mongoose from "mongoose"
import { Schema } from "mongoose"

const commentSchema = mongoose.Schema(
    {
        id : {
            type : Number,
            required : true,
            unique : true,
        },
        content : {
            type : String,
            required : true,
            length : (500, "max 500 characters"),
        },
        video : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Video"
        },
        owner : {
            type : String,
            required : true,
            lowercase : true,
        }
    },
    {
        timestamps : true
    }
)

export const Comment = mongoose.model("Comment", commentSchema)