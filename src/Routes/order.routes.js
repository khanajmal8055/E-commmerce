import { Router } from "express";
import { verifyJwt } from "../Middlewares/auth.middleware.js"
import { createOrder, getAllOrderByAdmin, getAllOrders, getOrderById, updateOrderByAdmin, updateOrderByUser } from "../Controllers/orders.controllers.js"
import { isAdmin } from "../Middlewares/isAdmin.middleware.js";



const router = Router()

router.route("/create-order").post(verifyJwt,createOrder)
router.route("/get-all-orders").get(verifyJwt , getAllOrders)
router.route("/get-order/:orderId").get(verifyJwt , getOrderById)
router.route("/admin/get-all-orders").get(verifyJwt , isAdmin , getAllOrderByAdmin)
router.route("/update-order").post(verifyJwt , updateOrderByUser)
router.route("/admin/update-order").post(verifyJwt , isAdmin , updateOrderByAdmin)


export default router