import mongoose from "mongoose";
import Category from "../models/category.model.js";
import { uploader } from "cloudinary";

const AddCategory = async (req, res) => {
  try {
    const { categoryName, shortDescription, longDescription } = req.body;
    if (
      [categoryName, shortDescription, longDescription].some(
        (fields) => fields?.trim() === ""
      )
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }
    const existCategory = await Category.findOne({ categoryName });
    if (existCategory) {
      return res
        .status(400)
        .json({ success: false, message: "Category name already exists" });
    }

    const categoryData = await Category.create({
      categoryName,
      categoryImage: req.file?.path,
      shortDescription,
      longDescription,
    });
    if (!categoryData) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to create category" });
    }
    return res.status(200).json({
      success: true,
      message: "Category created successfully.",
      data: categoryData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getcategory = async (req, res) => {
  try {
    const { categoryId } = req.query;
    if (!categoryId) {
      return res
        .status(400)
        .json({ success: false, message: "categoryId is required" });
    }
    const category = await Category.findById(categoryId);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }
    return res.status(200).json({
      success: true,
      message: "Category data fetched successfully",
      data: category,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    if (!categories) {
      return res
        .status(404)
        .json({ success: false, message: "No categories found" });
    }
    return res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      data: categories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.query;
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid categoryId format" });
    }

    // Extract fields to update
    const { categoryName, shortDescription, longDescription } = req.body;
    const categoryImage = req.file?.path; // If image is uploaded

    // Check if category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }
    if (categoryImage) {
      const public_id = category.categoryImage
        ?.split("/")
        .slice(-3) // Extract last 3 parts (folder & filename)
        .join("/")
        .split(".")[0]; // Remove file extension // Extract public_id from URL

      // Delete old image from Cloudinary
      const result = await uploader.destroy(public_id);
      console.log(result, "result");
      if (!result.result) {
        console.error("Failed to delete old image from Cloudinary:", result);
      }
    }
    // Prepare update object
    const updateData = {};
    if (categoryName) updateData.categoryName = categoryName;
    if (shortDescription) updateData.shortDescription = shortDescription;
    if (longDescription) updateData.longDescription = longDescription;
    if (categoryImage) updateData.categoryImage = categoryImage;

    // Check if there is any data to update
    if (Object.keys(updateData).length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No data provided for update" });
    }

    // Update category
    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      updateData,
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: updatedCategory,
    });
  } catch (error) {
    console.error("Error updating category:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.query;
    if (!categoryId) {
      return res
        .status(400)
        .json({ success: false, message: "categoryId is required" });
    }
    const categoryimage = await Category.findById(categoryId);
    if (!categoryimage) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }
    const imagePublicId = categoryimage.categoryImage
      ?.split("/")
      .slice(-3) // Extract last 3 parts (folder & filename)
      .join("/")
      .split(".")[0]; // Remove file extension // Extract public_id from URL

    if (imagePublicId) {
      try {
        const cloudinaryResponse = await uploader.destroy(imagePublicId);
        console.log("Cloudinary image deleted:", cloudinaryResponse);

        if (cloudinaryResponse.result !== "ok") {
          console.error(
            "Error deleting image from Cloudinary:",
            cloudinaryResponse
          );
        }
      } catch (cloudinaryError) {
        console.error("Cloudinary deletion error:", cloudinaryError);
      }
    }

    const category = await Category.findByIdAndDelete(categoryId);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }
    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      data: category,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export {
  AddCategory,
  getcategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
};
