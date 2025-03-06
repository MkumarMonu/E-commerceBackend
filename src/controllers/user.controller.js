import { validationResult } from "express-validator";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utills/cloudinary.js";
import crypto from "crypto";
import Otp from "../models/otp.model.js";
import { sendOtpEmail } from "../utills/send-otp-mail.js";
import jwt from "jsonwebtoken";
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
       $or: [{ email }, { username }]
     });
 
     if (existingUser) {
       if (existingUser.email === email) {
         return res.status(400).json({ success: false, message: "Email already exists" });
       }
       if (existingUser.username === username) {
         return res.status(400).json({ success: false, message: "Username already taken" });
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
   // Prepare payload for temporary storage
   const payload = {
     username,
     phone,
     email,
     password, 
     avatar: avatarCloudinaryUrl.secure_url,
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
  return res.status(500).json({success: false, message:"Internal Server Error"})
 }
};

// OTP Verification Endpoint
const verifyOtp = async (req, res) => {
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
        return res.status(400).json({ success: "false", message: "Error in saving the user data" , error: error});
      }
      user.password = null;
     return res.send({
        success: true,
        message: "OTP verified successfully",
        user,
      });

    }
  } catch (error) {
   return  res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export { registerUser, verifyOtp };
