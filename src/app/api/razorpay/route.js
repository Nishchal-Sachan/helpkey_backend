import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import shortid from "shortid";
import { getCORSHeaders } from "@/utils/cors"; // adjust if needed

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function GET(req) {
  const headers = getCORSHeaders(req);
  console.log("Incoming Origin:", req.headers.get("origin"));
  console.log("Applied CORS Headers:", headers);

  const payment_capture = 1;
  const amount = 1 * 100; // amount in paisa
  const currency = "INR";
  const options = {
    amount: amount.toString(),
    currency,
    receipt: shortid.generate(),
    payment_capture,
    notes: {
      paymentFor: "testingDemo",
      userId: "100",
      productId: "P100",
    },
  };

  // const order = await instance.orders.create(options);
  // return NextResponse.json({ msg: "success", order }, { headers });
  try {
    const order = await instance.orders.create(options);
    return NextResponse.json({ msg: "success", order }, { headers });
  } catch (error) {
    return NextResponse.json({ msg: "error", error: error.message }, { status: 500, headers });
  }
}

export async function POST(req) {
  const headers = getCORSHeaders(req);

  const body = await req.json();
  return NextResponse.json({ msg: body }, { headers });
}

export async function OPTIONS(req) {
  const headers = getCORSHeaders(req);
  return new NextResponse(null, { status: 204, headers });
}
