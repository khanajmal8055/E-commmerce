import { Router } from "express";
import { registerUser , loginUser , logoutUser , refreshAccessToken , updatePassword , viewProfile,updateProfile} from "../Controllers/userRegister.controller.js";
import { verifyJwt } from "../Middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(registerUser)
router.route("/login").post(loginUser )
router.route("/refresh-token").post(refreshAccessToken)


// secured Routes
router.route("/logout").post(verifyJwt, logoutUser)
router.route("/update-password").post(verifyJwt , updatePassword)
router.route("/view-profile").get(verifyJwt , viewProfile)
router.route("/update-profile").post(verifyJwt,updateProfile)



export default router