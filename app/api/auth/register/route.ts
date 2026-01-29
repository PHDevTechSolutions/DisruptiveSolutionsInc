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

    // 2. Role Determination Logic
    // Dito natin nillimitahan kung ano lang ang pwedeng roles.
    const validRoles = ["admin", "sales"];
    const assignedRole = validRoles.includes(role?.toLowerCase()) ? role.toLowerCase() : "customer";

    // 3. Firestore Write Logic
    await setDoc(doc(db, "adminaccount", uid), {
      uid,
      fullName: fullName || (assignedRole === "sales" ? "Guest Sales User" : "Authorized Manager"),
      email: email,
      role: assignedRole, 
      website: website || "disruptivesolutionsinc",
      // Pwede nating lagyan ng specific flag kung "guest" level lang siya
      accessLevel: assignedRole === "sales" ? "guest" : "full",
      status: "active",
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
    });

    return NextResponse.json({ 
      success: true, 
      message: `Account with role [${assignedRole}] initialized successfully.` 
    }, { status: 200 });

  } catch (error: any) {
    console.error("SERVER-SIDE AUTH ERROR:", error);
    return NextResponse.json(
      { error: "DATABASE_CONNECTION_FAILED", details: error.message }, 
      { status: 500 }
    );
  }
}