import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { name, email, catalogTitle } = await req.json();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // 1. Email para sa iyo (Admin Notification)
    const adminMailOptions = {
      from: process.env.GMAIL_USER,
      to: "jpablobscs@tfvc.edu.ph", // Dito darating yung email
      subject: `🚨 NEW CATALOG REQUEST: ${catalogTitle}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
          <h2 style="color: #d11a2a;">New Request Received</h2>
          <p><strong>Catalog:</strong> ${catalogTitle}</p>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <hr />
          <p style="font-size: 10px; color: #888;">Disruptive Solutions Admin System</p>
        </div>
      `,
    };

    await transporter.sendMail(adminMailOptions);

    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed" }, { status: 500 });
  }
}