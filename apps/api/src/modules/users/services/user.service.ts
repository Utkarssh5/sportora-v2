import bcrypt from "bcrypt";
import { userRepository } from "../repositories/user.repository.js";
import type { RegisterUserInput } from "../schemas/user.schema.js";
import type { IUser } from "../models/user.model.js";

export class UserService {
  async register(data: RegisterUserInput): Promise<IUser> {
    // Check if user already exists
    const existingUser = await userRepository.findByEmail(data.email);

    if (existingUser) {
      throw new Error("Email already registered");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const payload: any = {
      fullName: data.fullName,
      email: data.email,
      password: hashedPassword,
    };
    
    if (data.phone) {
      payload.phone = data.phone;
    }
    
    if (data.role) {
      payload.role = data.role;
    }
    
    const user = await userRepository.create(payload);

    return user;
  }
}

export const userService = new UserService();