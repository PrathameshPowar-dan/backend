import { Router } from "express";
import { loginUser, logoutUser, RefreshAccessToken, registerUser, UpdateCoverIMG } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import verifyJWT from "../middlewares/Auth.middleware.js"


const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)

router.route("/login").post(loginUser)

router.route("/logout").post(verifyJWT, logoutUser)

router.route("/refreshToken").post(RefreshAccessToken)

router.put("/update-cover", upload.fields([{ name: "coverImage", maxCount: 1 }]), UpdateCoverIMG)


export default router