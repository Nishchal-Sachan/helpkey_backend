import { NextResponse } from "next/server";
import pool from "@/utils/db";
import jwt from "jsonwebtoken";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://helpkey-frontend.vercel.app",
  "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// GET remains the same — no token check needed
export async function GET(req, { params }) {
  try {
    const { id } = params || {};
    if (!id) {
      return NextResponse.json({ success: false, error: "ID is required" }, { status: 400, headers: corsHeaders });
    }

    const [rows] = await pool.query("SELECT * FROM listings WHERE id = ?", [id]);
    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: "Listing not found" }, { status: 404, headers: corsHeaders });
    }

    const listing = rows[0];
    try {
      listing.amenities = JSON.parse(listing.amenities);
    } catch {
      listing.amenities = [];
    }

    return NextResponse.json({ success: true, data: listing }, { headers: corsHeaders });
  } catch (error) {
    console.error("GET /listings/[id] Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500, headers: corsHeaders });
  }
}

// 🔐 Secure PUT
export async function PUT(req, { params }) {
  try {
    const { id } = params || {};
    if (!id) {
      return NextResponse.json({ success: false, error: "ID is required" }, { status: 400, headers: corsHeaders });
    }

    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401, headers: corsHeaders });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_secret_key");
    const adminId = decoded.id;

    // Check if the listing belongs to this admin
    const [check] = await pool.query("SELECT * FROM listings WHERE id = ? AND admin_id = ?", [id, adminId]);
    if (check.length === 0) {
      return NextResponse.json({ success: false, error: "Not authorized to update this listing" }, { status: 403, headers: corsHeaders });
    }

    const {
      title, description, price, location, image_url,
      amenities, property_type, beds, bathrooms, guests,
      place_category, discount,
    } = await req.json();

    const [result] = await pool.query(
      `UPDATE listings 
       SET title = COALESCE(?, title), 
           description = COALESCE(?, description), 
           price = COALESCE(?, price), 
           location = COALESCE(?, location), 
           image_url = COALESCE(?, image_url), 
           amenities = COALESCE(?, amenities), 
           property_type = COALESCE(?, property_type), 
           beds = COALESCE(?, beds), 
           bathrooms = COALESCE(?, bathrooms), 
           guests = COALESCE(?, guests), 
           place_category = COALESCE(?, place_category), 
           discount = COALESCE(?, discount)
       WHERE id = ?`,
      [
        title, description, price, location, image_url,
        amenities ? JSON.stringify(amenities) : null,
        property_type, beds, bathrooms, guests, place_category, discount, id
      ]
    );

    return NextResponse.json({ success: true, message: "Listing updated successfully" }, { headers: corsHeaders });
  } catch (error) {
    console.error("PUT /listings/[id] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500, headers: corsHeaders });
  }
}

// 🔐 Secure DELETE
export async function DELETE(req, { params }) {
  try {
    const { id } = params || {};
    if (!id) {
      return NextResponse.json({ success: false, error: "ID is required" }, { status: 400, headers: corsHeaders });
    }

    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401, headers: corsHeaders });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_secret_key");
    const adminId = decoded.id;

    // Ensure listing belongs to the logged-in admin
    const [check] = await pool.query("SELECT * FROM listings WHERE id = ? AND admin_id = ?", [id, adminId]);
    if (check.length === 0) {
      return NextResponse.json({ success: false, error: "Not authorized to delete this listing" }, { status: 403, headers: corsHeaders });
    }

    const [result] = await pool.query("DELETE FROM listings WHERE id = ?", [id]);
    return NextResponse.json({ success: true, message: "Listing deleted successfully" }, { headers: corsHeaders });
  } catch (error) {
    console.error("DELETE /listings/[id] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500, headers: corsHeaders });
  }
}
