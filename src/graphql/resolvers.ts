// src/graphql/resolvers.ts
import productResolvers from "../services/product/resolvers";
import cartResolvers from "../services/cart/resolvers";
import orderResolvers from "../services/order/resolvers";
import userResolvers from "../services/user/resolvers";
import paymentResolvers from "../services/payment/resolvers";

const resolvers = {
  Query: {
    ...productResolvers.Query,
    ...cartResolvers.Query,
    ...orderResolvers.Query,
    ...userResolvers.Query,
    ...paymentResolvers.Query,
  },
  Mutation: {
    ...productResolvers.Mutation,
    ...cartResolvers.Mutation,
    ...orderResolvers.Mutation,
    ...userResolvers.Mutation,
    ...paymentResolvers.Mutation,
  },
  Subscription: {
    ...productResolvers.Subscription,
    ...cartResolvers.Subscription,
    ...orderResolvers.Subscription,
    ...userResolvers.Subscription,
    ...paymentResolvers.Subscription,
  },
  // Add any custom scalars or type resolvers here if needed
};

export default resolvers;
