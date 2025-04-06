import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "@/utils/db";

// CORS headers
const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "https://helpkey-frontend.vercel.app/",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// POST: Handle login
export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return new Response(JSON.stringify({ success: false, error: "Missing required fields" }), {
        status: 400,
        headers,
      });
    }

    // Check if admin exists
    const [adminUser] = await pool.query("SELECT * FROM admin_users WHERE email = ?", [email]);

    if (adminUser.length === 0) {
      return new Response(JSON.stringify({ success: false, error: "Invalid credentials" }), {
        status: 401,
        headers,
      });
    }

    const admin = adminUser[0];

    // Verify password
    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      return new Response(JSON.stringify({ success: false, error: "Invalid credentials" }), {
        status: 401,
        headers,
      });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET || "your_secret_key",
      { expiresIn: "1d" }
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: "Login successful",
        token,
        admin: {
          id: admin.id,
          email: admin.email,
          name: `${admin.first_name} ${admin.last_name}`,
          role: admin.role,
        },
      }),
      {
        status: 200,
        headers,
      }
    );
  } catch (error) {
    console.error("Login Error:", error);
    return new Response(JSON.stringify({ success: false, error: "Internal Server Error" }), {
      status: 500,
      headers,
    });
  }
}

// OPTIONS: Handle preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers,
  });
}
