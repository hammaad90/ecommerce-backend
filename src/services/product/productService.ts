// src/services/product/productService.ts
import ProductModel, { IProduct } from "./productModel";

export async function getAllProducts(): Promise<IProduct[]> {
  return ProductModel.find().lean().exec();
}

export async function getProductById(id: string): Promise<IProduct | null> {
  return ProductModel.findById(id).lean().exec();
}

export async function createProduct(data: {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
}): Promise<IProduct> {
  const product = new ProductModel(data);
  return product.save();
}

export async function updateProduct(
  id: string,
  data: Partial<{
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    stock: number;
  }>
): Promise<IProduct | null> {
  return ProductModel.findByIdAndUpdate(id, data, { new: true }).lean().exec();
}

export async function deleteProduct(id: string): Promise<IProduct | null> {
  return ProductModel.findByIdAndDelete(id).lean().exec();
}
