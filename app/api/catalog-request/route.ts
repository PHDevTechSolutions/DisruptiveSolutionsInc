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
      to: "jpablobscs@tfvc.edu.ph", 
      subject: `🚨 NEW CATALOG REQUEST: ${catalogTitle}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #d11a2a; text-transform: uppercase;">Admin Notification</h2>
          <p>Isang bagong request ang natanggap para sa catalog:</p>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 5px;">
            <p><strong>Catalog:</strong> ${catalogTitle}</p>
            <p><strong>Requester Name:</strong> ${name}</p>
            <p><strong>Requester Email:</strong> ${email}</p>
          </div>
          <p style="font-size: 12px; color: #888; margin-top: 20px;">Disruptive Solutions Inc. | Admin System</p>
        </div>
      `,
    };

    // 2. Email para sa USER (Confirmation Receipt)
    const userMailOptions = {
      from: process.env.GMAIL_USER,
      to: email, // Ipapadala sa email na nilagay ng user sa form
      subject: `Request Received: ${catalogTitle} - Disruptive Solutions Inc.`,
      html: `
        <div style="font-family: sans-serif; padding: 30px; color: #333;">
          <h1 style="color: #d11a2a; font-style: italic;">DISRUPTIVE <span style="color: #000;">SOLUTIONS INC.</span></h1>
          <p>Hi <strong>${name}</strong>,</p>
          <p>Thank you for your interest in our technical archives. This email confirms that we have received your request for access to:</p>
          
          <div style="padding: 20px; border-left: 4px solid #d11a2a; background: #f4f4f4; margin: 20px 0;">
             <h3 style="margin: 0;">${catalogTitle}</h3>
          </div>

          <p>Our engineering team will review your request. If you haven't downloaded the file yet from our website, please keep this email as a reference.</p>
          
          <p>If you have any questions, feel free to reach out to us at any time.</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="font-size: 11px; color: #999; text-transform: uppercase; tracking-spacing: 2px;">
            Precision. Innovation. Disruption. <br />
            © 2026 Disruptive Solutions Inc.
          </p>
        </div>
      `,
    };

    // Sabay nating i-send ang dalawang email
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