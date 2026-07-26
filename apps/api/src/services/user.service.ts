import bcrypt from "bcrypt";
import { userRepository } from "../repositories/user.repository.js";
import { RegisterUserInput } from "../validators/user.validator.js";
import { IUser } from "../models/user.model.js";

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
    const user = await userRepository.create({
      ...data,
      password: hashedPassword,
    });

    return user;
  }
}

export const userService = new UserService();