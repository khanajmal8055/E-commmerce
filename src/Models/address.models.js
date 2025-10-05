import mongoose from "mongoose";


const addressSchema = new mongoose.Schema(
    {
        fullname :{
            type : String,
            required : true,
            index : true,
            // lowercase : true
        },
        postalcode :{
            type : String,
            required : true,
        },
        street : {
            type : String,
            required : true
        },
        city : {
            type : String,
            required : true
        },
        state : {
            type : String,
            required : true
        },
        country : {
            type : String,
            required : true
        },
        isDefault : {
            type : Boolean,
            default : false
        },
        userId : {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'User'
        },
        phoneNo : {
            type : String,
            required : true
        }

    },
    {
        timestamps : true
    }
)

export const Address = mongoose.model('Address' , addressSchema)