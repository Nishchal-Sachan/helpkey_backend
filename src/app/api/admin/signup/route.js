import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "@/utils/db";

export async function POST(req) {
  const origin = req.headers.get("Origin");
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "https://helpkey-frontend.vercel.app/",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Credentials": "true",
  };

  try {
    const body = await req.json();
    const { first_name, last_name, email, phone_number, password, role } = body;

    if (!first_name || !last_name || !email || !password || !phone_number) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
        { status: 400, headers }
      );
    }

    const [existingUsers] = await pool.query(
      "SELECT id, email, phone_number FROM admin_users WHERE email = ? OR phone_number = ?",
      [email, phone_number]
    );

    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0];
      const duplicateField =
        existingUser.email === email ? "Email" : "Phone number";
      return new Response(
        JSON.stringify({
          success: false,
          error: `${duplicateField} already in use`,
        }),
        { status: 400, headers }
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await pool.query(
      "INSERT INTO admin_users (first_name, last_name, email, phone_number, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)",
      [first_name, last_name, email, phone_number, hashedPassword, role || "admin"]
    );

    const newUserId = result.insertId;

    const token = jwt.sign(
      { id: newUserId, email, role: role || "admin" },
      process.env.JWT_SECRET || "your_secret_key",
      { expiresIn: "1d" }
    );

    return new Response(
      JSON.stringify({ success: true, message: "Signup successful" }),
      {
        status: 201,
        headers: {
          "Set-Cookie": `token=${token}; HttpOnly; Path=/; Secure; SameSite=None; Max-Age=86400`,
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": origin || "*",
          "Access-Control-Allow-Credentials": "true",
        },
      }
    );
  } catch (error) {
    console.error("Signup Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal Server Error" }),
      { status: 500, headers }
    );
  }
}

export async function OPTIONS(req) {
  const origin = req.headers.get("Origin");
  const headers = {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Credentials": "true",
  };
  return new Response(null, { status: 204, headers });
}
