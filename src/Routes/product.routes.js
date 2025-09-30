import { Router } from "express";
import { createProduct , deleteProduct , updateProduct , getAllProduct, getSingleProduct} from "../Controllers/product.controllers.js";
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

router.route("/admin/delete-product/:productId").delete(verifyJwt,isAdmin , deleteProduct)
router.route("/admin/update-product/:productId").post(verifyJwt,isAdmin,upload.fields([
        {
            name : 'images'
        }
    ]),updateProduct)

router.route("/all-products").get(getAllProduct)
router.route("/single-product/:productId").get(getSingleProduct)

export default router