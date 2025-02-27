import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
  {
    categoryName: { type: String, required: true, unique: true },
    categoryImage: { type: String, required: true },
    shortDescription: { type: String, required: true },
    longDescription: { type: String, required: true },
  },
  { timestamps: true }
);

const Category = mongoose.model("Category", CategorySchema);

export default Category;
