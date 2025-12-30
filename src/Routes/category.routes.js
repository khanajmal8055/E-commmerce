import { Router } from "express";
import { verifyJwt } from "../Middlewares/auth.middleware.js";
import { isAdmin } from "../Middlewares/isAdmin.middleware.js";
import { createCategory, getAllCategories, productByCategoryId } from "../Controllers/category.controllers.js";
import { getCategory } from "../Controllers/category.controllers.js";
import { upload } from "../Middlewares/multer.middleware.js";



const router = Router()




router.route("/:id/products").get(productByCategoryId)
router.route("/get-category").get(getAllCategories)
router.route("/get-category/:categoryId").get(getCategory);
router.route("/admin/add-category").post(verifyJwt,isAdmin,
    upload.fields([
        {
            name : "categoryImage",
            maxCount : 1
        }
    ]),
    createCategory)

export default router