// src/handler.ts
import { server } from "./graphql/server";
import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context, APIGatewayProxyResult } from "aws-lambda";

// Create the Apollo Server Lambda handler without cors option
const apolloHandler = server.createHandler();

export const graphqlHandler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent,
  context: Context,
): Promise<APIGatewayProxyResult> => {
  // Call Apollo handler inside a promise to await its callback
  const response = await new Promise<APIGatewayProxyResult>((resolve, reject) => {
    apolloHandler(event, context, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result as APIGatewayProxyResult);
      }
    });
  });

  // Add CORS headers to the response
  response.headers = {
    ...response.headers,
    "Access-Control-Allow-Origin": "*", // Change "*" to your domain for production
    "Access-Control-Allow-Credentials": "true",
  };

  return response;
};
