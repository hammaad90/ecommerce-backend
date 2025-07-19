// src/handler.ts
import { server } from "./graphql/server";
import { APIGatewayProxyHandler } from "aws-lambda";

// Export the GraphQL handler for AWS Lambda
export const graphqlHandler: APIGatewayProxyHandler = server.createHandler({
  cors: {
    origin: "*", // Adjust this for production to your domain
    credentials: true,
  },
});


