// src/services/product/resolvers.ts
import {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
  } from "./productService";
  import { IProduct } from "./productModel";
  
  const productResolvers = {
    Query: {
      products: async (): Promise<IProduct[]> => {
        return getAllProducts();
      },
      product: async (_: any, args: { id: string }): Promise<IProduct | null> => {
        return getProductById(args.id);
      },
    },
    Mutation: {
      createProduct: async (
        _: any,
        args: {
          name: string;
          description: string;
          price: number;
          imageUrl: string;
          stock: number;
        }
      ): Promise<IProduct> => {
        return createProduct(args);
      },
      updateProduct: async (
        _: any,
        args: { id: string; data: Partial<Omit<IProduct, "_id" | "createdAt" | "updatedAt">> }
      ): Promise<IProduct | null> => {
        return updateProduct(args.id, args.data);
      },
      deleteProduct: async (_: any, args: { id: string }): Promise<IProduct | null> => {
        return deleteProduct(args.id);
      },
    },
  };
  
  export default productResolvers;
  