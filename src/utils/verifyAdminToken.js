import jwt from "jsonwebtoken";

export function verifyAdminToken(req) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { success: false, error: "Unauthorized: No token provided" };
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET || "your_secret_key";

    const decoded = jwt.verify(token, secret);
    return { success: true, decoded }; // contains id, email, role
  } catch (err) {
    console.error("JWT verification failed:", err);
    return { success: false, error: "Unauthorized: Invalid token" };
  }
}
