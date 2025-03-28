import { NextResponse } from "next/server";
import pool from "@/utils/db";
import { verifyAdmin } from "@/utils/auth";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
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
