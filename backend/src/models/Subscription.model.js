import mongoose from "mongoose";
import { Schema } from "mongoose";

const subscriptionSchema = new Schema(
    {
        subscriber : {  // who is subscribing
            typr: Schema.Types.ObjectId,
            ref : "User"
        },
        channel : {    // to whom subscriber is subscribing
            type : Schema.Types.ObjectId,
            ref : "User"
        }
    },
    {
        timestamps : true
    }
)

export const Subscription = mongoose.model("Subscription", subscriptionSchema)