import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.models.js"

const resgisterUser = asyncHandler(async (req,res)=>{
    const {fullname, email, username, password} = req.body
    console.log("Email: ",email);
    console.log("Password: ",password);

    if ([fullname, email, username, password].some((field)=>field?.trim()==="")) {
    throw new ApiError(400,"All fields are MUST!")
    }

    const existedUser = User.findOne({
        $or: [{ username },{ email }]
    })

    if (existedUser) {
        throw new ApiError(409,"User Already Exists")
    }

    req.files?.avatar
})

export {resgisterUser}