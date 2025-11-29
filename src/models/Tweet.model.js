import mongoose from "mongoose";
import { Schema } from "mongoose";

const tweetSchema = mongoose.Schema(
    {
        id : {
            type : Number,
            required : true,
            unique : true,
        },
        owner : {
            type : String,
            required : true,
            unique : true,
            lowercase : true,
        },
        content : {
            type : String,
            required : true,
            length : (500, "max 500 characters"),
        }
    },
    {
        timestamps : true
    }
)

export const Tweet = mongoose.model("Tweet", tweetSchema)