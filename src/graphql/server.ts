// src/graphql/server.ts
import { ApolloServer } from "apollo-server-lambda";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { mergeTypeDefs, mergeResolvers } from "@graphql-tools/merge";
import { readFileSync } from "fs";
import path from "path";
import userResolvers from "../services/user/resolvers";
import userSchema from "../services/user/schema.graphql";
import productResolvers from "../services/product/resolvers";
import productSchema from "../services/product/schema.graphql";
import cartResolvers from "../services/cart/resolvers";
import cartSchema from "../services/cart/schema.graphql";
import orderResolvers from "../services/order/resolvers";
import orderSchema from "../services/order/schema.graphql";
import paymentResolvers from "../services/payment/resolvers";
import paymentSchema from "../services/payment/schema.graphql";
import { authenticateToken } from "../shared/middleware/auth";
import { connectMongo } from "../shared/db/mongo";

// Load DateTime scalar definition from a separate file or define inline
const dateTimeScalar = `
scalar DateTime
scalar JSON
`;

// Merge all schemas and resolvers
const typeDefs = mergeTypeDefs([
  dateTimeScalar,
  userSchema,
  productSchema,
  cartSchema,
  orderSchema,
  paymentSchema,
]);

const resolvers = mergeResolvers([
  userResolvers,
  productResolvers,
  cartResolvers,
  orderResolvers,
  paymentResolvers,
]);

export const server = new ApolloServer({
  schema: makeExecutableSchema({ typeDefs, resolvers }),
  context: async ({ event }) => {
    // Connect to MongoDB on each invocation (will reuse cached connection)
    await connectMongo();

    // Extract Authorization header
    const authHeader = event.headers.Authorization || event.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    const user = token ? authenticateToken(token) : null;

    return { user };
  },
});
