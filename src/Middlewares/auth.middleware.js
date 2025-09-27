import jwt from "jsonwebtoken"
import asyncHandler from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiErrror.js"
import { User } from "../Models/user.models.js"

export const verifyJwt = asyncHandler (async (req,res,next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization").replace("Bearer ","")
    
        if (!token) {
            throw new ApiError(401,"Unauthorize Access")
        }
    
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user){
            throw new ApiError(401,"Invalid access token")
        }
    
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401,  "Invalid Access Token")
    }

})

// export {verifyJwt}