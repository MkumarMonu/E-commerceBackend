import express from "express";
import {
  forgotPassword,
  loginUser,
  registerUser,
  resetPassword,
  verifyOtp,
  verifySignUpOtp,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { userValidationRules } from "../validators/user.validator.js";
import { verifyToken } from "../utills/verifyAndGenerateToken.js";

const userRouter = express.Router();

userRouter
  .route("/register")
  .post(upload.single("avatar"), userValidationRules, registerUser);

userRouter.route("/verifySignUpOtp").post(verifyToken, verifySignUpOtp);
userRouter.route("/login").post(loginUser);
userRouter.route("/verifyOtp").post(verifyOtp);

userRouter.route("/forgotPassword").post(forgotPassword);
userRouter.route("/resetPassword").post(resetPassword);

export { userRouter };
