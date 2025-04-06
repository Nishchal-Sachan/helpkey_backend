import { NextResponse } from "next/server";
import pool from "@/utils/db";
import jwt from "jsonwebtoken";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Add a new listing (with admin_id)
export async function POST(req) {
  try {
    // Get and verify token
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401, headers: corsHeaders });
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "your_secret_key");
    } catch (err) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401, headers: corsHeaders });
    }

    const adminId = decoded.id;

    const body = await req.json();
    const {
      title, description, price, location, image_url,
      amenities, property_type, beds, bathrooms, guests,
      place_category, discount, hotelDetails
    } = body;

    // Validate required fields
    if (!title || !price || !location || !property_type || !place_category) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400, headers: corsHeaders });
    }

    // Insert into listings table with admin_id
    const [listingResult] = await pool.query(
      `INSERT INTO listings 
      (title, description, price, location, image_url, amenities, property_type, beds, bathrooms, guests, place_category, discount, admin_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title, description, parseFloat(price), location, image_url,
        JSON.stringify(amenities), property_type, parseInt(beds) || 1,
        parseInt(bathrooms) || 1, parseInt(guests) || 1, place_category,
        parseFloat(discount) || 0.0, adminId
      ]
    );

    const listingId = listingResult.insertId;

    // Insert hotel details if applicable
    if (property_type === "Hotel" && hotelDetails) {
      const { numRooms, roomTypes } = hotelDetails;

      if (!numRooms || !roomTypes || roomTypes.length === 0) {
        return NextResponse.json({ success: false, error: "Hotel details are required" }, { status: 400, headers: corsHeaders });
      }

      await pool.query(
        "INSERT INTO hotel_details (listing_id, num_rooms, room_types) VALUES (?, ?, ?)",
        [listingId, parseInt(numRooms), JSON.stringify(roomTypes)]
      );
    }

    return NextResponse.json({ success: true, message: "Listing added", id: listingId }, { headers: corsHeaders });

  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500, headers: corsHeaders });
  }
}
