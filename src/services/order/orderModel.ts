// src/services/order/orderModel.ts
import { Schema, model, Document, Types } from "mongoose";

export interface IOrderItem {
  productId: Types.ObjectId;
  quantity: number;
  price: number; // price at purchase time
}

export interface IOrder extends Document {
  userId: Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "CANCELLED";
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [orderItemSchema], required: true },
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["PENDING", "PROCESSING", "COMPLETED", "CANCELLED"],
      default: "PENDING",
    },
  },
  {
    timestamps: true,
  }
);

const OrderModel = model<IOrder>("Order", orderSchema);

export default OrderModel;
