// src/services/payment/resolvers.ts
import { createPaymentIntent, retrievePaymentIntent } from "./paymentService";

const paymentResolvers = {
  Query: {
    getPaymentStatus: async (_: any, args: { paymentIntentId: string }) => {
      return retrievePaymentIntent(args.paymentIntentId);
    },
  },

  Mutation: {
    createPayment: async (_: any, args: { amount: number; currency?: string; metadata?: Record<string, string> }) => {
      return createPaymentIntent(args.amount, args.currency || "usd", args.metadata || {});
    },
  },
};

export default paymentResolvers;
