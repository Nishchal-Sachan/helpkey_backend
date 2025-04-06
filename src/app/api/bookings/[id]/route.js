import { NextResponse } from "next/server";
import pool from "@/utils/db";
import { verifyAdmin } from "@/utils/auth";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://helpkey-frontend.vercel.app",
  "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Credentials": "true",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(req, { params }) {
  try {
    const id = req.nextUrl.pathname.split("/").pop();
    if (!id) {
      return NextResponse.json({ success: false, error: "Booking ID is required" }, { status: 400, headers: corsHeaders });
    }

    const [rows] = await pool.query("SELECT * FROM bookings WHERE id = ?", [id]);

    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404, headers: corsHeaders });
    }

    return NextResponse.json({ success: true, data: rows[0] }, { headers: corsHeaders });
  } catch (error) {
    console.error("GET /bookings/[id] Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500, headers: corsHeaders });
  }
}

export async function PUT(req, { params }) {
  try {
    const { adminId, success } = await verifyAdmin(req);
    if (!success) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403, headers: corsHeaders });
    }

    const id = req.nextUrl.pathname.split("/").pop();
    const { guest_name, check_in, check_out, status } = await req.json();

    const [bookingRows] = await pool.query(
      `SELECT b.id, l.admin_id
       FROM bookings b
       JOIN listings l ON b.hotel_id = l.id
       WHERE b.id = ?`,
      [id]
    );

    if (bookingRows.length === 0 || bookingRows[0].admin_id !== adminId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403, headers: corsHeaders });
    }

    const [result] = await pool.query(
      `UPDATE bookings SET 
        guest_name = COALESCE(?, guest_name), 
        check_in = COALESCE(?, check_in), 
        check_out = COALESCE(?, check_out),
        status = COALESCE(?, status)
      WHERE id = ?`,
      [guest_name, check_in, check_out, status, id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, error: "No changes made" }, { status: 404, headers: corsHeaders });
    }

    return NextResponse.json({ success: true, message: "Booking updated successfully" }, { headers: corsHeaders });
  } catch (error) {
    console.error("PUT /bookings/[id] Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500, headers: corsHeaders });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { adminId, success } = await verifyAdmin(req);
    if (!success) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403, headers: corsHeaders });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ success: false, error: "Booking ID is required" }, { status: 400, headers: corsHeaders });
    }

    const [bookingRows] = await pool.query(
      `SELECT b.id, l.admin_id
       FROM bookings b
       JOIN listings l ON b.hotel_id = l.id
       WHERE b.id = ?`,
      [id]
    );

    if (bookingRows.length === 0 || bookingRows[0].admin_id !== adminId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403, headers: corsHeaders });
    }

    const [result] = await pool.query("DELETE FROM bookings WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404, headers: corsHeaders });
    }

    return NextResponse.json({ success: true, message: "Booking deleted successfully" }, { headers: corsHeaders });
  } catch (error) {
    console.error("DELETE /bookings/[id] Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500, headers: corsHeaders });
  }
}
