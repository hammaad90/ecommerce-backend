// src/services/user/resolvers.ts
import {
    registerUser,
    loginUser,
    getUserById,
  } from "./userService";
  
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
    },
  };
  
  export default userResolvers;
  