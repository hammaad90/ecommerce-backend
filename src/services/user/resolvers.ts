// src/services/user/resolvers.ts
import {
  registerUser,
  loginUser,
  getUserById,
} from "./userService";
import { PubSub } from "graphql-subscriptions";

const USER_UPDATED = "USER_UPDATED";

interface UserEvents {
  [event: string]: unknown;
  USER_UPDATED: {
    userUpdated: { id: string; email?: string; name?: string };
    userId: string;
  };
}

const pubsub = new PubSub<UserEvents>();

const userResolvers = {
  Query: {
    me: async (_: any, __: any, context: { user: { id: string } | null }) => {
      if (!context.user) {
        throw new Error("Unauthorized");
      }
      return getUserById(context.user.id);
    },
  },

  Mutation: {
    register: async (
      _: any,
      args: { email: string; password: string; name: string }
    ) => {
      return registerUser(args);
    },

    login: async (
      _: any,
      args: { email: string; password: string }
    ) => {
      const token = await loginUser(args.email, args.password);
      return { token };
    },

    updateUser: async (
      _: any,
      args: { id: string; data: Partial<{ email: string; name: string }> },
      context: { user: { id: string } | null }
    ) => {
      if (!context.user || context.user.id !== args.id) {
        throw new Error("Forbidden");
      }
      const updatedUser = await updateUserInDb(args.id, args.data);
      pubsub.publish(USER_UPDATED, {
        userUpdated: updatedUser,
        userId: args.id,
      });
      return updatedUser;
    },
  },

  Subscription: {
    userUpdated: {
      subscribe: (_: any, __: any, context: { user: { id: string } | null }) => {
        if (!context.user) {
          throw new Error("Unauthorized");
        }
        // Cast to `any` to avoid TS asyncIterator type error
        return (pubsub as any).asyncIterator(USER_UPDATED);
      },
      resolve: (
        payload: UserEvents["USER_UPDATED"],
        _: any,
        context: { user: { id: string } | null }
      ) => {
        if (context.user && payload.userId === context.user.id) {
          return payload.userUpdated;
        }
        return null; // Ignore events not for this user
      },
    },
  },
};

export { pubsub };
export default userResolvers;

// Temporary mock for updating user data.
// Replace this with your DB logic (e.g., using Mongoose).
async function updateUserInDb(
  id: string,
  data: Partial<{ email: string; name: string }>
) {
  return { id, ...data };
}
