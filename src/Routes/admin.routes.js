import { Router } from "express";

import { verifyJwt } from "../Middlewares/auth.middleware.js";
import { orderKPI, topSellingProduct, userKPI } from "../Controllers/admin_analytics.controllers.js";
import { isAdmin } from "../Middlewares/isAdmin.middleware.js";
const router = Router()

router.route("/user").get(verifyJwt ,isAdmin, userKPI)
router.route("/order").get(verifyJwt , isAdmin , orderKPI)
router.route('/top-product').get(verifyJwt,isAdmin,topSellingProduct)


export default router