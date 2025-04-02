import { NextResponse } from "next/server";
import pool from "@/utils/db";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Handle CORS preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// Fetch a listing by ID
// export async function GET(req, { params }) {
//   try {
//     const { id } = params || {};
//     if (!id) {
//       return NextResponse.json({ success: false, error: "ID is required" }, { status: 400, headers: corsHeaders });
//     }

//     const [rows] = await pool.query("SELECT * FROM listings WHERE id = ?", [id]);

//     if (rows.length === 0) {
//       return NextResponse.json({ success: false, error: "Listing not found" }, { status: 404, headers: corsHeaders });
//     }

//     return NextResponse.json({ success: true, data: rows[0] }, { headers: corsHeaders });
//   } catch (error) {
//     console.error("GET /listings/[id] Error:", error);
//     return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500, headers: corsHeaders });
//   }
// }


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

    // Parse the amenities field to ensure it's an array
    const listing = rows[0];
    try {
      listing.amenities = JSON.parse(listing.amenities); // Ensure amenities is an array
    } catch (err) {
      // If JSON parsing fails, default to an empty array
      listing.amenities = [];
    }

    return NextResponse.json({ success: true, data: listing }, { headers: corsHeaders });
  } catch (error) {
    console.error("GET /listings/[id] Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500, headers: corsHeaders });
  }
}


// Update a listing (without authentication)
export async function PUT(req, { params }) {
  try {
    const { id } = params || {};
    if (!id) {
      return NextResponse.json({ success: false, error: "ID is required" }, { status: 400, headers: corsHeaders });
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

    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, error: "Listing not found or no changes made" }, { status: 404, headers: corsHeaders });
    }

    return NextResponse.json({ success: true, message: "Listing updated successfully" }, { headers: corsHeaders });
  } catch (error) {
    console.error("PUT /listings/[id] Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500, headers: corsHeaders });
  }
}

// Delete a listing (without authentication)
export async function DELETE(req, { params }) {
  try {
    const { id } = params || {};
    if (!id) {
      return NextResponse.json({ success: false, error: "ID is required" }, { status: 400, headers: corsHeaders });
    }

    const [result] = await pool.query("DELETE FROM listings WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, error: "Listing not found" }, { status: 404, headers: corsHeaders });
    }

    return NextResponse.json({ success: true, message: "Listing deleted successfully" }, { headers: corsHeaders });
  } catch (error) {
    console.error("DELETE /listings/[id] Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500, headers: corsHeaders });
  }
}
