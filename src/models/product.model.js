import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    productName: { type: String, required: true, trim: true,unique: true},
    productImage: { type: String, required: true },
    shortDescription: { type: String, required: true },
    longDescription: { type: String, required: true },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", ProductSchema);
export default Product;
