
import connectDB from './db/index.js';
import dotenv from "dotenv"

dotenv.config({
    path : "./.env"
})
connectDB() 


/* database connection using iffe
import mongoose from 'mongoose';
import DB_NAME from './constants.js'
import express from "express";

const app = express();
( async() => {   // we can write a function to connect to database but here we are using iffe syntax of async await 
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

        app.on("error",(error) => {
            console.log("ERROR : ",error)
            throw error
        })

        app.listen(process.env.PORT, () => {
            console.log(`App is running on port : ${process.env.PORT}`);
        })
    }
    catch(error){
        console.error("ERROR : "+error)
        throw error
    }
})
*/
