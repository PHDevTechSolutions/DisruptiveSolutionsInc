import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { jobId, jobTitle, name, email, phone, linkedin, message } = body;

        // I-verify kung may laman ang mga required fields
        if (!name || !email || !jobTitle) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        });

        const mailOptions = {
            from: `"Disruptive Careers" <${process.env.GMAIL_USER}>`,
            to: "info@disruptivesolutions.ph", 
            subject: `NEW JOB APPLICATION: ${jobTitle} - ${name}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 12px;">
                    <h2 style="color: #d11a2a; border-bottom: 2px solid #d11a2a; padding-bottom: 10px;">New Job Application</h2>
                    <p style="font-size: 16px;"><strong>Position:</strong> <span style="color: #333;">${jobTitle} (${jobId})</span></p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                    <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; line-height: 1.6;">
                        <p><strong>Applicant Name:</strong> ${name}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Phone:</strong> ${phone}</p>
                        <p><strong>LinkedIn:</strong> ${linkedin || 'Not provided'}</p>
                    </div>
                    <p><strong>Cover Message:</strong></p>
                    <div style="background: #fff; border: 1px solid #eee; padding: 15px; border-radius: 8px; font-style: italic; color: #555;">
                        ${message.replace(/\n/g, '<br/>')}
                    </div>
                    <p style="font-size: 10px; color: #aaa; margin-top: 20px; text-align: center;">Sent from Disruptive Solutions Careers Portal</p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        return NextResponse.json({ message: "Application sent successfully!" }, { status: 200 });
    } catch (error) {
        console.error("Nodemailer Error:", error);
        return NextResponse.json({ message: "Failed to send application" }, { status: 500 });
    }
}