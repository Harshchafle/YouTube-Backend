import Router from "express"
import { registerUser } from "../controllers/user.controller.js"

// router creation
const router = Router()

//declaration of all routes
router.route("/register")
.post(registerUser)

export default router