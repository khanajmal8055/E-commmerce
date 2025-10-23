import express from "express";
import cors from "cors";
import multer from 'multer'
import cookieParser from "cookie-parser";
const app = express()
const upload = multer()

app.use(cors(
    {
        origin : process.env.CROSS_ORIGIN,
        credentials : true
    }
))

app.use(express.json())
app.use(express.urlencoded({extended:true }))
app.use(express.static('public'))
app.use(cookieParser())
// app.use(upload.none())

import userRouter from "./Routes/user.route.js"
// import cookieParser from "cookie-parser";
import addressRouter from "./Routes/address.routes.js"

import productRouter from './Routes/product.routes.js'

import categoryRouter from './Routes/category.routes.js'

import cartRouter from './Routes/cart.routes.js'

import orderRouter from './Routes/order.routes.js'

import adminRouter from './Routes/admin.routes.js'

app.use("/api/v1/users" , userRouter)
app.use("/api/v1/users/address" , addressRouter)
app.use("/api/v1/products", productRouter)
app.use("/api/v1/category" , categoryRouter)
app.use("/api/v1/cart" , cartRouter)
app.use("/api/v1/order" , orderRouter)
app.use("/api/v1/admin" , adminRouter)
console.log(categoryRouter);


export {app}