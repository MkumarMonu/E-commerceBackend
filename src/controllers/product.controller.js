import mongoose from "mongoose";
import Product from "../models/product.model.js";

const addProduct = async (req, res) => {
  try {
    const { productName, shortDescription, longDescription } = req.body;
    const { categoryId } = req.query;
    console.log("categoryId: " + categoryId);
    if (!categoryId) {
      return res
        .status(400)
        .json({ success: false, message: "CategoryId is required" });
    }

    const productImage = req.file?.path;

    // Validate required fields
    if (
      ![productName, shortDescription, longDescription].every(
        (field) => field?.trim() !== ""
      )
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }
    const existProduct = await Product.findOne({ productName });
    if (existProduct) {
      return res
        .status(400)
        .json({ success: false, message: "Product already exists" });
    }

    // Validate if category ID is valid
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid category ID" });
    }

    // Create product
    const product = await Product.create({
      productName,
      productImage,
      shortDescription,
      longDescription,
      categoryId: categoryId,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const { productId } = req.query;

    console.log("productId", productId);
    if (!productId) {
      return res
        .status(400)
        .json({ success: false, message: "productId is required" });
    }
    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    return res.json({
      success: true,
      message: "Product fetched successsfully",
      data: product,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Internal Server Error", error });
  }
};

const getProductsByCategory = async (req, res) => {
  try {
    const {categoryId} = req.query;
    console.log("categoryId", categoryId);
    if (!categoryId) {
      return res
       .status(400)
       .json({ success: false, message: "categoryId is required" });
    }
    const products = await Product.find({ categoryId });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error", error });
  }
}

export { addProduct, getProductById };
