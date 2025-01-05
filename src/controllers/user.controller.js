import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiErrors } from "../utils/ApiErrors.js"
import { User } from "../models/User.model.js"
import uploadOnCloudinary from "../utils/cloudinary.js"
import { ApiResponses } from "../utils/ApiResponses.js"

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

    const {fullName, username, email, password} = req.body
    console.log("FullName : "+fullName+" |UserNAme : "+username+" |Email : "+email+" |Password : "+password)

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
        [fullName, username, email, password].some((field) => 
            field?.trim() === ""
        )){
            throw new ApiErrors(400, "All fields are Compulsory")
    }

    const existedUser = User.findOne(
        {
            $or : [{ username }, { email }]
        }
    )
    if( existedUser ){
        // console.log(existedUser.fullName)
        throw new ApiErrors(409, "User Already Exist")
    }

    const avtarLocalPath = req.files?.avtar[0].path 
    const coverImageLocalPath = req.files?.coverImage[0].path
    if( !avtarLocalPath ){
        throw new ApiErrors(400, "Avtar Required")
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
        userName : username.toLowerCase()
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

export {registerUser}