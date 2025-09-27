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

app.use(express.json({limit : "16kb"}))
app.use(express.urlencoded({extended:true , limit:"16kb"}))
app.use(express.static('public'))
app.use(cookieParser())
// app.use(upload.none())

import userRouter from "./Routes/user.route.js"
// import cookieParser from "cookie-parser";
import addressRouter from "./Routes/address.routes.js"

import productRouter from './Routes/product.routes.js'

app.use("/api/v1/users" , userRouter)
app.use("/api/v1/users/address" , addressRouter)
app.use("/api/v1/products", productRouter)

export {app}