import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Eto yung fields na galing sa Contact Form mo
    const { fullName, email, phone, message } = body;
    const inquiryId = Math.random().toString(36).substring(7).toUpperCase(); // Random ID para sa reference

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // --- 1. EMAIL PARA SA ADMIN (Ikaw) ---
    const adminMailOptions = {
      from: `"Disruptive Website" <${process.env.EMAIL_USER}>`,
      to: "admin@disruptivesolutionsinc.com", // Palitan mo ng actual admin email niyo
      subject: `NEW CONTACT INQUIRY: ${fullName} (#${inquiryId})`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px;">
          <h2 style="color: #d11a2a; border-bottom: 2px solid #d11a2a; padding-bottom: 10px; font-style: italic; text-transform: uppercase;">New General Inquiry</h2>
          <div style="margin-bottom: 20px; background: #f9f9f9; padding: 15px; border-radius: 10px;">
            <p><strong>Full Name:</strong> ${fullName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || "N/A"}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <div style="padding: 15px; border: 1px solid #eee; border-radius: 10px;">
            <h4 style="margin-top: 0; color: #d11a2a; text-transform: uppercase; font-size: 12px;">Message / Project Brief:</h4>
            <p style="color: #333; line-height: 1.6; white-space: pre-wrap;">${message}</p>
          </div>
          <p style="margin-top: 20px; font-size: 10px; color: #bbb; text-align: center;">Inquiry Reference ID: ${inquiryId}</p>
        </div>
      `,
    };

    // --- 2. EMAIL PARA SA CUSTOMER (Auto-Reply) ---
    const customerMailOptions = {
      from: `"Disruptive Solutions" <${process.env.EMAIL_USER}>`,
      to: email, 
      subject: `We've received your message: #${inquiryId}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 30px; text-align: center;">
          <h1 style="color: #d11a2a; font-style: italic;">MESSAGE RECEIVED!</h1>
          <p style="color: #333; font-size: 16px;">Hi ${fullName.split(' ')[0]},</p>
          <p style="color: #666; line-height: 1.6;">Thank you for reaching out to Disruptive Solutions. We have received your inquiry regarding a lighting project/solution. Our specialists will review your details and get back to you within 24-48 hours.</p>
          <div style="margin: 30px 0; padding: 20px; border: 1px dashed #d11a2a; border-radius: 10px; background: #fff5f5;">
            <p style="margin: 0; font-weight: bold; color: #d11a2a;">REFERENCE ID: ${inquiryId}</p>
          </div>
          <p style="font-size: 12px; color: #999;">This is an automated response. No need to reply to this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;"/>
          <p style="font-weight: bold; font-size: 10px; letter-spacing: 2px; color: #000;">DISRUPTIVE SOLUTIONS INC.</p>
        </div>
      `,
    };

    // Sabay na ipadala para mabilis
    await Promise.all([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(customerMailOptions)
    ]);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Contact API Error:", error);
    return NextResponse.json({ error: "Failed to send inquiry" }, { status: 500 });
  }
}