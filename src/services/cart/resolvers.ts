// src/services/cart/resolvers.ts
import {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
  CartItem,
} from "./cartService";
import { PubSub } from "graphql-subscriptions";

const CART_UPDATED = "CART_UPDATED";

interface CartEvents {
  [event: string]: unknown;
  CART_UPDATED: {
    cartUpdated: CartItem[];
    userId: string;
  };
}

const pubsub = new PubSub<CartEvents>();

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
      const updatedCart = await addToCart(context.user.id, productId, quantity);

      pubsub.publish(CART_UPDATED, {
        cartUpdated: updatedCart,
        userId: context.user.id,
      });

      return updatedCart;
    },

    removeFromCart: async (
      _: any,
      args: { productId: string },
      context: { user: { id: string } | null }
    ): Promise<CartItem[]> => {
      if (!context.user) {
        throw new Error("Unauthorized");
      }
      const updatedCart = await removeFromCart(context.user.id, args.productId);

      pubsub.publish(CART_UPDATED, {
        cartUpdated: updatedCart,
        userId: context.user.id,
      });

      return updatedCart;
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

      pubsub.publish(CART_UPDATED, {
        cartUpdated: [],
        userId: context.user.id,
      });

      return true;
    },
  },

  Subscription: {
    cartUpdated: {
      subscribe: (_: any, __: any, context: { user: { id: string } | null }) => {
        if (!context.user) {
          throw new Error("Unauthorized");
        }
        // Cast to any to fix TS error for asyncIterator
        return (pubsub as any).asyncIterator(CART_UPDATED);
      },
      resolve: (
        payload: CartEvents["CART_UPDATED"],
        _: any,
        context: { user: { id: string } | null }
      ) => {
        if (context.user && payload.userId === context.user.id) {
          return payload.cartUpdated;
        }
        return null; // Filter out other users' events
      },
    },
  },
};

export { pubsub };
export default cartResolvers;
