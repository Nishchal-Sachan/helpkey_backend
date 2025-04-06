import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "@/utils/db";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://helpkey-frontend.vercel.app",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Credentials": "true",
};

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return new Response(JSON.stringify({ success: false, error: "Missing required fields" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const [adminUser] = await pool.query("SELECT * FROM admin_users WHERE email = ?", [email]);
    if (adminUser.length === 0) {
      return new Response(JSON.stringify({ success: false, error: "Invalid credentials" }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    const admin = adminUser[0];
    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      return new Response(JSON.stringify({ success: false, error: "Invalid credentials" }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET || "your_secret_key",
      { expiresIn: "1d" }
    );

    return new Response(JSON.stringify({ success: true, message: "Login successful" }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Set-Cookie": `token=${token}; HttpOnly; Path=/; Secure; SameSite=None; Max-Age=86400`,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return new Response(JSON.stringify({ success: false, error: "Internal Server Error" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}
