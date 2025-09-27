import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiErrror.js";
import { ApiResponse } from "../utils/apiResponse.js";
// import { User } from "../Models/user.models.js";
import {Address} from '../Models/address.models.js'
import validator from "validator"

const addAddress = asyncHandler(async(req,res)=>{
    const {fullname , phone , postalcode , street , city , state , country , isDefault} = req.body
    console.log(req.body);
    

    if([fullname , phone , postalcode , street, city , state , country].some((field) => field?.trim()=== "")){
        throw new ApiError(400 , "All fields are required")
    }

    if(!validator.isMobilePhone(phone , "any")){
        throw new ApiError(400 ,"Please provide valid Phone number" )
    }

    if(!validator.isPostalCode(postalcode , "any")){
        throw new ApiError(400 , "Please provide valid postal code")
    }

    const newAddress = await Address.create({
        userId : req.user._id,
        fullname,
        postalcode,
        phone,
        street,
        city,
        state,
        country,
        isDefault : !!isDefault
    })

    if(!newAddress){
        throw new ApiError(400 , "Something went wrong while creating Address")
    }

    return res.status(200)
    .json(
        new ApiResponse(200 , newAddress , "Address created Successfully")
    )


})


const updateAddress = asyncHandler(async(req,res) => {
   const {addressId , fullname , phone , postalcode , street , city , state , country , isDefault} = req.body
   
   if([addressId ,fullname , phone , postalcode , street, city , state , country].some((field) => field?.trim()=== "")){
        throw new ApiError(400 , "All fields are required")
    }

    if(!validator.isMobilePhone(phone , "any")){
        throw new ApiError(400 ,"Please provide valid Phone number" )
    }

    if(!validator.isPostalCode(postalcode , "any")){
        throw new ApiError(400 , "Please provide valid postal code")
    }

    const updatedAddress = await Address.findOneAndUpdate(
        {_id: addressId , userId : req.user._id},
        {
            fullname,
            postalcode,
            phone,
            street,
            city,
            state,
            country,
            isDefault : !!isDefault
        },
        {
            new:true
        }
    )

    if(!updateAddress){
        throw new ApiError(400 , "Something went wrong")
    }


    return res.status(200)
    .json(
        new ApiResponse(200 , updatedAddress , "Address updated Successfully")
    )
    
})

const deleteAddress = asyncHandler(async(req,res) => {
    const {addressId} = req.body
    await Address.findOneAndDelete(
        {_id: addressId , userId : req.user._id }
    )

    return res.status(200)
    .json(
        new ApiResponse(200 , {} , "Address Deleted Successfully")
    )
})


const viewAddress = asyncHandler(async(req,res) => {
    const address = await Address.find({userId : req.user._id})
    return res.status(200)
    .json(
        new ApiResponse(200 , address , "Address fetched successfully")
    )
})

export {addAddress , updateAddress , deleteAddress , viewAddress}