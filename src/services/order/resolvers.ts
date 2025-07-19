// src/services/order/resolvers.ts
import { OrderService } from "./orderService";
import { IOrder } from "./orderModel";
import { PubSub } from "graphql-subscriptions";

const orderService = new OrderService();

const ORDER_STATUS_CHANGED = "ORDER_STATUS_CHANGED";

interface OrderEvents {
  [event: string]: unknown;
  ORDER_STATUS_CHANGED: {
    orderStatusChanged: IOrder;
    userId: string;
  };
}

const pubsub = new PubSub<OrderEvents>();

const orderResolvers = {
  Query: {
    orders: async (_: any, __: any, context: { user: { id: string } | null }): Promise<IOrder[]> => {
      if (!context.user) {
        throw new Error("Unauthorized");
      }
      return orderService.getOrdersByUser(context.user.id);
    },
    order: async (_: any, args: { id: string }, context: { user: { id: string } | null }): Promise<IOrder | null> => {
      if (!context.user) {
        throw new Error("Unauthorized");
      }
      const order = await orderService.getOrderById(args.id);
      if (!order) {
        throw new Error("Order not found");
      }
      if (order.userId.toString() !== context.user.id) {
        throw new Error("Forbidden");
      }
      return order;
    },
  },

  Mutation: {
    createOrder: async (
      _: any,
      args: { items: { productId: string; quantity: number; price: number }[] },
      context: { user: { id: string } | null }
    ): Promise<IOrder> => {
      if (!context.user) {
        throw new Error("Unauthorized");
      }
      return orderService.createOrder(context.user.id, args.items);
    },

    updateOrderStatus: async (
      _: any,
      args: { id: string; status: "PENDING" | "PROCESSING" | "COMPLETED" | "CANCELLED" },
      context: { user: { role: string } | null }
    ): Promise<IOrder | null> => {
      if (!context.user || context.user.role !== "admin") {
        throw new Error("Forbidden");
      }
      const updatedOrder = await orderService.updateOrderStatus(args.id, args.status);

      if (updatedOrder) {
        pubsub.publish(ORDER_STATUS_CHANGED, {
          orderStatusChanged: updatedOrder,
          userId: updatedOrder.userId.toString(),
        });
      }

      return updatedOrder;
    },
  },

  Subscription: {
    orderStatusChanged: {
      subscribe: (_: any, __: any, context: { user: { id: string } | null }) => {
        if (!context.user) {
          throw new Error("Unauthorized");
        }
        // Cast to any to avoid TS error on asyncIterator
        return (pubsub as any).asyncIterator(ORDER_STATUS_CHANGED);
      },
      resolve: (payload: OrderEvents["ORDER_STATUS_CHANGED"], _: any, context: { user: { id: string } | null }) => {
        if (context.user && payload.userId === context.user.id) {
          return payload.orderStatusChanged;
        }
        return null; // filter out other users' events
      },
    },
  },
};

export { pubsub };
export default orderResolvers;
