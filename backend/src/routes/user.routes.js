import Router from "express"
import { 
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
    getWatchHistory
} from "../controllers/user.controller.js"
import { upload } from "../middlewares/multer.middleware.js"
import { verifJwt } from "../middlewares/auth.middleware.js"

// router creation
const router = Router()

// declaration of all routes
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
// secured, because verifyJwt
router.route("/logout").post(verifJwt, logoutUser)

router.route("/refresh-token").post(refershAccessToken)

router.route("/change-password").post(verifJwt, changePassword)

router.route("current-user").get(verifJwt, getUser)

router.route("/update-account").patch(verifJwt, updateUserDetails)

router.route("/avatar").patch(verifJwt, upload.single("avatar"), updateUserAvtar)

router.route("/cover-image").patch(verifJwt, upload.single("/coverImage"), updateUserCoverImage)

router.route("/c/:username").get(verifJwt, userChannelProfile)

router.route("/history").get(verifJwt, getWatchHistory)

export default router