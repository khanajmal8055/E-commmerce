import { Router } from "express";
import { verifyJwt } from "../Middlewares/auth.middleware.js";
import { isAdmin } from "../Middlewares/isAdmin.middleware.js";
import { createCategory, getAllCategories, productByCategoryId } from "../Controllers/category.controllers.js";
import { getCategory } from "../Controllers/category.controllers.js";



const router = Router()

console.log("hello");


router.route("/:id/products").get(productByCategoryId)
router.route("/get-category").get(getAllCategories)
router.route("/get-category/:categoryId").get(getCategory);
router.route("/admin/add-category").post(verifyJwt,isAdmin,createCategory)





export default router