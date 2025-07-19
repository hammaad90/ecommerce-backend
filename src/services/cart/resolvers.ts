// src/services/cart/resolvers.ts
import {
    getCart,
    addToCart,
    removeFromCart,
    clearCart,
    CartItem,
  } from "./cartService";
  
  const cartResolvers = {
    Query: {
      cart: async (_: any, __: any, context: { user: { id: string } | null }) => {
        if (!context.user) {
          throw new Error("Unauthorized");
        }
        return getCart(context.user.id);
      },
    },
  
    Mutation: {
      addToCart: async (
        _: any,
        args: { productId: string; quantity: number },
        context: { user: { id: string } | null }
      ): Promise<CartItem[]> => {
        if (!context.user) {
          throw new Error("Unauthorized");
        }
        const { productId, quantity } = args;
        if (quantity <= 0) {
          throw new Error("Quantity must be greater than zero");
        }
        return addToCart(context.user.id, productId, quantity);
      },
  
      removeFromCart: async (
        _: any,
        args: { productId: string },
        context: { user: { id: string } | null }
      ): Promise<CartItem[]> => {
        if (!context.user) {
          throw new Error("Unauthorized");
        }
        return removeFromCart(context.user.id, args.productId);
      },
  
      clearCart: async (
        _: any,
        __: any,
        context: { user: { id: string } | null }
      ): Promise<boolean> => {
        if (!context.user) {
          throw new Error("Unauthorized");
        }
        await clearCart(context.user.id);
        return true;
      },
    },
  };
  
  export default cartResolvers;
  