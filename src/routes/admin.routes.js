import express from "express";
import {
  AddCategory,
  deleteCategory,
  getAllCategories,
  getcategory,
  updateCategory,
} from "../controllers/category.controller.js";
import { getMulterUpload } from "../utills/cloudinary.js";
import {
  addProduct,
  getAllProducts,
  getProductById,
  getProductsByCategory,
} from "../controllers/product.controller.js";
const adminRouter = express.Router();
const categoryUpload = getMulterUpload("Category-Data");
const productUpload = getMulterUpload("Product-Data");

// Routes for category
adminRouter
  .route("/category")
  .post(categoryUpload.single("categoryImage"), AddCategory)
  .get(getcategory)
  .put(categoryUpload.single("categoryImage"), updateCategory)
  .delete(deleteCategory);
adminRouter.route("/getAllCategories").get(getAllCategories);

// Routes for Product

adminRouter
  .route("/product")
  .post(productUpload.single("productImage"), addProduct)
  .get(getProductById)

  adminRouter.route("/getAllProducts").get(getAllProducts)
 

adminRouter.route("/getProductByCategry").get(getProductsByCategory);
export { adminRouter };
