import { User } from "../../users/models/user.model.js";
import type { IUser } from "../../users/models/user.model.js";

export class AuthRepository {
  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email });
  }

  async findById(id: string | any): Promise<IUser | null> {
    return User.findById(id);
  }

  async create(userData: Partial<IUser>): Promise<IUser> {
    return User.create(userData);
  }
}

export const authRepository = new AuthRepository();