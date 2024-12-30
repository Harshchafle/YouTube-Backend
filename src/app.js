import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"

// create express app
const app = express()

// app configurations
app.use(cors({                          // => Cross Origins
    origin : process.env.CORS_ORIGIN
}))
app.use(express.json({limit: "16kb"}))  // => json data
app.use(express.urlencoded({            // => data from url
    extended : true, limit : "16kb"
}))
app.use(express.static("public"))       // => static files from public folder   
app.use(cookieParser())                 // => cookies onsite storage to server


// Handling error in app
app.on("ERROR IN APP", (err) => {
    console.log("ERROR OCCURED IN APP : ",err)
    throw err 
})

export default app        // => we can return also in this pattern : export {app}