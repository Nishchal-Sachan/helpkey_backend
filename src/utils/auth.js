import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";

export async function verifyAdmin(req) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { success: false, error: "Unauthorized: No token provided" };
    }

    const token = authHeader.split(" ")[1]; // Extract token
    const decoded = jwt.verify(token, SECRET_KEY);

    return { success: true, adminId: decoded.id }; // Return admin ID for future use
  } catch (error) {
    return { success: false, error: "Unauthorized: Invalid token" };
  }
}
