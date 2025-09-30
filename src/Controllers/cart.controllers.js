import asyncHandler from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiErrror.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { Cart } from "../Models/cart.models.js"
import { Product } from "../Models/products.models.js"


const addProductToCart = asyncHandler(async(req,res)=> {
    const userId = req.user._id

    const {productId , quantity = 1} = req.body

    if(!productId){
        throw new ApiError(400 , "Product Id is not valid ")
    }

    if(quantity < 1){
        throw new ApiError(400 , "At Least 1 quantity is required")
    }

    const product = await Product.findById(productId)

    if(!product){
        throw new ApiError(400 , "Product not found")
    }

    if(product.stock < quantity){
        throw new ApiError(400 , `Only ${product.stock} is Availabel`)
    }

    let cart = await Cart.findOne({userId})

    if(!cart){
        cart = new Cart({
            userId,
            items : []
        })
    }

    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId)

    if(itemIndex > -1){
        const newQuantity = cart.items[itemIndex].quantity + quantity

        if(newQuantity > product.stock){
            throw new ApiError(400 , "Cannot add more quantity to cart")
        }

        cart.items[itemIndex].quantity = newQuantity;
        cart.items[itemIndex].price = product.price
    }
    else{
        cart.items.push({
            productId : product._id,
            name : product.name,
            price : product.price,
            quantity
        })
    }

    cart.calculateTotals()
    await cart.save()

    return res.status(201)
    .json(
        new ApiResponse(201 , cart , "Items added to cart")
    )
})

const getCart = asyncHandler(async(req,res)=>{
    const userId = req.user._id

    const cart = await Cart.findOne({userId}).populate('items.productId' , 'name price stock images' )

    if(!cart){
        cart = new Cart({
            userId,
            items:[],
            totalPrice : 0,
            totalItems : 0
        })
    }

    await cart.save()

    return res.status(200)
    .json(
        new ApiResponse(200 , cart , "Cart Fetched Successfully ")
    )


})

const updateCart = asyncHandler(async(req,res)=> {
    const userId = req.user._id

    const {productId , quantity} = req.body

    if(!productId || !quantity){
        throw new ApiError(400 , "Product ID and qunatity are required")
    }

    if(quantity < 1){
        throw new ApiError(400 , "Minimum one product is required")
    }

    const cart = await Cart.findOne({userId})

    if(!cart){
        throw new ApiError(400 , "Cart not found")
    }

    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId)

    if(itemIndex === -1){
        throw new ApiError(400 , "No items are Found in cart")
    }

    const product = await Product.findById(productId)

    if(!product){
        throw new ApiError(400 , "Product not found")
    }

    if(quantity > product.stock){
        throw new ApiError(400 , `Only ${product.stock} is left`)
    }

    cart.items[itemIndex].quantity = quantity
    cart.items[itemIndex].price = product.price

    cart.calculateTotals()
    await cart.save()

    return res.status(201)
    .json(
        new ApiResponse(201, cart , "Cart Updated Successfully")
    )


})

const removeFromCart = asyncHandler(async(req,res)=>{
    const userId = req.user._id

    const {productId} = req.params

    const cart = await Cart.findOne({userId})

    if(!cart){
        throw new ApiError(400 , "Cart not found")
    }

    const itemExist = cart.items.some(item => item.productId.toString() === productId)

    if(!itemExist){
        throw new ApiError(400 , "Item not found")
    }

    cart.items = cart.items.filter(item => item.productId.toString() !== productId)
    cart.calculateTotals()
    await cart.save()

    return res.status(200)
    .json(
        new ApiResponse(200 , cart , "Item removed from cart successfully")
    )
})

const clearCart = asyncHandler(async(req,res)=>{
    const userId = req.user._id

    const cart = await Cart.findOne({userId})

    if(!cart){
        throw new ApiError(400,"Cart didn't  found")
    }

    cart.items = []
    cart.totalItems = 0
    cart.totalPrice = 0
    
    await cart.save()

    return res.status(200)
    .json(
        new ApiResponse(200 ,cart ,"Cart cleared successfully")
    )
})

const cartCount = asyncHandler(async(req,res)=>{
    const userId = req.user._id

    // console.log(userId);
    

    const cart = await Cart.findOne({userId})

    // console.log(cart.totalItems);
    

    const count = cart ? cart.totalItems : 0;

    return res.status(200)
    .json(
        new ApiResponse(200 , count , "Cart Total items fetched successfully")
    )

})

export{addProductToCart , getCart , updateCart , removeFromCart,clearCart , cartCount}