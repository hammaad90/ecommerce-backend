# ecommerce-backend

# E-Commerce Backend with Node.js, GraphQL, AWS Lambda, MongoDB, Redis, and Docker

## Overview

This project is a scalable, production-ready backend for a simple e-commerce platform.  
Users can register, login, browse products, add products to a cart, place orders, and make payments.

### Technologies Used

- Node.js with TypeScript  
- GraphQL API using Apollo Server Lambda  
- MongoDB for product, user, and order data  
- Redis for cart caching and session management  
- AWS Lambda + API Gateway for serverless deployment  
- AWS SQS & SNS for messaging and notifications  
- AWS CloudWatch for logging and monitoring  
- Stripe for payment processing  
- Docker for containerized local development  

## Setup Instructions

### Prerequisites

- Node.js >= 18  
- AWS CLI configured with proper permissions  
- MongoDB URI  
- Redis instance  
- Stripe account and secret key  

### Environment Variables

Copy `.env.example` to `.env` and fill in your credentials.

```bash
cp .env.example .env



Install Dependencies
bash
Copy
Edit
npm install
Run Locally
bash
Copy
Edit
npm run start:offline
This will run the GraphQL server locally using Serverless Offline on port 4000.

Deploy to AWS
Make sure your AWS credentials are set and run:

bash
Copy
Edit
npx serverless deploy
Logging and Monitoring
Logs are written using a structured logger (pino) and collected in AWS CloudWatch.

Errors, warnings, and info logs include contextual information for easier debugging.

Notes
Payment integration uses Stripe. Configure your Stripe secret key in environment variables.

Redis is used to store user carts for quick access and scalability.

GraphQL schema is modular and follows best practices.

You can extend this backend by adding more features like product reviews, user roles, etc.






E-Commerce Backend Full Workflow & Data Flow
1. User Authentication
User sends login request (GraphQL mutation) to AWS Lambda (handler.ts) via API Gateway.

Lambda runs authService → verifies credentials against MongoDB user collection.

On success, Lambda returns JWT token to user.

User stores JWT and includes it in Authorization header for future requests.

2. Product Listing
User sends GraphQL query products (with optional pagination).

Request routed via Nginx reverse proxy → API Gateway → Lambda handler.ts.

Lambda loads product schema resolver → calls productService.

productService queries MongoDB to fetch product documents.

Products returned as GraphQL response to user.

3. Add to Cart
User sends mutation addToCart(productId, quantity) with JWT auth.

Lambda validates JWT via middleware (auth.ts).

Calls cartService to add/update product in user's cart stored in MongoDB.

Optionally updates Redis cache for quick cart retrieval.

Updated cart object returned to user.

4. View Cart
User sends query cart with JWT.

Lambda validates JWT.

Checks Redis cache first for cart data.

If cache miss, fetches cart from MongoDB via cartService.

Returns cart items and totals.

5. Checkout (Create Order)
User sends mutation checkout with JWT.

Lambda validates JWT.

cartService fetches user's current cart from MongoDB or Redis.

Creates an order entry (OrderModel) in MongoDB with status PENDING.

Sends an SQS message (using AWS SDK) with order data to the order queue.

Clears cart from MongoDB and Redis.

6. Order Processing (Background Worker)
A separate AWS Lambda function (src/workers/orderHandler.ts) is triggered by SQS messages.

It processes each order message:

Updates order status in MongoDB.

Sends SNS notifications (email, SMS, etc.) if configured.

Logs events to CloudWatch for observability.

7. Payment Handling
Frontend uses Stripe (or another gateway) to handle payment.

Stripe calls your backend webhook (Lambda payment/webhookHandler.ts) when payment status changes.

Webhook Lambda verifies event authenticity.

On successful payment:

Updates order status to COMPLETED in MongoDB.

Publishes SNS notification if needed.

Logs payment event to CloudWatch.

8. Static Assets
Product images uploaded and served from AWS S3.

Backend uploads images using S3 SDK.

Frontend loads images via pre-signed URLs or public URLs.

9. Logging & Monitoring
All Lambdas use centralized logger.ts with Winston.

Logs are streamed to AWS CloudWatch.

CloudWatch alarms can be set for errors or performance issues.

Logs help track request lifecycle from API Gateway → Lambda → MongoDB/AWS Services.





1. User Login
GraphQL Mutation

graphql
Copy
Edit
mutation LoginUser($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    token
    user {
      id
      name
      email
    }
  }
}
Sample Variables

json
Copy
Edit
{
  "email": "john@example.com",
  "password": "securePassword123"
}
Sample Response

json
Copy
Edit
{
  "data": {
    "login": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "607c35c7a5e34a1f947c33ef",
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  }
}
2. Fetch Products List
GraphQL Query

graphql
Copy
Edit
query GetProducts($limit: Int, $offset: Int) {
  products(limit: $limit, offset: $offset) {
    id
    name
    description
    price
    imageUrl
    stock
  }
}
Sample Variables

json
Copy
Edit
{
  "limit": 10,
  "offset": 0
}
Sample Response

json
Copy
Edit
{
  "data": {
    "products": [
      {
        "id": "607c3603a5e34a1f947c3401",
        "name": "Wireless Mouse",
        "description": "Ergonomic wireless mouse",
        "price": 25.99,
        "imageUrl": "https://s3.amazonaws.com/mybucket/images/mouse.jpg",
        "stock": 50
      },
      {
        "id": "607c3617a5e34a1f947c3402",
        "name": "Mechanical Keyboard",
        "description": "RGB backlit keyboard",
        "price": 75.5,
        "imageUrl": "https://s3.amazonaws.com/mybucket/images/keyboard.jpg",
        "stock": 30
      }
      // more products...
    ]
  }
}
3. Add Item to Cart
GraphQL Mutation

graphql
Copy
Edit
mutation AddToCart($productId: ID!, $quantity: Int!) {
  addToCart(productId: $productId, quantity: $quantity) {
    id
    items {
      product {
        id
        name
        price
      }
      quantity
    }
    totalPrice
  }
}
Sample Variables

json
Copy
Edit
{
  "productId": "607c3603a5e34a1f947c3401",
  "quantity": 2
}
Sample Response

json
Copy
Edit
{
  "data": {
    "addToCart": {
      "id": "607c3697a5e34a1f947c3455",
      "items": [
        {
          "product": {
            "id": "607c3603a5e34a1f947c3401",
            "name": "Wireless Mouse",
            "price": 25.99
          },
          "quantity": 2
        }
      ],
      "totalPrice": 51.98
    }
  }
}
4. View Cart
GraphQL Query

graphql
Copy
Edit
query GetCart {
  cart {
    id
    items {
      product {
        id
        name
        price
      }
      quantity
    }
    totalPrice
  }
}
Sample Response

json
Copy
Edit
{
  "data": {
    "cart": {
      "id": "607c3697a5e34a1f947c3455",
      "items": [
        {
          "product": {
            "id": "607c3603a5e34a1f947c3401",
            "name": "Wireless Mouse",
            "price": 25.99
          },
          "quantity": 2
        }
      ],
      "totalPrice": 51.98
    }
  }
}
5. Checkout (Create Order)
GraphQL Mutation

graphql
Copy
Edit
mutation Checkout {
  checkout {
    id
    totalAmount
    status
    createdAt
  }
}
Sample Response

json
Copy
Edit
{
  "data": {
    "checkout": {
      "id": "607c370aa5e34a1f947c3499",
      "totalAmount": 51.98,
      "status": "PENDING",
      "createdAt": "2025-07-19T10:23:45.678Z"
    }
  }
}
6. Payment Webhook (Internal Mutation)
This would be called internally when your payment gateway notifies payment status.

GraphQL Mutation

graphql
Copy
Edit
mutation ConfirmPayment($orderId: ID!, $paymentStatus: String!) {
  confirmPayment(orderId: $orderId, paymentStatus: $paymentStatus) {
    id
    status
  }
}
Sample Variables

json
Copy
Edit
{
  "orderId": "607c370aa5e34a1f947c3499",
  "paymentStatus": "COMPLETED"
}
Sample Response

json
Copy
Edit
{
  "data": {
    "confirmPayment": {
      "id": "607c370aa5e34a1f947c3499",
      "status": "COMPLETED"
    }
  }
}
Notes:
All mutations/queries are sent to your API Gateway URL, e.g., https://your-api-id.execute-api.region.amazonaws.com/prod/graphql

JWT token should be included in the Authorization header for all authenticated routes (addToCart, checkout, etc.)

File/image uploads can be done via pre-signed S3 URLs (not shown here).