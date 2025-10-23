import { ApiError } from "../utils/apiErrror.js";
import { ApiResponse } from "../utils/apiResponse.js";
import {User} from "../Models/user.models.js"
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave : false})
        return {accessToken , refreshToken}
    } 
    catch (error) {
        throw new ApiError(400 , "Something went wrong while generating access and refresh token")    
    }
}


// Register a user

const registerUser = asyncHandler(async (req,res) => {
    console.log(req.body);
    
    const {username , fullname , email , password} = req.body

    if([fullname , username , email , password].some((field) => field?.trim() === "")){
        throw new ApiError(400 , "All Fields are Required")
    }

    const existedUser = await User.findOne({
          $or : [{email} , {username}]
    })

    if(existedUser){
        throw new ApiError(400 , "User already Exist")
    }

    const user = await User.create({
        fullname,
        username,
        password,
        email

    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if(!createdUser){
        throw new ApiError(400 , "Something went wrong while regresting a user")
    }

    return res.status(201).json(
        new ApiResponse(200 , createdUser , "User Registerd Successfully")
    )
}) 

// Login a user

const loginUser = asyncHandler (async (req,res) => {
    const {email , password , username} = req.body

    if(!email && !password){
        throw new ApiError(400 , "Email and Password both are required")
    }

    const user = await User.findOne({
        $or : [{email} , {username}]
    })

    if(!user){
        throw new ApiError(400 , "User not found")
    }

    const isValidPassword = await  user.isPasswordCorrect(password)

    if(!isValidPassword){
        throw new ApiError(400 , "Password is incorrect")
    }

    const { accessToken , refreshToken  } = await generateAccessAndRefreshToken(user._id)


    const loginUser = await User.findById(user._id).select("-password -refreshToken")

    if(!loginUser){
        new ApiError(400 , "Something went wrong while user login")

    }

    const option = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(201)
    .cookie("accessToken" , accessToken , option)
    .cookie("refreshToken" , refreshToken , option)
    .json(
        new ApiResponse(200 , {user : loginUser , refreshToken ,accessToken } , "user LoggedIn successfully")
    )
    
})


const logoutUser = asyncHandler(async(req,res) => {
    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $unset : {refreshToken : 1}
        },
        {
            new : true
        }
    )

    const option = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .clearCookie("accessToken" , option)
    .clearCookie("refreshToken" , option)
    .json(
        new ApiResponse(200 , {} , "User logged out successfully")
    )
})

const refreshAccessToken = asyncHandler(async(req,res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(400 , "Non verified user")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken , process.env.REFRESH_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id)
        
        if(!user){
            throw new ApiError(400 , "Inavlid USER")

        }

        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(400 ,"Refresh Token is Expired")
        }

        const {accessToken , newRefreshToken} = await generateAccessAndRefreshToken(user._id)

        const option = {
            httpOnly : true,
            secure :true        
        }

        return res.status(201)
        .cookie("accessToken" , accessToken,option)
        .cookie("refreshToken",newRefreshToken,option)
        .json(
            new ApiResponse(200 ,{accessToken , refreshToken : newRefreshToken} , "Access Token Refreshed" )
        )

        

    } catch (error) {
        console.error("Refresh token error:", error.message);
        throw new ApiError(401, "Invalid refresh token");
    }
})

const updatePassword = asyncHandler(async(req,res) => {
    const {oldPassword , newPassword} = req.body

    if(!oldPassword || !newPassword){
        throw new ApiError(400 , "Old password and new Password is required")
    }

    const user = await User.findById(req.user?._id)

    if(!user){
        throw new ApiError(400 , "User not found")
    }

    const verifiedPassword = await user.isPasswordCorrect(oldPassword)

    if(!verifiedPassword){
        throw new ApiError(400 , "Password does not match")
    }

    user.password = newPassword
    await user.save({validateBeforeSave : false})

    return res.status(200)
    .json(
        new ApiResponse(200 , {} , "Password updated Successfully")
    )


})

const viewProfile = asyncHandler(async(req,res) => {
    const user = await User.findById(req.user._id).select("-password -refreshToken")

    return res.status(201)
    .json(
        new ApiResponse(200 , user , "User profile fetched Successfully")
    )

})

const updateProfile = asyncHandler(async(req,res)=>{
    const {username , email , fullname} = req.body

    if([username , email , fullname].some((field) => field.trim() ==="")){
        throw new ApiError(400 , "All fields are required")
    }

    const updatedUser  = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set : {
                fullname,
                email,
                username
            }
        },
        {
            new : true
        }


    )

    

    if(!updatedUser) {
        throw new ApiError(400 ,"Something went wrong while updating profile details")
    }

    const { password, refreshToken, ...safeUser } = updatedUser.toObject();

    return res.status(200)
    .json(
        new ApiResponse(200 , safeUser , "Profile updated Successfully")
    )
})

export {registerUser , loginUser , logoutUser , refreshAccessToken , updatePassword , viewProfile , updateProfile}