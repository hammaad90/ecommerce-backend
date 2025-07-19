// src/services/order/orderService.ts
import OrderModel, { IOrder, IOrderItem } from "./orderModel";
import { Types } from "mongoose";

export class OrderService {
  async createOrder(
    userId: string,
    items: { productId: string; quantity: number; price: number }[]
  ): Promise<IOrder> {
    const orderItems: IOrderItem[] = items.map(({ productId, quantity, price }) => ({
      productId: new Types.ObjectId(productId),
      quantity,
      price,
    }));

    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = new OrderModel({
      userId: new Types.ObjectId(userId),
      items: orderItems,
      totalAmount,
      status: "PENDING",
    });

    return order.save();
  }

  async getOrderById(orderId: string): Promise<IOrder | null> {
    return OrderModel.findById(orderId).populate("items.productId").exec();
  }

  async getOrdersByUser(userId: string): Promise<IOrder[]> {
    return OrderModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  async updateOrderStatus(orderId: string, status: IOrder["status"]): Promise<IOrder | null> {
    return OrderModel.findByIdAndUpdate(orderId, { status }, { new: true }).exec();
  }

  // Add your processOrder method expected by orderHandler.ts
  async processOrder(orderData: any): Promise<void> {
    // Example: Mark order as complete or update status
    await this.updateOrderStatus(orderData.orderId, "COMPLETED");
    // Add any other processing logic here like sending notification, etc.
  }
}
