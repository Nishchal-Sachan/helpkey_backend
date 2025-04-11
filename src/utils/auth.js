// import { verifyAdmin } from "@/utils/auth";

// const corsHeaders = {
//   "Access-Control-Allow-Origin": "https://helpkey-frontend.vercel.app",
//   "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
//   "Access-Control-Allow-Headers": "Content-Type, Authorization",
//   "Access-Control-Allow-Credentials": "true",
// };

// export async function OPTIONS() {
//   return new Response(null, {
//     status: 204,
//     headers: corsHeaders,
//   });
// }

// export async function GET(req) {
//   const { success, adminId, error } = await verifyAdmin(req);

//   if (!success) {
//     return new Response(JSON.stringify({ success: false, error }), {
//       status: 401,
//       headers: corsHeaders,
//     });
//   }

//   return new Response(JSON.stringify({ success: true, adminId }), {
//     status: 200,
//     headers: corsHeaders,
//   });
// }

// // ✅ Add this POST handler too
// export async function POST(req) {
//   const { success, adminId, error } = await verifyAdmin(req);

//   if (!success) {
//     return new Response(JSON.stringify({ success: false, error }), {
//       status: 401,
//       headers: corsHeaders,
//     });
//   }

//   return new Response(JSON.stringify({ success: true, adminId }), {
//     status: 200,
//     headers: corsHeaders,
//   });
// }


// src/utils/auth.js

import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function verifyAdmin(req) {
  try {
    const token = cookies().get("token")?.value;
    if (!token) return { success: false, error: "No token provided" };

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { success: true, adminId: decoded.id };
  } catch (error) {
    return { success: false, error: "Invalid token" };
  }
}
