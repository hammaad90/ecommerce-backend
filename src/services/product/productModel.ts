// src/services/product/productModel.ts
import { Schema, model, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, required: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
  },
  {
    timestamps: true, // createdAt and updatedAt auto-managed
  }
);

const ProductModel = model<IProduct>("Product", productSchema);

export default ProductModel;
