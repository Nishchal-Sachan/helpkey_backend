import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import crypto from "crypto";
import { getCORSHeaders } from "@/utils/cors";

// import Payment from "../../../database/model/Payment";
// import dbConnect from '../../../database/database';

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(req) {
  const headers = getCORSHeaders(req);

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  const isAuthentic = expectedSignature === razorpay_signature;

  if (isAuthentic) {
    // Optional: Store the payment in DB
    // await dbConnect();
    // await Payment.create({
    //   razorpay_order_id,
    //   razorpay_payment_id,
    //   razorpay_signature,
    // });

    return NextResponse.json(
      { message: "success", paymentId: razorpay_payment_id },
      { status: 200, headers }
    );
  } else {
    return NextResponse.json(
      { message: "fail" },
      { status: 400, headers }
    );
  }
}

export async function OPTIONS(req) {
  const headers = getCORSHeaders(req);
  return new NextResponse(null, { status: 204, headers });
}
