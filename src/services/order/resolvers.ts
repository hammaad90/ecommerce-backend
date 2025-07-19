// src/services/order/resolvers.ts
import {
    createOrder,
    getOrderById,
    getOrdersByUser,
    updateOrderStatus,
  } from "./orderService";
  import { IOrder } from "./orderModel";
  
  const orderResolvers = {
    Query: {
      orders: async (_: any, __: any, context: { user: { id: string } | null }): Promise<IOrder[]> => {
        if (!context.user) {
          throw new Error("Unauthorized");
        }
        return getOrdersByUser(context.user.id);
      },
      order: async (_: any, args: { id: string }, context: { user: { id: string } | null }): Promise<IOrder | null> => {
        if (!context.user) {
          throw new Error("Unauthorized");
        }
        const order = await getOrderById(args.id);
        if (!order) {
          throw new Error("Order not found");
        }
        // Check ownership
        if (order.userId.toString() !== context.user.id) {
          throw new Error("Forbidden");
        }
        return order;
      },
    },
  
    Mutation: {
      createOrder: async (
        _: any,
        args: {
          items: { productId: string; quantity: number; price: number }[];
        },
        context: { user: { id: string } | null }
      ): Promise<IOrder> => {
        if (!context.user) {
          throw new Error("Unauthorized");
        }
        return createOrder(context.user.id, args.items);
      },
  
      updateOrderStatus: async (
        _: any,
        args: { id: string; status: "PENDING" | "PROCESSING" | "COMPLETED" | "CANCELLED" },
        context: { user: { role: string } | null }
      ): Promise<IOrder | null> => {
        // Only admins allowed
        if (!context.user || context.user.role !== "admin") {
          throw new Error("Forbidden");
        }
        return updateOrderStatus(args.id, args.status);
      },
    },
  };
  
  export default orderResolvers;
  