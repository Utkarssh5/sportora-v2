import bcrypt from "bcrypt";
import { authRepository } from "../repositories/auth.repository.js";
import type { RegisterInput } from "../schemas/register.schema.js";
import type { IUser } from "../../../models/user.model.js";
export class AuthService {
  async register(data: RegisterInput): Promise<IUser> {
    const existingUser = await authRepository.findByEmail(data.email);

    if (existingUser) {
      throw new Error("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    return authRepository.create({
      ...data,
      password: hashedPassword,
    });
  }
}

export const authService = new AuthService();