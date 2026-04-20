import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.models.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import {uploadOnCloudinary} from '../utils/cloudinary.js'

const generateAccessAndRefereshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res


    const { email, password } = req.body
    //console.log("email: ", email);

    if (
        [email, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({ email })

    if (existedUser) {
        throw new ApiError(409, "User with email already exists")
    }

    const user = await User.create({
        email,
        password,
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

})


const loginUser = asyncHandler(async (req, res) => {
    // req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie

    const { email, password } = req.body

    if (!email) {
        throw new ApiError(400, "Email is required")
    }

    const user = await User.findOne({ email })

    if (!user) {
        throw new ApiError(404, "User does not exist , Signup")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Password is wrong")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: false, // should be true , false bec of testing purposes
        sameSite: "lax",
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User logged In Successfully"
            )
        )

})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: false, // should be true , false bec of testing purposes
        sameSite:"lax" 
    }
    
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged Out"))
})

const updateUserDetails = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body

    if (!username && !email && !password) {
        throw new ApiError(400, "At least one field is required")
    }

    const updateFields = {}

    if (username) {
        const existingUsername = await User.findOne({
            username,
            _id: { $ne: req.user?._id }
        })

        if (existingUsername) {
            throw new ApiError(409, "Username already exists")
        }

        updateFields.username = username
    }

    if (email) {
        const existingEmail = await User.findOne({
            email,
            _id: { $ne: req.user?._id }
        })

        if (existingEmail) {
            throw new ApiError(409, "Email already exists")
        }

        updateFields.email = email
    }

    let user = await User.findById(req.user._id)

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    if (password) {
        user.password = password
        await user.save({ validateBeforeSave: false })
    }

    if (Object.keys(updateFields).length > 0) {
        user = await User.findByIdAndUpdate(
            req.user._id,
            {
                $set: updateFields
            },
            {
                new: true
            }
        ).select("-password -refreshToken")
    } else {
        user = await User.findById(req.user._id).select("-password -refreshToken")
    }

    return res.status(200).json(
        new ApiResponse(200, user, "User details updated successfully")
    )
})

const updateUserDescription = asyncHandler(async (req, res) => {
    const { description } = req.body

    if (!description?.trim()) {
        throw new ApiError(400, "Description is required")
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                description
            }
        },
        {
            new: true
        }
    ).select("-password -refreshToken")

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    return res.status(200).json(
        new ApiResponse(200, user, "Description updated successfully")
    )
})

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar?.url) {
        
        throw new ApiError(500, "Error while uploading avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {
            new: true
        }
    ).select("-password -refreshToken")

    return res.status(200).json(
        new ApiResponse(200, user, "Avatar updated successfully")
    )
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(
        new ApiResponse(
            200,
            req.user,
            "Current user fetched successfully"
        )
    )
})

export {
    registerUser,
    loginUser,
    logoutUser,
    updateUserDetails,
    updateUserDescription,
    updateUserAvatar,
    getCurrentUser
    
}