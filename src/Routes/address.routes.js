import {Router} from "express"
import { verifyJwt } from "../Middlewares/auth.middleware.js"
import {addAddress , updateAddress , deleteAddress , viewAddress} from "../Controllers/address.controller.js"
const router = Router()

router.route("/add-address").post(verifyJwt , addAddress)
router.route("/update-address").post(verifyJwt,updateAddress)
router.route("/delete-address").post(verifyJwt , deleteAddress)
router.route("/view-address").get(verifyJwt , viewAddress)


export default router