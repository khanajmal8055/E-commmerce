import mongoose from "mongoose";

import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const productSchema = new mongoose.Schema(
    {
        name :{
            type : String,
            required : true,
        },
        description : {
            type: String,
            required : true
        },
        price : {
            type : Number,
            required : true,
            min : 0 
        },
        stock :{
            type : Number,
            required : true,
            default : 0
        },
        ratings : {
            average : {type : Number , default : 0},
            count : {type : Number , default : 0}
        },
        brand : {
            type : String
        },
        images : [
            {
                url : {type : String, required : true},
                public_id : {type : String, required : true}
            }
        ],
        categories : {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'Category'
        },
        owner : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User"
        }
    },
    {
        timestamps : true
    }

)

productSchema.plugin(mongooseAggregatePaginate)

export const Product = mongoose.model("Product" , productSchema)