import jwt from "jsonwebtoken";
import { getCORSHeaders } from "@/utils/cors";

export async function OPTIONS(req) {
  return new Response(null, {
    status: 204,
    headers: getCORSHeaders(req),
  });
}

export async function GET(req) {
  const headers = new Headers(getCORSHeaders(req));
  headers.set("Content-Type", "application/json");

  try {
    const cookie = req.headers.get("cookie") || "";
    const token = cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      return new Response(
        JSON.stringify({
          success: false,
          isAuthenticated: false,
          error: "No token found",
        }),
        { status: 401, headers }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_secret_key");

    return new Response(
      JSON.stringify({
        success: true,
        isAuthenticated: true,
        user: decoded,
      }),
      { status: 200, headers }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        isAuthenticated: false,
        error: "Invalid or expired token",
      }),
      { status: 401, headers }
    );
  }
}
