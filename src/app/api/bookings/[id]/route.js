import { NextResponse } from "next/server";
import pool from "@/utils/db";
import { verifyAdmin } from "@/utils/auth";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function PUT(req, context) {
  try {
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403, headers: corsHeaders }
      );
    }

    // Extract params correctly
    const { id } = context.params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Booking ID is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const body = await req.json();
    const { status } = body;

    if (!["Accepted", "Rejected"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status" },
        { status: 400, headers: corsHeaders }
      );
    }

    const [result] = await pool.query(
      "UPDATE bookings SET status = ? WHERE id = ?",
      [status, id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, error: "Booking not found or no changes made" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, message: "Booking status updated successfully" },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("PUT /bookings/[id] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
