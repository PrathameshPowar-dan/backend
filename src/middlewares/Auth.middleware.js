import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import JWT from "jsonwebtoken"
import { User } from "../models/user.models"

export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

        if (!token) {
            throw new ApiError(401, "UNAUTHORIZED REQUEST")
        }

        const decodedTOKEN = JWT.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedTOKEN?._id).select("-password -refreshtoken")

        if (!user) {
            throw new ApiError(401, "Invalid Access Token")
        }

        req.user = user;
        next()

    } catch (error) {
        throw new ApiError(401, "Invalid Access Token")
    }
})