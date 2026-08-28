import { NextResponse } from "next/server";

export async function GET() {
  const provider = process.env.PAYMENT_PROVIDER || "manual";
  const configured =
    provider === "stripe" && Boolean(process.env.STRIPE_SECRET_KEY);

  return NextResponse.json({
    success: true,
    provider,
    configured
  });
}
