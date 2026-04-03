import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";

export const sendOTPEmail = async (email, otp) => {

  if (!process.env.EMAIL || !process.env.PASSWORD) {
    console.log("❌ ENV NOT FOUND", process.env.EMAIL, process.env.PASSWORD);
    throw new Error("Email credentials missing");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD
    }
  });

  await transporter.sendMail({
    from: `"Freshly OTP" <${process.env.EMAIL}>`,
    to: email,
    subject: "Your OTP Code",
    html: `<h2>Your OTP: ${otp}</h2><p>Valid for 5 minutes</p>`
  });

  console.log("✅ OTP sent to email:", email);
};