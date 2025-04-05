import bcrypt from "bcryptjs";
import pool from "@/utils/db";  

export async function POST(req) {
  try {
    const body = await req.json();
    const { first_name, last_name, email, phone_number, password, role } = body;

    if (!first_name || !last_name || !email || !password) {
      return new Response(JSON.stringify({ success: false, error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if email already exists
    const [existingUser] = await pool.query("SELECT id FROM admin_users WHERE email = ?", [email]);
    if (existingUser.length > 0) {
      return new Response(JSON.stringify({ success: false, error: "Email already in use" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert new admin user
    await pool.query(
      "INSERT INTO admin_users (first_name, last_name, email, phone_number, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)",
      [first_name, last_name, email, phone_number, hashedPassword, role || "admin"]
    );

    return new Response(JSON.stringify({ success: true, message: "Admin registered successfully" }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ success: false, error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
