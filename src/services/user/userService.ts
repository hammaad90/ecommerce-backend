// src/services/user/userService.ts
import UserModel, { IUser } from "./userModel";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { CONFIG } from "../../config";

export async function registerUser(data: {
  email: string;
  password: string;
  name: string;
}): Promise<IUser> {
  const existingUser = await UserModel.findOne({ email: data.email }).exec();
  if (existingUser) {
    throw new Error("Email already registered");
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  const user = new UserModel({
    email: data.email,
    passwordHash,
    name: data.name,
  });

  return user.save();
}

export async function loginUser(email: string, password: string): Promise<string> {
  const user = await UserModel.findOne({ email }).exec();
  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  return generateToken(user);
}

function generateToken(user: IUser): string {
  const payload = {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, CONFIG.JWT_SECRET, { expiresIn: "7d" });
}

export async function getUserById(id: string): Promise<IUser | null> {
  return UserModel.findById(id).exec();
}
