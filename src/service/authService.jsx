import Otp from "../models/otp.model";

const generate_Otp_AndFind_And_UpdateInDb = async (email) => {
  const otp = generateOTP();
  const otpExpires = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes
  
  return await Otp.findOneAndUpdate(
    { email },
    { email, otp, otpExpires },
    { upsert: true, new: true }
  );
};

export { generate_Otp_AndFind_And_UpdateInDb };
