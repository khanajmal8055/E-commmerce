import {Router} from 'express'
import { verifyJwt } from '../Middlewares/auth.middleware.js'
import { addProductToCart, cartCount, clearCart, getCart, removeFromCart, updateCart } from '../Controllers/cart.controllers.js'


const router = Router()

router.route("/add-to-cart").post(verifyJwt,addProductToCart)
router.route("/get-cart").get(verifyJwt,getCart)
router.route('/update-cart').post(verifyJwt,updateCart)
router.route("/remove-item/:productId").put(verifyJwt , removeFromCart)
router.route("/clear-cart").delete(verifyJwt,clearCart)
router.route("/count-cart").get(verifyJwt,cartCount)


export default router