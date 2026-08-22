import { UserService } from "../../users/services/user.service.js";

const userService = new UserService();

export const userTools = {

  async getMyProfile(
    _args: any,
    context: any
  ) {
    try {

      const user =
        await userService.getById(
          context.user.id
        );

      if (!user) {
        return {
          success: false,
          message: "User profile not found."
        };
      }

      return {
        success: true,
        data: {
          name: user.fullName,
          email: user.email,
          city: user.city,
          state: user.state,
          interests: user.interests,
          achievements: user.achievements
        },
        message:
          "User profile fetched successfully."
      };

    } catch (error: any) {

      return {
        success: false,
        message:
          error.message ||
          "Unable to fetch profile."
      };

    }
  }

};
