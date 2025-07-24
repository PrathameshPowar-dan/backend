import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.models.js"
import { uploadCloudinary } from "../utils/Cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const GenerateAccessandRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const AccessToken = await user.generateAccessToken()
        const RefreshToken = await user.generateRefreshToken()

        user.RefreshToken = RefreshToken
        await user.save({ validateBeforeSave: false })

        return { AccessToken, RefreshToken }

    } catch (error) {
        throw new ApiError(500, "Something went Wrong: while generating Refresh Token")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { fullname, email, username, password } = req.body
    console.log("Email: ", email);
    console.log("Password: ", password);

    if ([fullname, email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are MUST!")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User Already Exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImagePath = req.files?.coverImage[0]?.path;

    let coverImagePath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage[0].length > 0) {
        coverImagePath = req.files.coverImage[0].path
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar File is Required")
    }

    const avatar = await uploadCloudinary(avatarLocalPath)
    const coverImage = await uploadCloudinary(coverImagePath)

    if (!avatar) {
        throw new ApiError(400, "Avatar File is Required")
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshtoken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong creating User")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered Successfully")
    )
})

const loginUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body
    if (!username || !email) {
        throw new ApiError(400, "Username or Password is Require")
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(400, "User does not EXIST")
    }

    const passwordCheck = await user.isPasswordCorrect(password)

    if (!passwordCheck) {
        throw new ApiError(401, "Invalid User CRedentials")
    }

   const {accessToken, refreshToken} = await GenerateAccessandRefreshTokens(user._id)

   const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

   const options = {
    httpOnly: true,
    secure: true
   }

   return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options).json( new ApiResponse(200,{
    user: loggedInUser, accessToken, refreshToken
   }, "User Logged in Succesfully"
))
})

const logoutUser = asyncHandler(async(req,res)=>{
    
})

export { registerUser, loginUser }