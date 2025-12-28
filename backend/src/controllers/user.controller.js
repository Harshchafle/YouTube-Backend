import { asyncHandler } from "../utils/asyncHandler.js"
import ApiErrors from "../utils/ApiErrors.js"
import { User } from "../models/User.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponses } from "../utils/ApiResponses.js"
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken = async( userId ) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        console.log("Generated Tokens : ", accessToken, refreshToken)
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave : false })
        
        return { accessToken, refreshToken }
    }
    catch(error){
        throw new ApiErrors(500,  error || "Something Went Wrong")
    }
}

const registerUser = asyncHandler( async (req, res) => {
    /****
     **** Algorithm for registering a user
     * 1. getUser details from frontend
     * 2. validation - not empty
     * 3. check if user already exists - username, email
     * 4. check for images and avtar
     * 5. create user object , create entry in DB
     * 6. remove password and refresh token field from response
     * 7. check for user creation
     * 8. return response
     */

    const {fullName, userName, email, password} = req.body
    // console.log("FullName : "+fullName+" |UserNAme : "+username+" |Email : "+email+" |Password : "+password)

    /*
    if(fullName === ""){
        throw new ApiErrors(400, "Invalid FullName")
    }
    if(username === ""){
        throw new ApiErrors(400, "UserName cant be empty")
    }
    if(email === ""){
        throw new ApiErrors(400, "Email Required")
    }
    if(password === ""){
        throw new ApiErrors(400, "Password Required")
    }
    */
    
    if(
        [fullName, userName, email, password].some((field) => 
            field?.trim() === ""
        )
    ){
        throw new ApiErrors(400, "All fields are Compulsory")
    }

    const existedUser = await User.findOne(
        {
            $or : [{ userName }, { email }]
        }
    )
    if( existedUser ){
        // console.log(existedUser.fullName)
        throw new ApiErrors(409, "User Already Exist")
    }

    // req.files -> multer middleware
    const avtarLocalPath = req.files?.avtar[0].path 
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files?.coverImage[0].path
    }

    if( !avtarLocalPath ){
        throw new ApiErrors(400, "Avtar field cannot be empty")
    }

    const avtar = await uploadOnCloudinary(avtarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if(!avtar){
        throw new ApiErrors(400, "Avtar Required")
    }

    const user = await User.create({
        fullName,
        avtar : avtar.url,
        coverImage : coverImage?.url || "",
        email,
        password,
        userName : userName.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiErrors(500, "It's not you , It's US where error Caused")
    }

    return res.status(201).json(
        new ApiResponses(200, registerUser, "User registered Successfully")
    )

})

const loginUser = asyncHandler( async (req, res) => {
    /****
     **** Algorithm for login a user
     * 1. getUser details from frontend -> req.body
     * 2. validation - not empty -> !username || !email
     * 3. check if user exists - username, email -> User.findOne
     * 4. check password -> isPasswordValid
     * 5. create refresh token -> create method generateAccessAndRefreshToken()
     * 6. remove password and refresh token field from response -> .select("-password -refreshToken")
     * 7. return response -> ret res.cookie(accessToken).cookie(refreshToken).json(ststCode, data, msg)
     */
    // test user : testuser, harshcafle@gmail.com , harsh@123 

    const { userName , email , password } = req.body
    // console.log("Login Req Body : ",req.body)
    if(!(userName || email)){
        throw new ApiErrors(400, "Invalid login credentials")
    }

    const existedUser = await User.findOne(
        { $or : [ { userName } , { email } ] }
    )

    if(!existedUser){
        throw new ApiErrors(400, "user does not exist with provided Email or Username")
    }

    const isPasswordValid = await existedUser.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiErrors(401, "InCorrect Password")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(existedUser._id)

    const loggedInUser = await User.findById(existedUser._id).select(
        "-password -refreshToken"
    )

    // security of cookie
    const options = {
        httpOnly : true,
        secure : true  // in devlopment it will be false but in production it should be true
    }

    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponses(
            200,
            {
                user : loggedInUser, accessToken, refreshToken
            },
            "User Loggedin SuccessFully"
        )
    )

})

const logoutUser = asyncHandler( async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set : {
                refreshToken : undefined
            }
        },
        {
            new : true
        }
    )

    const options = {
        httpOnly : true,
        secure : true
    }

    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponses(200, {}, "User logged Out"))
})

const refershAccessToken = asyncHandler( async (req, res) => {
    const incomingrefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingrefreshToken){
        throw new ApiErrors(401, "Unauthorised Access plese login first")
    }

    try {
        const decodedToken = jwt.verify(
            incomingrefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if(!user){
            throw new ApiErrors(401, "INVALID  REFRESH TOKEN")
        }
    
        if(incomingrefreshToken !== user?.refreshToken){
            throw new ApiErrors(401, "Refresh Token is Expired or used")
        }
    
        const options ={
            httpOnly : true,
            secure : true
        }
    
        const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user._id)
    
        return res.
        status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            200,
            {
                accessToken, refreshToken : newRefreshToken
            },
            "AccessTOken Refreshed"
        )
    } catch (error) {
        throw new ApiErrors(401, error?.message || "Invalid Refresh Token")
    }   
})

