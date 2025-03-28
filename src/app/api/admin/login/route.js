import { NextResponse } from "next/server";
import pool from "@/utils/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key"; // Change this
const ALLOWED_ORIGINS = ["http://localhost:3001"]; // Add allowed frontend origins

export async function OPTIONS() {
  // Handle CORS preflight requests
  const headers = new Headers();
  headers.set("Access-Control-Allow-Origin", ALLOWED_ORIGINS[0]);
  headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  return new NextResponse(null, { status: 204, headers });
}

export async function POST(req) {
  try {
    // Parse JSON body safely
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Fetch user from database
    const [users] = await pool.query("SELECT * FROM admin_users WHERE email = ?", [email]);

    if (!users || users.length === 0) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const admin = users[0];

    // Check password
    const passwordMatch = await bcrypt.compare(password, admin.password_hash);
    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Generate JWT Token
    const token = jwt.sign({ id: admin.id, email: admin.email }, SECRET_KEY, { expiresIn: "7d" });

    // Set CORS headers
    const headers = new Headers();
    headers.set("Access-Control-Allow-Origin", ALLOWED_ORIGINS[0]);
    headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

    return new NextResponse(
      JSON.stringify({ success: true, message: "Login successful", token }),
      { status: 200, headers }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
