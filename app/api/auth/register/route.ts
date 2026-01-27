import { NextResponse } from "next/server";
import { db } from "@/lib/firebase"; 
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { uid, email, fullName, role, website } = body;

    // 1. Basic Validation
    if (!uid || !email) {
      return NextResponse.json(
        { error: "MISSING REQUIRED FIELDS (UID/EMAIL)" }, 
        { status: 400 }
      );
    }

    // 2. Firestore Write Logic
    // Dito natin ise-save ang user profile
    await setDoc(doc(db, "adminaccount", uid), {
      uid,
      fullName: fullName || "Authorized Manager",
      email: email,
      // Kung walang role na pinasa, 'customer' ang default. 
      // Pero sa register page mo, 'admin' ang ipapasa natin.
      role: role || "customer", 
      website: website || "disruptivesolutionsinc",
      status: "active",
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
    });

    return NextResponse.json({ 
      success: true, 
      message: `Account with role [${role}] initialized successfully.` 
    }, { status: 200 });

  } catch (error: any) {
    console.error("SERVER-SIDE AUTH ERROR:", error);
    return NextResponse.json(
      { error: "DATABASE_CONNECTION_FAILED", details: error.message }, 
      { status: 500 }
    );
  }
}