// src/graphql/typeDefs.ts
import { gql } from "apollo-server-lambda";
import productSchema from "../services/product/schema.graphql";
import cartSchema from "../services/cart/schema.graphql";
import orderSchema from "../services/order/schema.graphql";
import userSchema from "../services/user/schema.graphql";
import paymentSchema from "../services/payment/schema.graphql";

const baseSchema = gql`
  scalar DateTime

  type Query
  type Mutation
  type Subscription
`;

const combinedSchema = gql`
  ${baseSchema}
  ${productSchema}
  ${cartSchema}
  ${orderSchema}
  ${userSchema}
  ${paymentSchema}
`;

export default combinedSchema;
