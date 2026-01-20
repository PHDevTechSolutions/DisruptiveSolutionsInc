// app/api/quote/route.ts
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { firstName, lastName, email, contactNumber, streetAddress, company, message, attachmentUrl } = body;
        const inquiryId = Math.random().toString(36).substring(7).toUpperCase();

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        });

        // 1. Email para sa Admin (Ikaw)
        const adminMailOptions = {
            from: `"Disruptive Quote System" <${process.env.GMAIL_USER}>`,
            to: "jpablobscs@tfvc.edu.ph",
            subject: `🚨 NEW QUOTE REQUEST: ${firstName} ${lastName} (#${inquiryId})`,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; border: 1px solid #eee; padding: 20px;">
                    <h2 style="color: #d11a2a; text-transform: uppercase;">New Quotation Inquiry</h2>
                    <hr />
                    <p><strong>Customer Name:</strong> ${firstName} ${lastName}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Phone:</strong> ${contactNumber}</p>
                    <p><strong>Address:</strong> ${streetAddress}</p>
                    <p><strong>Company:</strong> ${company || "N/A"}</p>
                    <p><strong>Message:</strong></p>
                    <div style="background: #f9f9f9; padding: 15px; border-radius: 5px;">${message}</div>
                    ${attachmentUrl ? `<p><strong>Attachment:</strong> <a href="${attachmentUrl}" style="color: #d11a2a; font-weight: bold;">View Uploaded File</a></p>` : ""}
                    <hr />
                    <p style="font-size: 11px; color: #999;">Reference ID: ${inquiryId} | Sent from Disruptive Solutions Quote System</p>
                </div>
            `,
        };

        // 2. Email para sa Customer (Auto-Reply)
        const customerMailOptions = {
            from: `"Disruptive Solutions" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: `We've received your quote request: #${inquiryId}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 30px; text-align: center;">
                    <h1 style="color: #d11a2a; font-style: italic;">REQUEST RECEIVED!</h1>
                    <p style="color: #333; font-size: 16px;">Hi ${firstName},</p>
                    <p style="color: #666; line-height: 1.6;">Thank you for requesting a custom quote from Disruptive Solutions. Our specialists will review your project requirements and get back to you within 24-48 hours.</p>
                    <div style="margin: 30px 0; padding: 20px; border: 1px dashed #d11a2a; border-radius: 10px; background: #fff5f5;">
                        <p style="margin: 0; font-weight: bold; color: #d11a2a;">REFERENCE ID: ${inquiryId}</p>
                    </div>
                    <p style="font-size: 12px; color: #999;">This is an automated response. No need to reply to this email.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;"/>
                    <p style="font-weight: bold; font-size: 10px; letter-spacing: 2px; color: #000;">DISRUPTIVE SOLUTIONS INC.</p>
                </div>
            `,
        };

        // Sabay na ipadala para mabilis ang loading sa front-end
        await Promise.all([
            transporter.sendMail(adminMailOptions),
            transporter.sendMail(customerMailOptions)
        ]);

        return NextResponse.json({ message: "Emails Sent Successfully", id: inquiryId }, { status: 200 });
    } catch (error) {
        console.error("Mail Error:", error);
        return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }
}