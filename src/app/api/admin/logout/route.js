export async function POST() {
    return new Response(
      JSON.stringify({ success: true, message: "Logged out successfully" }),
      {
        status: 200,
        headers: {
          "Set-Cookie": `token=; HttpOnly; Path=/; Secure; SameSite=None; Max-Age=0`,
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "https://helpkey-frontend.vercel.app",
          "Access-Control-Allow-Credentials": "true",
        },
      }
    );
  }
  


  export async function OPTIONS() {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "https://helpkey-frontend.vercel.app",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Credentials": "true",
      },
    });
  }
  