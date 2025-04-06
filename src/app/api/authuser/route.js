import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    const { token } = await req.json();

    if (!token) {
      return new Response(JSON.stringify({ success: false, error: "No token provided" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_secret_key");

    return new Response(JSON.stringify({ success: true, isAuthenticated: true, user: decoded }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, isAuthenticated: false, error: "Invalid token" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
}
