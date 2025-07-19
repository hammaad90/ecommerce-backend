// src/services/cart/cartService.ts
import { createRedisClient } from "../../shared/cache/redis";

export interface CartItem {
  productId: string;
  quantity: number;
}

const CART_PREFIX = "cart:"; // Redis key prefix for user carts

/**
 * Fetches the cart items for a user from Redis
 * @param userId
 */
export async function getCart(userId: string): Promise<CartItem[]> {
  const redis = await createRedisClient();
  const cartKey = CART_PREFIX + userId;

  const cartData = await redis.get(cartKey);
  if (!cartData) {
    return [];
  }

  try {
    const cartItems: CartItem[] = JSON.parse(cartData);
    return cartItems;
  } catch {
    return [];
  }
}

/**
 * Adds or updates a product quantity in the user's cart
 * @param userId
 * @param productId
 * @param quantity Must be positive integer
 */
export async function addToCart(userId: string, productId: string, quantity: number): Promise<CartItem[]> {
  const redis = await createRedisClient();
  const cartKey = CART_PREFIX + userId;

  const cartItems = await getCart(userId);

  const index = cartItems.findIndex((item) => item.productId === productId);
  if (index >= 0) {
    cartItems[index].quantity += quantity;
  } else {
    cartItems.push({ productId, quantity });
  }

  await redis.set(cartKey, JSON.stringify(cartItems));
  return cartItems;
}

/**
 * Removes a product from the cart
 * @param userId
 * @param productId
 */
export async function removeFromCart(userId: string, productId: string): Promise<CartItem[]> {
  const redis = await createRedisClient();
  const cartKey = CART_PREFIX + userId;

  const cartItems = await getCart(userId);
  const filteredItems = cartItems.filter((item) => item.productId !== productId);

  await redis.set(cartKey, JSON.stringify(filteredItems));
  return filteredItems;
}

/**
 * Clears the entire cart for a user
 * @param userId
 */
export async function clearCart(userId: string): Promise<void> {
  const redis = await createRedisClient();
  const cartKey = CART_PREFIX + userId;
  await redis.del(cartKey);
}
