import { NextResponse } from "next/server";
import pool from "@/utils/db"; 

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Handle CORS preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// Fetch all listings
// export async function GET() {
//   try {
//     const [rows] = await pool.query("SELECT * FROM listings");
//     return NextResponse.json({ success: true, data: rows }, { headers: corsHeaders });
//   } catch (error) {
//     console.error("Error fetching listings:", error);
//     return NextResponse.json({ success: false, error: error.message }, { status: 500, headers: corsHeaders });
//   }
// }
// // search listing by locxation
// export async function GET(req) {
//   const { searchParams } = new URL(req.url);
//   const location = searchParams.get("location");

//   if (!location) {
//     return NextResponse.json({ success: false, error: "Location is required" }, { status: 400, headers: corsHeaders });
//   }

//   try {
//     const query = "SELECT * FROM listings WHERE location LIKE ?";
//     const [rows] = await pool.query(query, [`%${location}%`]);

//     return NextResponse.json({ success: true, vendors: rows }, { headers: corsHeaders });

//   } catch (error) {
//     console.error("Error fetching listings:", error);
//     return NextResponse.json({ success: false, error: error.message }, { status: 500, headers: corsHeaders });
//   }
// }


// Fetch all listings or search by location
export async function GET(req) {
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
    
    return NextResponse.json(
      { success: true, data: rows },
      { headers: corsHeaders }
    );

  } catch (error) {
    console.error("Error fetching listings:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}


// Add a new listing (without authentication)
export async function POST(req) {
  try {
    const body = await req.json();
    console.log("Received body:", body);

    const {
      title, description, price, location, image_url,
      amenities, property_type, beds, bathrooms, guests,
      place_category, discount, hotelDetails
    } = body;

    // Validate required fields
    if (!title || !price || !location || !property_type || !place_category) {
      console.error("Missing required fields", { title, price, location, property_type, place_category });
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400, headers: corsHeaders });
    }

    // Insert into listings table
    const [listingResult] = await pool.query(
      "INSERT INTO listings (title, description, price, location, image_url, amenities, property_type, beds, bathrooms, guests, place_category, discount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        title, description, parseFloat(price), location, image_url,
        JSON.stringify(amenities), property_type, parseInt(beds) || 1,
        parseInt(bathrooms) || 1, parseInt(guests) || 1, place_category,
        parseFloat(discount) || 0.0
      ]
    );

    const listingId = listingResult.insertId; // Get the inserted listing ID

    // If property type is "Hotel", insert into hotel_details table
    if (property_type === "Hotel" && hotelDetails) {
      const { numRooms, roomTypes } = hotelDetails;

      if (!numRooms || !roomTypes || roomTypes.length === 0) {
        console.error("Missing hotel details", { numRooms, roomTypes });
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
