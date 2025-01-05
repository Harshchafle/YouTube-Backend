import Router from "express"
import { registerUser } from "../controllers/user.controller.js"
import { upload } from "../middlewares/multer.middleware.js"

// router creation
const router = Router()

//declaration of all routes
router.route("/register").post(
    upload.fields(                  // Middleware injection
        [
            {
                name : "avtar",
                maxCount : 1
            },
            {
                name : "coverImage",
                maxCount : 1
            }
        ]
    ),
    registerUser
)

export default router