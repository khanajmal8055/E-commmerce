import {ApiError} from '../utils/apiErrror.js'
import {ApiResponse} from '../utils/apiResponse.js'
import asyncHandler from '../utils/asyncHandler.js'
import { Order } from '../Models/order.models.js'
import { Cart } from '../Models/cart.models.js'
import {Address} from '../Models/address.models.js'
import { isValidObjectId } from 'mongoose'


const createOrder = asyncHandler(async(req,res)=> {
    const userId = req.user._id;
    const{shippingAddress , paymentMethods} = req.body

    if(!userId){
        throw new ApiError(400 , 'Invalid User Id')
    }

    if(!shippingAddress && !paymentMethods){
        throw new ApiError(400 , "Shipping Address and Payment Method is required")
    }

    let cart = await Cart.findOne({userId})

    if(!cart){
        cart = new Cart({
            items : []
        })
    }

    const address = await Address.findById(shippingAddress)

    if(!address){
        throw new ApiError(400 , "Address not Found")
    }

    const shippingInfo = {
        name : address.fullname,
        phoneNo : address.phoneNo,
        addressLine1 : address.street,
        city : address.city,
        state : address.state,
        country :   address.country,
        postalCode : address.postalcode
    }

    const orderItems = cart.items.map(item => ({
        product : item.productId,
        name : item.name,
        quantity : item.quantity,
        price : item.price
    }))

    const order = await Order.create({
        userId,
        items : orderItems,
        shippingAddress : shippingInfo,
        paymentMethods,
        paymentStatus : paymentMethods === 'COD' ? 'PENDING' : 'PAID',
        orderStatus : 'PLACED'
    })

    if(!order){
        throw new ApiError(400 , "Order not processed!! something went wrong")
    }

    order.calculateTotal()

    await order.save()

    cart.items=[]
    cart.totalPrice = 0
    cart.totalItems = 0

    await cart.save()

    return res.status(201)
    .json(
        new ApiResponse(201 , order , "Order created Successfully")
    )

})

const getAllOrders = asyncHandler(async(req,res)=> {
    const userId = req.user._id

    const orders = await Order.find({userId}).populate('items.product' , 'shippingAddress paymentMethods orderStatus shippingFee finalAmount')

    if(!orders || orders.length === 0){
        throw new ApiError(400 , "Order not Found")
    }

    return res.status(200)
    .json(
        new ApiResponse(200 , orders , "Orders List Fetched Successfully")
    )
    
    
})

const getOrderById = asyncHandler(async(req,res)=> {
    const userId = req.user._id;

    if(!userId){
        throw new ApiError(400 , "Invalid user Id , so you dont have permission to fetch order list")
    }

    const {orderId} = req.params

    if(!orderId){
        throw new ApiError(400 , "Invalid Order Id")
    }

    const order = await Order.findById(orderId)

    if(!order){
        throw new ApiError(400 , "Order not found")
    }

    return res.status(200)
    .json(
        new ApiResponse(200 , order , "Order fetched successfully")
    )
})

const getAllOrderByAdmin = asyncHandler(async(req,res)=> { 
    // const userId = req.user._id
    // if(!userId){
    //     throw new ApiError(400 ,"Invalid User Id")
    // }

    // const orders = await Order.find({userId})

    const orders = await Order.find()
    .populate("userId" , "name email ")
    .populate("items.product" , "name , price")
    .populate("shippingAddress")
    
    if(!orders || orders.length === 0){
        throw new ApiError(400 , "Orders List Not found")
    }

    return res.status(200)
    .json(
        new ApiResponse(200 , orders , "Orders List Fetched Successfully")
    )
})

const updateOrderByUser = asyncHandler(async(req,res)=> {
    const userId = req.user._id;

    const{orderId , action} = req.body

    if(!isValidObjectId(userId)){
        throw new ApiError(400 , "Invalid User Id")
    }

    const order = await Order.findById(orderId)

    if(!order){
        throw new ApiError(400 , "Order not found")
    }

    if(!order.userId.toString() === userId.toString()){
        throw new ApiError(400 , "Unauthorized access")
    }

    if(action === 'cancel'){
        (["Shipped", "OUT_FOR_DELIVERY", 'DELIVERED']).includes(order.orderStatus)
        throw new ApiError(400 ,"Cancel cannot be processed")
    }

    order.orderStatus = 'CANCELED'
    order.cancelledAt =  Date.now()

    if(action === 'return'){
        if(order.orderStatus !== 'DELIVERED'){
            throw new ApiError(400 , "Return Request can only be processed after item is delivered")
        }

        order.orderStatus = 'RETURNED'
        order.returnRequestAt =  Date.now()
    }

    order.statusHistory.push({
        status : order.orderStatus,
        changedBy : userId,
        note : `User ${action}ed Product`
    })

    await order.save()
    return res.status(200)
    .json(
        new ApiResponse(200 , order , "Order Updated Successully")
    )
})

const updateOrderByAdmin = asyncHandler(async(req,res)=> {
    const userId = req.user._id
    if(!isValidObjectId(userId)){
        throw new ApiError(400 , "Invalid User Id")
    }

    const {orderId , newStatus , note } = req.body

    const order = await Order.findById(orderId)

    if(!order){
        throw new ApiError(400 , "Order not found")
    }

    console.log(order.orderStatus);
    

    const validTranstion = {
        PLACED: ["PROCESSING", "CANCELED"],
        PROCESSING: ["SHIPPED", "CANCELED"],
        SHIPPED: ["DELIVERED", "RETURNED"],
        DELIVERED: [],
        CANCELED: [],
        RETURNED: [],
    }

    const allowedNext = validTranstion[order.orderStatus] || []

    console.log(allowedNext);
    

    if(!allowedNext.includes(newStatus)){
        throw new ApiError(400 , `Invalid status transition from ${order.orderStatus} -> ${newStatus}`)
    }

    order.orderStatus = newStatus

    if(newStatus === 'Delivered') order.deliveredAt = Date.now();
    if(newStatus === 'Cancelled') order.cancelledAt = Date.now();

    order.statusHistory.push({
        status : newStatus,
        changedBy : userId,
        note : note 
    })

    await order.save()

    return res.status(200)
    .json(
        new ApiResponse(200 , order , "Order Updated Successfully by Admin")
    )

})



export {createOrder , getAllOrders , getOrderById , getAllOrderByAdmin , updateOrderByUser , updateOrderByAdmin}