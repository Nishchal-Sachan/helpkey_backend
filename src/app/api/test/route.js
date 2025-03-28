import pool from "@/utils/db";

export async function GET() {
  try {
    const [rows] = await pool.query("SELECT 'Connected to MySQL' AS message");
    return Response.json({ success: true, message: rows[0].message });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
