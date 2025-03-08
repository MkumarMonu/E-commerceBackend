import { validationResult } from "express-validator";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utills/cloudinary.js";
import crypto from "crypto";
import Otp from "../models/otp.model.js";
import { sendOtpEmail } from "../utills/send-otp-mail.js";
import jwt from "jsonwebtoken";
import { uploader } from "cloudinary";
// Generate OTP Function
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString(); // 6-digit OTP
};

const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ success: false, message: errors.array()[0].msg });
  }

  try {
    const { username, phone, email, password } = req.body;
    if (
      [username, phone, email, password].some((fields) => fields?.item === "")
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Please fill all fields" });
    }

    // ✅ Check if username or email already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res
          .status(400)
          .json({ success: false, message: "Email already exists" });
      }
      if (existingUser.username === username) {
        return res
          .status(400)
          .json({ success: false, message: "Username already taken" });
      }
    }
    const otp = generateOTP();
    const otpExpires = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

    await Otp.findOneAndUpdate(
      { email },
      { email, otp, otpExpires },
      { upsert: true, new: true }
    );

    // Send OTP to the user's email
    try {
      await sendOtpEmail(email, otp);
    } catch (error) {
      return res
        .status(500)
        .json({ success: "false", message: "Failed to send OTP", error });
    }
    // console.log(req.file, "received");
    const avatarLocalPath = req.file?.path;
    if (!avatarLocalPath)
      return res
        .status(404)
        .json({ success: false, message: " Avatar not found" });
    const avatarCloudinaryUrl = await uploadOnCloudinary(avatarLocalPath);
    if (!avatarCloudinaryUrl) {
      return res.status(500).json({
        success: false,
        message: "Failed to upload avatar to cloudinary",
      });
    }
    const avatarUrl = avatarCloudinaryUrl?.secure_url;
    // Prepare payload for temporary storage
    const payload = {
      username,
      phone,
      email,
      password,
      avatar: avatarUrl,
      otp,
    };

    const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "10m",
    });

    return res.status(200).json({
      success: true,
      message: "Otp sent to your email",
      user: token,
    });
  } catch (error) {
    const avatarPublicId = avatarUrl
      .split("/")
      .slice(-3)
      .join("/")
      .split(".")[0];
    if (avatarPublicId) {
      try {
        console.log("result: " + (await uploader.destroy(avatarPublicId)));
      } catch (error) {
        console.error("Error deleting Cloudinary image:", error);
      }
    }
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

// OTP Verification Endpoint
const verifySignUpOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    let userData = req.user;
    const email = userData.email;
    const otpData = await Otp.findOne({ email });
    if (!otpData) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }
    // Check if OTP has expired
    if (otpData.otpExpires < Date.now()) {
      return res.status(400).json({
        success: "false",
        message: "OTP has expired. Please request a new one.",
      });
    }
    // Check if OTP matches
    if (otpData.otp !== otp) {
      return res.status(400).json({ success: "false", message: "Invalid OTP" });
    } else {
      const user = new User({
        username: userData.username,
        phone: userData.phone,
        email,
        password: userData.password,
        avatar: userData.avatar,
      });
      try {
        await user.save();
      } catch (error) {
        return res.status(400).json({
          success: "false",
          message: "Error in saving the user data",
          error: error,
        });
      }
      user.password = undefined;
      return res.send({
        success: true,
        message: "OTP verified successfully",
        user,
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide username/email and password",
      });
    }

    // ✅ Find user by username OR email
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    // ✅ Compare provided password with hashed password
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    // ✅ Generate OTP
    const otp = generateOTP(); // 6-digit OTP
    const otpExpires = Date.now() + 10 * 60 * 1000; // Expires in 10 minutes

    // ✅ Save OTP in the database (overwrite if existing)
    await Otp.findOneAndUpdate(
      { email: user.email },
      { email: user.email, otp, otpExpires },
      { upsert: true, new: true }
    );

    // ✅ Send OTP to the user's email
    await sendOtpEmail(user.email, otp);

    return res.status(200).json({
      success: true,
      message: "OTP sent to your email. Please verify to proceed.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const verifyLoginOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Email and OTP are required" });
    }

    // ✅ Find the OTP record
    const otpData = await Otp.findOne({ email });

    if (!otpData) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid OTP or expired" });
    }

    // ✅ Check if OTP has expired
    if (otpData.otpExpires < Date.now()) {
      await Otp.deleteOne({ email }); // Delete expired OTP
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

    // ✅ Check if OTP matches
    if (otpData.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    // ✅ Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    // ✅ Generate JWT Token for Authentication
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "7d" } // Token valid for 7 days
    );

    // ✅ Store JWT in httpOnly cookie
    res.cookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Send only over HTTPS in production
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // ✅ Delete OTP after successful verification
    // await Otp.deleteOne({ email });

    return res.status(200).json({
      success: true,
      message: "You have login successfully!",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error", error });
  }
};

const logoutUser = async (req, res) => {
  try {
    // ✅ Clear the JWT cookie
    res.clearCookie("authToken");
    return res
      .status(200)
      .json({ success: true, message: "Logged out successfully!" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error", error });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    // ✅ Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    // ✅ Generate OTP
    const otp = generateOTP(); // Generate 6-digit OTP
    const otpExpires = Date.now() + 10 * 60 * 1000; // Expires in 10 minutes

    // ✅ Save OTP in the database (overwrite if existing)
    await Otp.findOneAndUpdate(
      { email },
      { email, otp, otpExpires },
      { upsert: true, new: true }
    );

    // ✅ Send OTP to the user's email
    await sendOtpEmail(email, otp);

    return res.status(200).json({
      success: true,
      message: "OTP sent to your email. Use it to reset your password.",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error", error });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;
    if (!email ||!newPassword ||!confirmPassword) {
      return res
       .status(400)
       .json({ success: false, message: "All fields are required" });
    }
    if (newPassword!== confirmPassword) {
      return res
       .status(400)
       .json({ success: false, message: "Passwords do not match" });
    }
    // ✅ Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res
       .status(400)
       .json({ success: false, message: "User not found" });
    }
    user.password = newPassword;
    await user.save();
    return res.status(200).json({ success: true, message: "Password reset successfully!" });
  } catch (error) {
    return res
     .status(500)
     .json({ success: false, message: "Internal Server Error", error });
  
}}

export { registerUser, verifySignUpOtp, loginUser, verifyLoginOtp, forgotPassword, resetPassword}
