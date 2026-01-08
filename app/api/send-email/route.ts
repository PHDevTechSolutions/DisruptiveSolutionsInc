import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customerDetails, items, inquiryId } = body;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const itemsHtml = items.map((item: any) => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 12px;">
          <img src="${item.image}" width="50" height="50" style="vertical-align: middle; margin-right: 15px; border-radius: 8px; object-fit: contain; background: #f9f9f9;"/>
          <div style="display: inline-block; vertical-align: middle;">
            <strong style="font-size: 14px; color: #333;">${item.name}</strong><br/>
            <small style="color: #999; font-size: 11px;">SKU: ${item.sku}</small>
          </div>
        </td>
        <td style="padding: 12px; text-align: center; font-weight: bold; color: #d11a2a;">x${item.quantity}</td>
      </tr>
    `).join("");

    const mailOptions = {
      from: `"Disruptive Website" <${process.env.EMAIL_USER}>`,
      to: "admin@disruptivesolutions.com", // PALITAN MO ITO NG EMAIL MO
      subject: `NEW INQUIRY: ${customerDetails.firstName} ${customerDetails.lastName} (#${inquiryId?.slice(-5)})`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px;">
          <h2 style="color: #d11a2a; border-bottom: 2px solid #d11a2a; padding-bottom: 10px; font-style: italic; text-transform: uppercase;">New Product Request</h2>
          <div style="margin-bottom: 20px; background: #f9f9f9; padding: 15px; border-radius: 10px;">
            <p><strong>Customer:</strong> ${customerDetails.firstName} ${customerDetails.lastName}</p>
            <p><strong>Email:</strong> ${customerDetails.email}</p>
            <p><strong>Phone:</strong> ${customerDetails.phone || "N/A"}</p>
            <p><strong>Address:</strong> ${customerDetails.streetAddress}, ${customerDetails.apartment || ""}</p>
            <p><strong>Notes:</strong> ${customerDetails.orderNotes || "None"}</p>
          </div>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #000; color: #fff; font-size: 10px; text-transform: uppercase;">
                <th style="text-align: left; padding: 10px;">Product Selection</th>
                <th style="padding: 10px;">Qty</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <p style="margin-top: 20px; font-size: 10px; color: #bbb; text-align: center;">Reference ID: ${inquiryId}</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Email Error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}