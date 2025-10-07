import mongoose from "mongoose";

const cartItemsSchema = new mongoose.Schema(
    {
        productId: {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'Product',
            required : true
        },
        name : {
            type : String,
            required : true
        },
        price : {
            type : Number,
            required : true
        },
        quantity : {
            type : Number,
            required : true,
            min : 1,
            default : 1
        }

    }

    
)

const cartSchema = new  mongoose.Schema(
    {
        userId : {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'User',
            required : true,
            // unique : true,

        },
        items : [cartItemsSchema],
        totalPrice : {
            type : Number,
            required : true,
            default : 0
        },
        totalItems : {
            type : Number,
            required : true,
            default : 0
        }


    },
    {
        timeStamps : true
    }
)

cartSchema.methods.calculateTotals = function(){
    this.totalItems = this.items.reduce((total , item) => total + item.quantity , 0)
    this.totalPrice = this.items.reduce((total , item) => total + (item.price * item.quantity), 0)
}

export const Cart = mongoose.model('Cart' , cartSchema)