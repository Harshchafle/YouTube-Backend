import Router from "express"
import { loginUser, logoutUser, registerUser } from "../controllers/user.controller.js"
import { upload } from "../middlewares/multer.middleware.js"
import { verifJwt } from "../middlewares/auth.middleware.js"

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

router.route("/login").post(loginUser)

router.route("/logout").post(verifJwt, logoutUser)

export default router