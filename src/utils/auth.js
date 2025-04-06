import { verifyAdmin } from "@/utils/auth";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://helpkey-frontend.vercel.app",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Credentials": "true",
};

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function GET(req) {
  const { success, adminId, error } = await verifyAdmin(req);

  if (!success) {
    return new Response(JSON.stringify({ success: false, error }), {
      status: 401,
      headers: corsHeaders,
    });
  }

  return new Response(JSON.stringify({ success: true, adminId }), {
    status: 200,
    headers: corsHeaders,
  });
}
