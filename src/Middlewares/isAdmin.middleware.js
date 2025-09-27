import { ApiError } from "../utils/apiErrror.js";
import { User } from "../Models/user.models.js";

export const isAdmin = async(req,res , next)=>{
    try {
        const user = await User.findById(req.user._id)
        
        if(!user ){
            return next(new ApiError(403 , "Admin access only"))
        }
        next()
    } 
    catch (error) {
        next(new ApiError(500, "Internal server error"))
    }
}

