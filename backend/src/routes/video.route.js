import { Router } from "express";
import { verifJwt } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/multer.middleware";
import { 
    deleteVideo,
    getAllVideos, 
    getVideoById, 
    updateVideo, 
    uploadVideo 
} from "../controllers/video.controller";


// create router
const router = Router()

// Apply verifyJWT middleware to all routes in this file
router.use(verifJwt) 

// Router
router.route("/upload").post(
    upload.fields([
        {
            name : "videoFile",
            maxCount : 1
        },
        {
            name : "thumbnail",
            maxCount : 1
        }
    ]),
    uploadVideo
)

router.route("/").get(getAllVideos)

router
    .route("/:videoId")
    .get(getVideoById)
    .patch(updateVideo)
    .delete(deleteVideo)

export default router