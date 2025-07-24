import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import JWT from "jsonwebtoken"
import {User} from "../models/user.models"

export const verifyJWT = asyncHandler(async(req,res,next)=>{
   const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

   if (!token) {
    throw new ApiError(401,"UNAUTHORIZED REQUEST")
   }

   const decodedTOKEN = JWT.verify(token, process.env.ACCESS_TOKEN_SECRET)

   await User.findById(decodedTOKEN?._id)
})