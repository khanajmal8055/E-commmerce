import {Product} from '../Models/products.models.js';
import asyncHandler from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiErrror.js';
import { ApiResponse } from '../utils/apiResponse.js';
import {Category} from '../Models/category.models.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import mongoose, { isValidObjectId } from 'mongoose';

const createProduct  = asyncHandler(async(req,res) => {
    const {name, description , price , stock , brand , categories , ratings , images , owner} = req.body

    if(!name || !description || !price || !stock || !brand || !categories || !ratings || !req.files?.images){
        throw new ApiError(400, "Product fields are required")
    }
    // const categoryId = req.body.category
    // const categoryExists = await Category.findById(categoryId)
    let categoryDoc;
    // If category looks like ObjectId
    if (/^[0-9a-fA-F]{24}$/.test(categories)) {
        categoryDoc = await Category.findById(categories);
    } else {
        categoryDoc = await Category.findOne({ name: categories });
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
            categories : categoryDoc._id,
            ratings : {
                average : 0,
                count : 0
            },
            images : uploadedImages,
            owner : req.user
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
    const {page=1 , limit=10 , keyword , categories , price , ratings , sortBy , sortType}  = req.query
    
    const match = {}

    if(keyword){
        match.$or = [
            {name : {$regex : keyword , $options : 'i'}},
            {description : {$regex : keyword , $options : 'i'}}
        ]
    }

    if(categories){
        match.categories = new mongoose.Types.ObjectId(categories)
    }

    if(price){
        match.price = {}
        if(price.gte) match.price.$gte = Number(price.gte);
        if(price.lte) match.price.$lte = Number(price.lte)
    }

    if(ratings){
        match.ratings = {$gte : Number(ratings)}
    }

    const pipeline = []
    

    pipeline.push({$match : match})


    pipeline.push({
        $lookup: {
            from: "categories",
            localField: "categories",
            foreignField: "_id",
            as: "categoryDetails"
        }
    });

    pipeline.push({
        $unwind: {
            path: "$categoryDetails",
            preserveNullAndEmptyArrays: true
        }
    });

    pipeline.push({
        $project: {
            name: 1,
            description: 1,
            price: 1,
            stock: 1,
            ratings: 1,
            brand: 1,
            images: 1,
            categories: {
                _id: "$categoryDetails._id",
                name: "$categoryDetails.name"
            },
            createdAt: 1
        }
    });

     if(sortBy && sortType){
        pipeline.push({
            $sort : {
                [sortBy] : sortType === "asc" ? 1 : -1
            }
        });

    }
    else{
        pipeline.push(
            {
                $sort : {
                    createdAt : -1
                }
            }
        )
    }

    const productAggregate = await Product.aggregate(pipeline)
    

    const options = {
        page : parseInt(page,10),
        limit : parseInt(limit,10)
    }

    const allProducts = await Product.aggregatePaginate(productAggregate , options)

    return res.status(200)
    .json(
        new ApiResponse(200 ,  allProducts , "All Products Fetched Successfully")
    )

    
})

const deleteProduct = asyncHandler(async(req,res)=>{
    const {productId} = req.params
    const product = await Product.findById(productId)
    console.log(product)

    if(!product){
        throw new ApiError(400 , "Product not found")
    }

    if(!isValidObjectId(productId)){
        throw new ApiError(400 , "Invalid Product ID")
    }

    if(product?.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(400 , "You dont have permission to delete product")
    }

    const productdeleted = await Product.findByIdAndDelete(productId)

    if(!productdeleted){
        throw new ApiError(400 , "Failed to delete Product")
    }

    return res.status(200)
    .json(
        new ApiResponse(200 , {}, "Product Deleted Successfully")
    )
})

const updateProduct = asyncHandler(async(req,res)=> {
    console.log(req.body)
    const {name , description , price , stock , ratings , brand , images , categories} = req.body

    if(!name || !description || !price || !stock || !brand || !categories || !ratings || !req.files?.images){
        throw new ApiError(400, "Product fields are required")
    }

    const {productId} = req.params
    if(!isValidObjectId(productId)){
        throw new ApiError(400 , "Invalid Product Id")
    }

    const product = await Product.findById(productId)

    if(!product){
        throw new ApiError(400 , "Product not found")
    }

    const uploadedImages = []
    for(const file of req.files.images){
        const uploaded = await uploadOnCloudinary(file.path)
        if(!uploaded){
            throw new ApiError(400 , "Failed to upload Product Images")
        }

        uploadedImages.push({url : uploaded.secure_url , public_id:uploaded.public_id})
    }

    const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        {
            $set : {
                name,
                description,
                price,
                stock,
                ratings,
                brand,
                images : uploadedImages,
                categories

            }
        }
    )

    if(!updatedProduct){
        throw new ApiError(400 , "Failed to update Product")
    }

    return res.status(201)
    .json(
        new ApiResponse(201 , updatedProduct , "Product updated successfully" )
    )
})


const getSingleProduct = asyncHandler(async(req,res)=>{ 
    const {productId} = req.params

    if(!isValidObjectId(productId)){
        throw new ApiError(400 , "Invalid Product Id")
    }

    const product = await Product.findById(productId)

    if(!product){
        throw new ApiError(400 , "product didnt found")
    }

    return res.status(200)
    .json(
        new ApiResponse(200, product , "Product fetched successfully")
    )


})


export{createProduct , deleteProduct, updateProduct , getAllProduct, getSingleProduct}