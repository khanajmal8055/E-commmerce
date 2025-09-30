import { ApiError } from "../utils/apiErrror.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Category } from "../Models/category.models.js";
import { User } from "../Models/user.models.js";

const createCategory = asyncHandler(async(req,res)=>{
    const {name , description} = req.body

    if(!name && !description){
        throw new ApiError(400 , "Category Name and Descriptions are Required")
    }

    const owner = await User.findById(req.user._id)
    
    if(!owner){
        throw new ApiError(400 , "Not a valid owner to add category")
    }

    const categoryAdded = await Category.create({
        name,
        description
    })

    if(!categoryAdded){
        throw new ApiError(400, "Failed to Add category")
    }

    return res.status(201)
    .json(
        new ApiResponse(201,categoryAdded,"Successfully added category")
    )
})

export {createCategory}