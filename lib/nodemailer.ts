// lib/nodemailer.ts
import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const mailOptions = {
  from: `"Disruptive Solutions" <${process.env.EMAIL_USER}>`,
};