import { Router } from "express";
import {
  startRegistrationOtp,
  verifyRegistrationOtp,
  startLoginOtp,
  verifyLoginOtp,
} from "../services/auth-otp.service.js";

const router = Router();

router.post("/register/send", async (req, res, next) => {
  try {
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    await startRegistrationOtp(email);

    return res.json({
      success: true,
      message: "OTP sent to your email",
      expiresIn: 60,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/register/verify", async (req, res, next) => {
  try {
    const body = req.body ?? {};

    const email = String(body.email || "")
      .trim()
      .toLowerCase();

    const otp = String(body.otp || "").trim();

    if (!email || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: "Valid email and 6-digit OTP are required",
      });
    }

    const user =
      await verifyRegistrationOtp(email, otp);

    return res.json({
      success: true,
      message: "Email verified successfully",
      data: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login/send", async (req, res, next) => {
  try {
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();

    const password = String(
      req.body.password || "",
    );

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    await startLoginOtp(email, password);

    return res.json({
      success: true,
      message: "OTP sent to your email",
      expiresIn: 60,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login/verify", async (req, res, next) => {
  try {
    const body = req.body ?? {};

    const email = String(body.email || "")
      .trim()
      .toLowerCase();

    const otp = String(body.otp || "").trim();

    if (!email || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: "Valid email and 6-digit OTP are required",
      });
    }

    const result =
      await verifyLoginOtp(email, otp);

    res.cookie(
      "refreshToken",
      result.refreshToken,
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge:
          7 * 24 * 60 * 60 * 1000,
      },
    );

    return res.json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: result.user._id,
          fullName: result.user.fullName,
          email: result.user.email,
          role: result.user.role,
          mustChangePassword:
            result.user.mustChangePassword,
        },
        accessToken: result.accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
});

export const otpRoutes = router;
