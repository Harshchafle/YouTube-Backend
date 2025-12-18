import jwt from "jsonwebtoken"
import asyncHandler from "express-async-handler"
import ApiErrors from "../utils/ApiErrors.js"

export const verifJwt = asyncHandler( async(req, res, next) => {    //-> middleware
    try{
        const token = req.cookie?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

        if(!token){
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