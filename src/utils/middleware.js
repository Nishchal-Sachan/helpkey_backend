import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";

export function verifyAdmin(req) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return { success: false, error: "Unauthorized: No token provided" };

  const token = authHeader.split(" ")[1]; // Extract token
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    return { success: true, adminId: decoded.id };
  } catch (error) {
    return { success: false, error: "Unauthorized: Invalid token" };
  }
}
