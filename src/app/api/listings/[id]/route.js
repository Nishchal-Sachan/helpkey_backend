import { NextResponse } from "next/server";
import pool from "@/utils/db";
import { verifyAdmin } from "@/utils/auth";
import { getCORSHeaders } from "@/utils/cors";

export async function OPTIONS(req) {
  const corsHeaders = getCORSHeaders(req);
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(req, { params }) {
  const corsHeaders = getCORSHeaders(req);
  try {
    const { id } = params || {};
    if (!id) {
      return NextResponse.json({ success: false, error: "ID is required" }, { status: 400, headers: corsHeaders });
    }

    const [rows] = await pool.query("SELECT * FROM listings WHERE id = ?", [id]);
    if (!rows.length) {
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

export async function PUT(req, { params }) {
  const corsHeaders = getCORSHeaders(req);
  try {
    const { id } = params || {};
    if (!id) {
      return NextResponse.json({ success: false, error: "ID is required" }, { status: 400, headers: corsHeaders });
    }

    const { success, adminId, error } = await verifyAdmin(req);
    if (!success) {
      return NextResponse.json({ success: false, error }, { status: 401, headers: corsHeaders });
    }

    const [check] = await pool.query("SELECT * FROM listings WHERE id = ? AND admin_id = ?", [id, adminId]);
    if (!check.length) {
      return NextResponse.json({ success: false, error: "Not authorized to update this listing" }, { status: 403, headers: corsHeaders });
    }

    const {
      title, description, price, location, image_url,
      amenities, property_type, beds, bathrooms, guests,
      place_category, discount,
    } = await req.json();

    await pool.query(
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

export async function DELETE(req, { params }) {
  const corsHeaders = getCORSHeaders(req);
  try {
    const { id } = params || {};
    if (!id) {
      return NextResponse.json({ success: false, error: "ID is required" }, { status: 400, headers: corsHeaders });
    }

    const { success, adminId, error } = await verifyAdmin(req);
    if (!success) {
      return NextResponse.json({ success: false, error }, { status: 401, headers: corsHeaders });
    }

    const [check] = await pool.query("SELECT * FROM listings WHERE id = ? AND admin_id = ?", [id, adminId]);
    if (!check.length) {
      return NextResponse.json({ success: false, error: "Not authorized to delete this listing" }, { status: 403, headers: corsHeaders });
    }

    await pool.query("DELETE FROM listings WHERE id = ?", [id]);
    return NextResponse.json({ success: true, message: "Listing deleted successfully" }, { headers: corsHeaders });
  } catch (error) {
    console.error("DELETE /listings/[id] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500, headers: corsHeaders });
  }
}
