import jwt from "jsonwebtoken"
import asyncHandler from "express-async-handler"
import ApiErrors from "../utils/ApiErrors.js"
import { User } from "../models/User.model.js"

export const verifJwt = asyncHandler( async(req, res, next) => {    //-> middleware
    try{
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        // console.log("Token in middleware:", token);
        if(!token || typeof token !== "string"){
            throw new ApiErrors(401, "Unauthorised Access")
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id)
        .select("-password -refreshToken")

        if(!user){
            throw new ApiErrors(401, "Invalid Access Token")
        }

        req.user = user
        next()

    }
    catch(error){
        throw new ApiErrors(401, error.message || "Invalid Access Token")
    }
})