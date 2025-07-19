// src/services/payment/resolvers.ts
import { createPaymentIntent, retrievePaymentIntent } from "./paymentService";
import { PubSub } from "graphql-subscriptions";

const PAYMENT_STATUS_UPDATED = "PAYMENT_STATUS_UPDATED";

interface PaymentEvents {
  [event: string]: unknown;
  PAYMENT_STATUS_UPDATED: {
    paymentStatusUpdated: {
      id: string;
      status: string;
      amount: number;
      currency: string;
      [key: string]: any; // To include any extra fields (like from Stripe)
    };
    paymentIntentId: string;
  };
}

const pubsub = new PubSub<PaymentEvents>();

const paymentResolvers = {
  Query: {
    getPaymentStatus: async (_: any, args: { paymentIntentId: string }) => {
      return retrievePaymentIntent(args.paymentIntentId);
    },
  },

  Mutation: {
    createPayment: async (
      _: any,
      args: { amount: number; currency?: string; metadata?: Record<string, string> },
      context: { user?: { id: string } | null }
    ) => {
      if (!context.user) {
        throw new Error("Unauthorized");
      }

      const paymentIntent = await createPaymentIntent(
        args.amount,
        args.currency || "usd",
        args.metadata || {}
      );

      // Notify subscribers (for real-time UI updates)
      pubsub.publish(PAYMENT_STATUS_UPDATED, {
        paymentStatusUpdated: {
          ...paymentIntent,
          id: paymentIntent.id,
          status: paymentIntent.status,
          amount: args.amount,
          currency: args.currency || "usd",
        },
        paymentIntentId: paymentIntent.id,
      });

      return paymentIntent;
    },
  },

  Subscription: {
    paymentStatusUpdated: {
      // We prefix unused params with `_` to avoid warnings
      subscribe: (_: any, _args: { paymentIntentId: string }, context: { user?: { id: string } | null }) => {
        if (!context.user) {
          throw new Error("Unauthorized");
        }
        // Cast to `any` to bypass TS asyncIterator typing issue
        return (pubsub as any).asyncIterator(PAYMENT_STATUS_UPDATED);
      },
      resolve: (
        payload: PaymentEvents["PAYMENT_STATUS_UPDATED"],
        args: { paymentIntentId: string }
      ) => {
        // Only emit updates for the specific paymentIntent the client subscribed to
        if (payload.paymentIntentId === args.paymentIntentId) {
          return payload.paymentStatusUpdated;
        }
        return null;
      },
    },
  },
};

export { pubsub };
export default paymentResolvers;
