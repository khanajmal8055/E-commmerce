import {Product} from '../Models/products.models.js';
import asyncHandler from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiErrror.js';
import { ApiResponse } from '../utils/apiResponse.js';
import {Category} from '../Models/category.models.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';

const createProduct  = asyncHandler(async(req,res) => {
    const {name, description , price , stock , brand , category , ratings , images} = req.body

    if(!name || !description || !price || !stock || !brand || !category || !ratings || !req.files?.images){
        throw new ApiError(400, "Product fields are required")
    }
    // const categoryId = req.body.category
    // const categoryExists = await Category.findById(categoryId)
    let categoryDoc;
    // If category looks like ObjectId
    if (/^[0-9a-fA-F]{24}$/.test(category)) {
        categoryDoc = await Category.findById(category);
    } else {
        categoryDoc = await Category.findOne({ name: category });
    }

    if(!categoryDoc){
        throw new ApiError(400 , "Invalid Category ID")
    }

    if(!req.files.images?.length){
        throw new ApiError(400 , "At least one Image is required for the product")
    }

    const uploadedImages = []
    for(const file of req.files.images){
        const uploaded = await uploadOnCloudinary(file.path)
        if(!uploaded){
            throw new ApiError(400 , "Failed to upload Product Images")
        }

        uploadedImages.push({url : uploaded.secure_url , public_id:uploaded.public_id})
    }

    // if(!productImage){
    //     throw new ApiError(400,"Something went worng while uploading image of product")
    // }

    const createdProduct = await Product.create(
        {
            name,
            description,
            price,
            stock,
            brand,
            category : categoryDoc._id,
            ratings : {
                average : 0,
                count : 0
            },
            images : uploadedImages
        }
    )

    if(!createdProduct){
        throw new ApiError(400 ,"Failed to create product")
    }

    return res.status(201)
    .json(
        new ApiResponse(201 , createdProduct , "Product created Successfully")
    )
})

const getAllProduct = asyncHandler(async(req,res)=> {
    const products = await Product.findById()  
})

export{createProduct}