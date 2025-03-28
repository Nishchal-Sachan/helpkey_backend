import Cors from "cors";

// Initialize CORS
const cors = Cors({
  origin: "*", // Allow all origins (change if needed)
  methods: ["GET", "OPTIONS"],
});

// Middleware to run CORS
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

// API Handler
export default async function handler(req, res) {
  await runMiddleware(req, res, cors); // Run CORS middleware

  if (req.method === "OPTIONS") {
    return res.status(200).end(); // Handle preflight request
  }

  if (req.method === "GET") {
    const amenities = [
      "WiFi",
      "Parking",
      "Swimming Pool",
      "Gym",
      "Spa",
      "Restaurant",
      "Air Conditioning",
      "Laundry Service",
    ];
    return res.status(200).json(amenities);
  }

  res.setHeader("Allow", ["GET"]);
  res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}
