import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { from, replyTo, cc, subject, content, recipients } = body;

    // 1. Validation: Siguraduhin na may listahan ng papadalhan
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json({ error: 'Recipients list is empty or invalid' }, { status: 400 });
    }

    // 2. Transporter Configuration (Ang jpablobscs email ang "Driver")
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'jpablobscs@tfvc.edu.ph',
        pass: 'cvdl lggo btbz oill', // App Password
      },
    });

    // Verify connection bago mag-simula ang blast
    try {
      await transporter.verify();
    } catch (err) {
      console.error("Email Engine Error:", err);
      return NextResponse.json({ error: 'Email service authentication failed' }, { status: 500 });
    }

    // 3. Email Dispatching Logic
    const emailPromises = recipients.map(async (recipientEmail: string) => {
      
      // I-personalize ang content bawat email
      // Ginagawa nating HTML format yung newline (\n)
      const personalizedContent = content
        .replace(/{applicant_email}/g, recipientEmail)
        .replace(/\n/g, '<br>');

      const professionalHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Helvetica Neue', Arial, sans-serif; }
            .container { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
            .header { background-color: #b91c1c; padding: 40px 20px; text-align: center; color: white; }
            .body { padding: 40px; color: #1e293b; line-height: 1.8; font-size: 15px; }
            .footer { background-color: #f1f5f9; padding: 25px; text-align: center; font-size: 11px; color: #64748b; }
            .signature { margin-top: 35px; border-top: 2px solid #f1f5f9; padding-top: 20px; font-weight: bold; }
            h1 { margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; text-transform: uppercase; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${from || 'TFVC Notification'}</h1>
            </div>
            <div class="body">
              ${personalizedContent}
              <div class="signature">
                Best regards,<br>
                <span style="color: #b91c1c;">${from || 'The TFVC Team'}</span>
              </div>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Disruptive Solutions Inc. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      return transporter.sendMail({
        // Dito yung trick: "Sender Name" <jpablobscs@tfvc.edu.ph>
        from: `"${from || 'TFVC System'}" <jpablobscs@tfvc.edu.ph>`,
        to: recipientEmail,
        replyTo: replyTo || 'jpablobscs@tfvc.edu.ph',
        cc: cc || undefined,
        subject: subject || 'Application Update',
        html: professionalHtml,
      });
    });

    // 4. Result Gathering
    const results = await Promise.allSettled(emailPromises);
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    // Log failures para sa debugging
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`Blast Error for ${recipients[index]}:`, result.reason);
      }
    });

    return NextResponse.json({ 
      success: true,
      summary: { successful, failed }
    });

  } catch (error: any) {
    console.error("Critical System Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}