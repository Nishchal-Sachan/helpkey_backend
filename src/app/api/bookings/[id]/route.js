import { NextResponse } from "next/server";
import pool from "@/utils/db";
import { verifyAdmin } from "@/utils/auth";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://helpkey-frontend.vercel.app",
  "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Handle CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// Get a specific booking
export async function GET(req, { params }) {
  try {
    const id = req.nextUrl.pathname.split("/").pop();
;
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

// Update a booking — only by the respective admin
export async function PUT(req, { params }) {
  try {
    const { adminId } = await verifyAdmin(req); // Throws if invalid
    const id = req.nextUrl.pathname.split("/").pop();

    // console.log("Incoming PUT to update booking...");
    // console.log("Booking ID:", id);
    // console.log("Admin ID from token:", adminId);
    // console.log("Checking ownership for hotel_id of booking...");
    if (!id) {
      return NextResponse.json({ success: false, error: "Booking ID is required" }, { status: 400, headers: corsHeaders });
    }

    const { guest_name, check_in, check_out, status } = await req.json();

    // Optional: Check if this booking belongs to a hotel listed by the same admin
    const [bookingRows] = await pool.query(`
      SELECT b.id, l.admin_id
      FROM bookings b
      JOIN listings l ON b.hotel_id = l.id
      WHERE b.id = ?
    `, [id]);
    
    // console.log("Booking ownership row:", bookingRows);
    

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
    const status = error.status || 500;
    return NextResponse.json({ success: false, error: error.message || "Internal Server Error" }, { status, headers: corsHeaders });
  }
}

// Delete a booking — only by the respective admin
export async function DELETE(req, { params }) {
  try {
    const { adminId } = await verifyAdmin(req); // Throws if invalid
    const { id } = params || {};
    if (!id) {
      return NextResponse.json({ success: false, error: "Booking ID is required" }, { status: 400, headers: corsHeaders });
    }

    // Ensure the admin owns the listing this booking is associated with
    const [bookingRows] = await pool.query(`
      SELECT b.id, l.admin_id
      FROM bookings b
      JOIN listings l ON b.hotel_id = l.id
      WHERE b.id = ?
    `, [id]);

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
    const status = error.status || 500;
    return NextResponse.json({ success: false, error: error.message || "Internal Server Error" }, { status, headers: corsHeaders });
  }
}
