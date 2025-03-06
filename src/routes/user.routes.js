import express from "express";
import { registerUser, verifyOtp } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { userValidationRules } from "../validators/user.validator.js";
import { verifyToken } from "../utills/verifyAndGenerateToken.js";

const userRouter = express.Router();

userRouter
  .route("/register")
  .post(upload.single("avatar"), userValidationRules, registerUser);

userRouter.route("/verifyOtp").post(verifyToken, verifyOtp);

export { userRouter };
