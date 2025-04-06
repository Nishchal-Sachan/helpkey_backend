import { NextResponse } from "next/server";
import pool from "@/utils/db";
import { verifyAdmin } from "@/utils/auth";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://helpkey-frontend.vercel.app/",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",  // Add POST here
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};


export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET() {
  try {
    const [rows] = await pool.query("SELECT * FROM bookings ORDER BY created_at DESC");

    return NextResponse.json({ success: true, data: rows }, { headers: corsHeaders });
  } catch (error) {
    console.error("GET /bookings Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500, headers: corsHeaders });
  }
}
export async function POST(req) {
  try {
    const body = await req.json();

    const { hotel_id, guest_name, check_in, check_out } = body;

    if (!hotel_id || !guest_name || !check_in || !check_out) {
      return NextResponse.json(
        { success: false, error: "All fields are required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const query = `INSERT INTO bookings (hotel_id, guest_name, check_in, check_out) VALUES (?, ?, ?, ?)`;
    const [result] = await pool.query(query, [hotel_id, guest_name, check_in, check_out]);

    return NextResponse.json(
      { success: true, bookingId: result.insertId, message: "Booking created successfully" },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("POST /bookings Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500, headers: corsHeaders }
    );
  }
}