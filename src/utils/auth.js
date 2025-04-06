import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";

export async function verifyAdmin(req) {
  try {
    // 1. Check HTTP-only cookie
    const cookie = req.headers.get("cookie");
    let token = null;

    if (cookie) {
      const match = cookie.match(/token=([^;]+)/);
      if (match) token = match[1];
    }

    // 2. Fallback to Authorization header
    if (!token) {
      const authHeader = req.headers.get("Authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    if (!token) {
      return { success: false, error: "Unauthorized: No token provided" };
    }

    const decoded = jwt.verify(token, SECRET_KEY);
    return { success: true, adminId: decoded.id };
  } catch (error) {
    return { success: false, error: "Unauthorized: Invalid token" };
  }
}
