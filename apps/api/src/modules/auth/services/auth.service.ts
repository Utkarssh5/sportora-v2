import bcrypt from "bcrypt";

import { authRepository } from "../repositories/auth.repository.js";

import type { RegisterInput } from "../schemas/register.schema.js";
import type { LoginInput } from "../schemas/login.schema.js";

import { organizerVerificationRepository } from "../../organizerVerification/repositories/organizerVerification.repository.js";
import { VerificationStatus } from "../../organizerVerification/models/organizerVerification.model.js";
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
    
    const user = await authRepository.create(payload);

    if (data.role === "ORGANIZER") {
      await organizerVerificationRepository.create({
        organizer: user._id as any,
        organizationName: data.organizationName!,
        governmentIdType: data.governmentIdType!,
        governmentId: data.governmentId!,
        documentUrl: data.documentUrl!,
        address: data.address!,
        city: data.city!,
        state: data.state!,
        pincode: data.pincode!,
        status: VerificationStatus.PENDING,
      });
    }

    return user;
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
      mustChangePassword: user.mustChangePassword === true,
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
      mustChangePassword: user.mustChangePassword === true,
    });

    return {
      accessToken,
    };
  }
}

export const authService = new AuthService();