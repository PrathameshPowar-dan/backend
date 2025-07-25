import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.models.js"
import { uploadCloudinary } from "../utils/Cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import JWT from "jsonwebtoken"

const options = {
    httpOnly: true,
    secure: true
}

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
    if (!(username || email)) {
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

    const { AccessToken, RefreshToken } = await GenerateAccessandRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")



    return res.status(200).cookie("accessToken", AccessToken, options).cookie("refreshToken", RefreshToken, options).json(new ApiResponse(200, {
        user: loggedInUser, AccessToken, RefreshToken
    }, "User Logged in Succesfully"
    ))
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshtoken: undefined
            }
        },
        {
            new: true
        }
    )



    return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json(new ApiResponse(200, {}, "Logged Out Successfully"))
})

const RefreshAccessToken = asyncHandler(async (req, res) => {
    const incomeRefreshToken = req.cookies.refreshtoken || req.body.refreshtoken
    if (incomeRefreshToken) {
        throw new ApiError(400, "Unauthorized Request")
    }
    try {
        const DecodedToken = JWT.verify(
            incomeRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(DecodedToken?._id)
        if (!user) {
            throw new ApiError(401, "Invalid Refresh Token")
        }

        if (incomeRefreshToken !== user?.refreshtoken) {
            throw new ApiError(401, "Refresh Token is Expired or Used")
        }



        const { AccessToken, newRefreshToken } = await GenerateAccessandRefreshTokens(user._id)

        return res.status(200).cookie("accessToken", AccessToken, options).cookie("refreshToken", newRefreshToken, options).json(new ApiResponse(200, { AccessToken, RefreshToken: newRefreshToken }, "Access Token Refreshed SUCCESSFULLY!!!"))

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Refresh Token")
    }

})

export { registerUser, loginUser, logoutUser, RefreshAccessToken }