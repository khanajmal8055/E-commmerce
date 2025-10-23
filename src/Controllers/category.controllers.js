import { ApiError } from "../utils/apiErrror.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Category } from "../Models/category.models.js";
import { User } from "../Models/user.models.js";
import { isValidObjectId } from "mongoose";

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

const getCategory = asyncHandler(async(req,res)=> {
    const { categoryId } = req.params;

    if(!isValidObjectId(categoryId)){
        throw new ApiError(400 , "Invalid Category Id")
    }

    const categories = await Category.findById(categoryId)

    if(!categories){
        throw new ApiError(400 , "Categories not Found")
    }

    return res.status(200)
    .json(
        new ApiResponse(200 , categories , "Categories Fetched Successfully")
    )

    // const categories = {
    //     name : "Ajmal",
    //     age : "18"
    // }

    // console.log(categories);
    

    // return res.status(200)
    // .json(
    //     new ApiResponse(200 , categories , "Categories fetched successfuly")
    // )

    console.log("Helllo world");
    
})

export {createCategory,getCategory}