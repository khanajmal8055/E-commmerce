import { Router } from "express";
import { createProduct } from "../Controllers/product.controllers.js";
import { upload } from "../Middlewares/multer.middleware.js";
import { verifyJwt } from "../Middlewares/auth.middleware.js";
import { isAdmin } from "../Middlewares/isAdmin.middleware.js";

const  router = Router()

router.route("/admin/add-product").post(
    verifyJwt,
    isAdmin,
    upload.fields([
        {
            name : 'images'
        }
    ]),
    createProduct
)


export default router