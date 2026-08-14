import bcrypt from "bcrypt";

import { authRepository } from "../repositories/auth.repository.js";

import type { RegisterInput } from "../schemas/register.schema.js";
import type { LoginInput } from "../schemas/login.schema.js";

import type { IUser } from "../../users/models/user.model.js";

import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../../lib/jwt.js";

export class AuthService {
  async register(data: RegisterInput): Promise<IUser> {
    const existingUser = await authRepository.findByEmail(data.email);

    if (existingUser) {
      throw new Error("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

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
    
    return authRepository.create(payload);
  }

  async login(data: LoginInput) {
    const user = await authRepository.findByEmail(data.email);

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(
      data.password,
      user.password
    );

    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    const accessToken = generateAccessToken({
      id: user._id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      id: user._id,
    });

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshToken: string) {
    const payload = verifyRefreshToken(refreshToken) as {
      id: string;
    };

    const user = await authRepository.findById(payload.id);

    if (!user) {
      throw new Error("User not found");
    }

    const accessToken = generateAccessToken({
      id: user._id,
      email: user.email,
      role: user.role,
    });

    return {
      accessToken,
    };
  }
}

export const authService = new AuthService();