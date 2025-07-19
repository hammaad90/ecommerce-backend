// src/services/product/resolvers.ts
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "./productService";
import { IProduct } from "./productModel";
import { PubSub } from "graphql-subscriptions";

const PRODUCT_ADDED = "PRODUCT_ADDED";

interface ProductEvents {
  [event: string]: unknown;
  PRODUCT_ADDED: { productAdded: IProduct };
}

const pubsub = new PubSub<ProductEvents>();

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
      },
      context: { user: { id: string } | null }
    ): Promise<IProduct> => {
      if (!context.user) {
        throw new Error("Unauthorized");
      }
      const newProduct = await createProduct(args);

      // Publish the event with the wrapped payload as required by Apollo subscriptions
      pubsub.publish(PRODUCT_ADDED, { productAdded: newProduct });

      return newProduct;
    },

    updateProduct: async (
      _: any,
      args: { id: string; data: Partial<Omit<IProduct, "_id" | "createdAt" | "updatedAt">> },
      context: { user: { id: string } | null }
    ): Promise<IProduct | null> => {
      if (!context.user) {
        throw new Error("Unauthorized");
      }
      return updateProduct(args.id, args.data);
    },

    deleteProduct: async (
      _: any,
      args: { id: string },
      context: { user: { id: string } | null }
    ): Promise<IProduct | null> => {
      if (!context.user) {
        throw new Error("Unauthorized");
      }
      return deleteProduct(args.id);
    },
  },

  Subscription: {
    productAdded: {
      subscribe: (_: any, __: any, context: { user: { id: string } | null }) => {
        if (!context.user) {
          throw new Error("Unauthorized");
        }
        // Cast to any to fix TypeScript asyncIterator error
        return (pubsub as any).asyncIterator(PRODUCT_ADDED);
      },
    },
  },
};

export { pubsub };
export default productResolvers;
