// utils/cors.js or in the same route file
const allowedOrigins = [
    "https://helpkey-frontend.vercel.app",
    "https://helpkey-webapp.vercel.app",
    "http://localhost:3000"
  ];
  
  export function getCORSHeaders(req) {
    const origin = req.headers.get("origin");
  
    return {
      "Access-Control-Allow-Origin": allowedOrigins.includes(origin) ? origin : "",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
    };
  }
  