// src/services/payment/paymentService.ts
import Stripe from "stripe";
import { CONFIG } from "../../config";

const stripe = new Stripe(CONFIG.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});

/**
 * Creates a payment intent for the given amount (in smallest currency unit, e.g. cents)
 * @param amount Amount in smallest unit (e.g., 1000 for $10.00)
 * @param currency Currency code, e.g. "usd"
 * @param metadata Optional metadata such as orderId, userId
 */
export async function createPaymentIntent(
  amount: number,
  currency: string = "usd",
  metadata: Record<string, string> = {}
) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata,
    });
    return paymentIntent;
  } catch (error) {
    throw new Error(`Stripe Payment Intent creation failed: ${(error as Error).message}`);
  }
}

/**
 * Retrieves a payment intent by ID
 * @param paymentIntentId
 */
export async function retrievePaymentIntent(paymentIntentId: string) {
  try {
    return await stripe.paymentIntents.retrieve(paymentIntentId);
  } catch (error) {
    throw new Error(`Stripe Payment Intent retrieval failed: ${(error as Error).message}`);
  }
}
