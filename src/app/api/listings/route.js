import { NextResponse } from "next/server";
import pool from "@/utils/db";
import { verifyAdmin } from "@/utils/auth"; // Utility to check admin authentication

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET() {
  try {
    const [rows] = await pool.query("SELECT * FROM listings");
    return NextResponse.json({ success: true, data: rows }, { headers: corsHeaders });
  } catch (error) {
    console.error("Error fetching listings:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500, headers: corsHeaders });
  }
}

export async function POST(req) {
  try {
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      console.error("Unauthorized access attempt");
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403, headers: corsHeaders });
    }

    const body = await req.json();
    console.log("Received body:", body);

    const {
      title, description, price, location, image_url,
      amenities, property_type, beds, bathrooms, guests,
      place_category, discount,
    } = body;

    if (!title || !price || !location || !property_type || !place_category) {
      console.error("Missing required fields", { title, price, location, property_type, place_category });
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400, headers: corsHeaders });
    }

    const [result] = await pool.query(
      "INSERT INTO listings (title, description, price, location, image_url, amenities, property_type, beds, bathrooms, guests, place_category, discount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        title, description, parseFloat(price), location, image_url,
        JSON.stringify(amenities), property_type, parseInt(beds) || 1,
        parseInt(bathrooms) || 1, parseInt(guests) || 1, place_category,
        parseFloat(discount) || 0.0
      ]
    );

    return NextResponse.json({ success: true, message: "Listing added", id: result.insertId }, { headers: corsHeaders });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500, headers: corsHeaders });
  }
}
