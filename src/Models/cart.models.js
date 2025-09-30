import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
    {
        userId : {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'User'
        },
        products : [
            {
                type : mongoose.Schema.Types.ObjectId,
                ref : 'Product'
            }
        ],
        totalPrice : {
            type : Number,
            min : 0
        }
    },
    {
        timestamps : true
    }
)

export const Cart = mongoose.model("Cart" , cartSchema)