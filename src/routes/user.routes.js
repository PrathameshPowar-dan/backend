import { Router } from "express";
import { GetCurrentUser, GetUserChannelProfile, GetWatchHistory, loginUser, logoutUser, RefreshAccessToken, registerUser, UpdateAvatar, UpdateCoverIMG, UpdateCurrentPassword } from "../controllers/user.controller.js";
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

router.route("/update-password").post(verifyJWT, UpdateCurrentPassword)

router.route("/current-user").get(verifyJWT, GetCurrentUser)

router.route("/update-account").patch(verifyJWT, UpdateCurrentPassword)

router.route("/avatar").patch(verifyJWT, upload.single("avatar"), UpdateAvatar)

router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), UpdateCoverIMG)

router.route("/c/:username").get(verifyJWT, GetUserChannelProfile)

router.route("/history").get(verifyJWT, GetWatchHistory)


export default router