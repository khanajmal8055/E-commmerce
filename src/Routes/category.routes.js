import { Router } from "express";
import { verifyJwt } from "../Middlewares/auth.middleware.js";
import { isAdmin } from "../Middlewares/isAdmin.middleware.js";
import { createCategory } from "../Controllers/category.controllers.js";

const router = Router()

router.route("/admin/add-category").post(verifyJwt,isAdmin,createCategory)

export default router