const changePassword = asyncHandler( async (req, res) => {
    const { oldPassword, newPassword, confirmNewPassword } = req.body

    // We can use req.user.id because user changing pass means he is logged in and logged in user has a middleware adding user in req
    const user = await User.findById(req.user?._id)

    const isPasswordValid = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordValid){
        throw new ApiErrors(400, "Invalid Current Password")
    }

    if(newPassword !== confirmNewPassword){
        throw new ApiErrors(401, "New Password and Confirm password are not matching")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponses( 200, {}, "Password changed Sussessfully" ))
})

const getUser = asyncHandler( async (req, res) => {
    return res
    .status(200)
    .json(new ApiResponses(200, req.user, "User fetched successfully"))
})

const updateUserDetails = asyncHandler( async (req, res) => {
    const  { fullName, email } = req.body

    if(!(fullName || email)){
        throw new ApiErrors(400, "Bad Request to change fullName or Email")
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set : {
                fullName,       // both ways are correct to update fields
                email : email
            }
        },
        {new : true}
    ).select("-password -refreshToken")

    return res
    .status(200)
    .json(
        new ApiResponses(200, updatedUser, "User details updated successfully")
    )
})

const updateUserAvtar = asyncHandler( async (req, res) => {
    const avtarLocalPath = req.files?.path

    if(!avtarLocalPath){
        throw new ApiErrors(400, "Avtar file is missing")
    }

    const avtar = await uploadOnCloudinary(avtarLocalPath)

    if(!avtar.url){
        throw new ApiErrors(500, "Error while uploading avtar on cloudinary")
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set : {
                avtar : avtar.url
            }
        },
        {new  : true}
    ).select("-password -refreshToken")

    return res
    .status(200)
    .json(
        new ApiResponses(200, updatedUser, "User Avtar changed Successfully")
    )
})

const updateUserCoverImage = asyncHandler( async (req, res) => {
    const coverImageLocalPath = req.files?.path

    if(!coverImageLocalPath){
        throw new ApiErrors(400, "Cover Image is missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage.url){
        throw new ApiErrors(401, "Error while uploading cover Image on cloudinary")
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set : {
                coverImage : coverImage.url
            }
        },
        {new : true}
    ).select("-password -refreshToken")

    return res
    .status(200)
    .json(
        new ApiResponses(200, updatedUser, "Cover Image Updated Successfully")
    )
})

const userChannelProfile = asyncHandler( async (req, res) => {
    const { userName } = req.params

    if(!userName.trim()){
        throw new ApiErrors(400, "userName is missing")
    }

    // Aggregation pipelines
    const channel = await User.aggregate(
        [
            {
                $match : {
                    userName : userName?.toLowerCase()
                }
            },
            {
                $lookup : {
                    from : "subscriptions",
                    localField : "_id",
                    foreignField : "channel",
                    as : "subscribers"
                }
            },
            {
                $lookup : {
                    from : "subscriptions",
                    localField : "_id",
                    foreignField : "subscribers",
                    as : "subscibedTo"
                }
            },
            {
                $addFields : {
                    subscribersCount : {
                        $size : "$subscribers"
                    },
                    channelSubscribedToCount : {
                        $size : "$subscribedTo"
                    },
                    isSubscribed : {
                        $cond : {
                            if : { $in : [req.user?._id, "$subscribers.subscriber"] },
                            then : true,
                            else : false
                        }
                    }
                }
            },
            {
                $project : {
                    fullName : 1,
                    userName : 1,
                    subscribersCount : 1,
                    channelSubscribedToCount : 1,
                    isSubscribed : 1,
                    avtar : 1,
                    coverImage : 1,
                    email : 1
                }
            }
        ]
    )

    if(!channel?.length){
        throw new ApiErrors(400, "Channel does not exist")
    }

    return res
    .status(200)
    .json(
        new ApiResponses(200, "Profile fetched Successfully")
    )
})

const getWatchHistory = asyncHandler(async (req, res) => {
    const user = User.aggregate([
        {
            $match : {
                _id : new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup : {
                from : "videos",
                localField : "watchHistory",
                foreignField : "_id",
                as : "watchHistory",
                pipeline : [
                    {
                        $lookup : {
                            from : 'users',
                            localField : "owner",
                            foreignField : "_id",
                            as : "owner",
                            pipeline : [
                                {
                                    $project : {
                                        fullName : 1,
                                        userName : 1,
                                        avtar : 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields : {
                            owner : {
                                $first : "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponses(
            200,
            user[0].watchHistory,
            "Watch history fetched successfully"
        )
    )
})

export { 
    registerUser, 
    loginUser, 
    logoutUser,
    refershAccessToken,
    changePassword,
    getUser,
    updateUserDetails,
    updateUserAvtar,
    updateUserCoverImage,
    userChannelProfile,
    getWatchHistory,
}