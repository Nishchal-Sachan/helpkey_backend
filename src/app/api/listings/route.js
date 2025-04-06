import { NextResponse } from "next/server";
import pool from "@/utils/db";
import { verifyAdmin } from "@/utils/auth";
import { getCORSHeaders } from "@/utils/cors";

// Preflight handler
export async function OPTIONS(req) {
  const corsHeaders = getCORSHeaders(req);
  return NextResponse.json({}, { headers: corsHeaders });
}

// Public GET route to fetch listings based on location (no auth)
export async function GET(req) {
  const corsHeaders = getCORSHeaders(req);

  try {
    const { searchParams } = new URL(req.url);
    const location = searchParams.get("location");

    let query = "SELECT * FROM listings";
    let values = [];

    if (location) {
      query += " WHERE location LIKE ?";
      values.push(`%${location}%`);
    }

    const [rows] = await pool.query(query, values);

    const listings = rows.map((listing) => ({
      ...listing,
      amenities: JSON.parse(listing.amenities || "[]"),
    }));

    return NextResponse.json({ success: true, data: listings }, { headers: corsHeaders });
  } catch (error) {
    console.error("GET /listings Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function POST(req) {
  const corsHeaders = getCORSHeaders(req);

  try {
    const { success, adminId, error } = await verifyAdmin(req);
    if (!success) {
      return NextResponse.json({ success: false, error }, { status: 401, headers: corsHeaders });
    }

    const body = await req.json();
    const {
      title, description, price, location, image_url,
      amenities, property_type, beds, bathrooms, guests,
      place_category, discount, hotelDetails
    } = body;

    if (!title || !price || !location || !property_type || !place_category) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400, headers: corsHeaders });
    }

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

    if (property_type === "Hotel" && hotelDetails) {
      const { numRooms, roomTypes } = hotelDetails;
      if (!numRooms || !roomTypes?.length) {
        return NextResponse.json({ success: false, error: "Hotel details are required" }, { status: 400, headers: corsHeaders });
      }

      await pool.query(
        "INSERT INTO hotel_details (listing_id, num_rooms, room_types) VALUES (?, ?, ?)",
        [listingId, parseInt(numRooms), JSON.stringify(roomTypes)]
      );
    }

    return NextResponse.json({ success: true, message: "Listing added", id: listingId }, { headers: corsHeaders });
  } catch (error) {
    console.error("Error adding listing:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500, headers: corsHeaders });
  }
}
