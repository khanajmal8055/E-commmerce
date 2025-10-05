
import mongoose from "mongoose";

const orderItemsSchema = new mongoose.Schema(
    {
        product : {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'Product',
            required : true
        },
        name : {
            type: String,
        },
        quantity : {
            type : Number,
            required : true,
            min : 1
        },
        price : {
            type : Number,
            required : true
        },
        subTotal : {
            type : Number,
            // required : true
        }
    }, {_id : false} 
    

    

) 

const orderSchema = new mongoose.Schema(
    {
        userId : {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'User',
            required : true,
            unique : true
        },
        
        items : [orderItemsSchema],
        
        shippingAddress: {
            name: String,
            phoneNo: String,
            addressLine1: String,
            city: String,
            state: String,
            country: String,
            postalCode: String,
        },
        paymentInfo : {
            method: { type: String, enum: ['COD', 'CARD', 'UPI', 'WALLET'], default: 'COD' },
            status: { type: String, enum: ['PENDING', 'FAILED', 'PAID', 'REFUNDED'], default: 'PENDING' },
            transactionId: String,
        },
        orderStatus : {
            type : String,
            enum : ['PLACED','CONFIRMED','PACKED','SHIPPED','OUT_FOR_DELIVERY','DELIVERED','CANCELED','RETURNED','REFUNDED'],
            default : 'PLACED'
        },
        totalAmount : {
            type : Number,
            // required : true
        },
        discount : {
            type : Number,
            default : 0
        },
        shippingFee : {
            type : Number,
            default : 0
        },
        finalAmount : {
            type : Number,
            // required : true
        },
        statusHistory: [
                {
                status: String,
                changedAt: { type: Date, default: Date.now },
                changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
                note: String,
                }
        ],
        deliveredAt: Date,
        cancelledAt: Date,
        returnRequestedAt: Date,


    },
    {
        timestamps : true
    }
)

orderSchema.methods.calculateTotal = function() {
    let total = 0;
    this.items.forEach(item => {
        item.subTotal = item.quantity * item.price
        total += item.subTotal 
    });

    const shippingFee = total > 1000 ? 50 : 0
    this.discount = total > 1500 ? 50 : 0
    this.shippingFee = shippingFee
    this.totalAmount = total
    this.finalAmount = this.totalAmount - this.discount + this.shippingFee

    return this.finalAmount;

}


export const Order = mongoose.model('Order' , orderSchema)