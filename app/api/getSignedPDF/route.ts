import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

export async function GET(req: NextRequest) {
  const fileName = req.nextUrl.searchParams.get("fileName");
  if (!fileName) return NextResponse.json({ error: "Missing fileName" }, { status: 400 });

  try {
    const url = cloudinary.url(fileName, {
      resource_type: "raw",    // PDFs
      type: "authenticated",   // signed URL
      attachment: true,
      sign_url: true,
    });

    return NextResponse.json({ url });
  } catch (err) {
    return NextResponse.json({ error: "Failed to generate signed URL" }, { status: 500 });
  }
}
