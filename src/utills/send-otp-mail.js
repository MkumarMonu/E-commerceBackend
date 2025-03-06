import nodemailer from 'nodemailer';


const sendOtpEmail = async (email,otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host:"smtp.gmail.com",
      service: 'Gmail',
      // secure:true,
      port:465,
      auth: {
        user: "monucs154@gmail.com",
        pass: process.env.GMAIL_PASS_KEY
      },
      tls: {
       rejectUnauthorized: false, 
     },
    });

  //  const otp = generateOtp();
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is ${otp}`
    };
    await transporter.sendMail(mailOptions);
    console.log('OTP email  sent successfully');
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Could not send OTP email');
  }
};

export {sendOtpEmail};
