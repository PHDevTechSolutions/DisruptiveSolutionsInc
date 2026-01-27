import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { from, replyTo, cc, subject, content, recipients } = body;

    if (!recipients || !Array.isArray(recipients)) {
      return NextResponse.json({ error: 'Recipients must be an array' }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'jpablobscs@tfvc.edu.ph',
        pass: 'cvdl lggo btbz oill', 
      },
    });

    const emailPromises = recipients.map((email: string) => {
      // Dito natin bubuoin ang professional HTML template
      const professionalHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            .email-container {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #334155;
              max-width: 600px;
              margin: 0 auto;
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              overflow: hidden;
            }
            .header {
              background-color: #2563eb;
              padding: 30px;
              text-align: center;
              color: white;
            }
            .content {
              padding: 40px 30px;
              background-color: #ffffff;
            }
            .footer {
              background-color: #f8fafc;
              padding: 20px;
              text-align: center;
              font-size: 12px;
              color: #64748b;
              border-top: 1px solid #e2e8f0;
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #2563eb;
              color: #ffffff !important;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 600;
              margin-top: 20px;
            }
            h1 { margin: 0; font-size: 20px; }
            p { margin-bottom: 16px; }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1>${from || 'TFVC Notification'}</h1>
            </div>
            <div class="content">
              ${content.replace(/\n/g, '<br>')}
              <br><br>
              <p>Best regards,<br><strong>${from}</strong></p>
            </div>
            <div class="footer">
              <p>This is an automated message. Please do not reply directly to this email.</p>
              <p>&copy; ${new Date().getFullYear()} TFVC. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      return transporter.sendMail({
        from: `"${from}" <jpablobscs@tfvc.edu.ph>`,
        to: email,
        replyTo: replyTo || 'jpablobscs@tfvc.edu.ph',
        cc: cc || "",
        subject: subject,
        html: professionalHtml,
      });
    });

    const results = await Promise.allSettled(emailPromises);
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return NextResponse.json({ 
      message: `Process complete.`,
      summary: { successful, failed }
    });

  } catch (error) {
    console.error("Bulk Send Error:", error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}