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

    // 1. Admin Notification Email
    const adminMailOptions = {
      from: process.env.GMAIL_USER,
      to: "jpablobscs@tfvc.edu.ph", 
      subject: `🚨 NEW CATALOG REQUEST: ${catalogTitle}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #d11a2a; text-transform: uppercase;">Admin Notification</h2>
          <p>A new request has been received for the following catalog:</p>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 5px;">
            <p><strong>Catalog:</strong> ${catalogTitle}</p>
            <p><strong>Requester Name:</strong> ${name}</p>
            <p><strong>Requester Email:</strong> ${email}</p>
          </div>
          <p style="font-size: 12px; color: #888; margin-top: 20px;">Disruptive Solutions Inc. | Management System</p>
        </div>
      `,
    };

    // 2. User Confirmation Email
    const userMailOptions = {
      from: process.env.GMAIL_USER,
      to: email, 
      subject: `Request Received: ${catalogTitle} - Disruptive Solutions Inc.`,
      html: `
        <div style="font-family: sans-serif; padding: 30px; color: #333; line-height: 1.6;">
          <h1 style="color: #d11a2a; font-style: italic; margin-bottom: 5px;">DISRUPTIVE <span style="color: #000;">SOLUTIONS INC.</span></h1>
          <p style="font-size: 10px; color: #999; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 30px;">Technical Archive System</p>
          
          <p>Dear <strong>${name}</strong>,</p>
          <p>Thank you for your interest in our technical archives. This email confirms that we have received your request for access to:</p>
          
          <div style="padding: 20px; border-left: 4px solid #d11a2a; background: #f4f4f4; margin: 25px 0;">
             <h3 style="margin: 0; text-transform: uppercase;">${catalogTitle}</h3>
          </div>

          <p>Our engineering team has been notified. If you were unable to complete your download during your session, please keep this email as a record of your request.</p>
          
          <p>Should you have any further technical inquiries, please do not hesitate to contact our support department.</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 40px 0;" />
          <p style="font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 1.5px;">
            Precision. Innovation. Disruption. <br />
            © 2026 Disruptive Solutions Inc. All Rights Reserved.
          </p>
        </div>
      `,
    };

    // Send both emails simultaneously
    await Promise.all([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(userMailOptions)
    ]);

    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (error) {
    console.error("Nodemailer Error:", error);
    return NextResponse.json({ message: "Failed" }, { status: 500 });
  }
}