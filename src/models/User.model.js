import mongoose from "mongoose";
import { Schema } from "mongoose";
import  jwt  from "jsonwebtoken";
import  bcrypt  from "bcrypt";

// Defining userSchema
const userSchema = new Schema(
    {
        userName : {
            type : String,
            required : true,
            unique : true,
            lowercase : true,
            trim : true,
            index : true,
        },
        email : {
            type : String,
            required : true,
            unique : true,
            lowercase : true,
            trim : true,
        },
        fullName : {
            type : String,
            required : true,
            unique : true,
            trim : true,
            index : true,
        },
        avtar : {
            type : String,
            required : true,
        },
        coverImage : {
            type : String,
        },
        watchHistory : {
            type : {
                type : Schema.Types.ObjectId,
                ref : "Videos"
            }
        },
        password : {
            type : String,
            required : [true , "Password id required"]
        },
        refreshToken : {
            type : String
        }
    },
    {
        timestamps : true
    }
)

// 1. Encrypting the password , usr schema.pre()
userSchema.pre("save", async function(next){
    if(!this.isModified("password")) {
        return next()
    }
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

// 2. check password is correct or not - Authentication - schema method injection using .methods
userSchema.methods.isPasswordCorrect = async function(password){
    return bcrypt.compare(password, this.password)
}

// 3. generate AccessToken
userSchema.methods.generateAccessToken = async function(){
    return await jwt.sign(
        {
            _id : this._id,
            email : this.email,
            userName : this.userName,
            fullName : this.fullName,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn : process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

// 4. generate RefreshToken
userSchema.methods.generateRefreshToken = async function(){
    return jwt.sign(
        {
            _id : this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn : process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}



export const User = mongoose.model("User", userSchema);