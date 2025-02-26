import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utills/cloudinary.js";
const registerUser = async (req, res) => {
  // get user details from frontend
  // validation - not empty
  // check if user already exists: username, email
  // check for images, check for avatar
  // upload them to cloudinary, avatar
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return res
  const { username, phone, email, password } = req.body;
  // if (
  //   [username, phone, email, password].some((fields) => fields?.item === "")
  // ) {
  //   return res.status(400).json({ error: "Please fill all fields" });
  // }

  // const existedUser = await User.findOne({ email });
  // if (existedUser) {
  //   return res.status(400).json({ error: "Email already exists" });
  // }
  // console.log(req.file, "received");
  // const avatarLocalPath = req.file?.path;
  // if (!avatarLocalPath)
  //   return res
  //     .status(404)
  //     .json({ success: false, message: " Avatar not found" });
  // const avatarCloudinaryUrl = await uploadOnCloudinary(avatarLocalPath);
  // if (!avatarCloudinaryUrl){
  //   return res
  //    .status(500)
  //    .json({ success: false, message: "Failed to upload avatar to cloudinary" });
  // }
  // console.log(avatarCloudinaryUrl, "upload successful");
  // return res.status(200).json({ success: true, message: "okku!" });
};

export { registerUser };
