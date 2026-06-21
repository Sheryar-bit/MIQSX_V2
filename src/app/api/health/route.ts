import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongoose";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/health — liveness + DB connectivity probe.
export async function GET() {
  const started = Date.now();
  try {
    await connectDB();
    // readyState 1 = connected
    const dbUp = mongoose.connection.readyState === 1;
    return NextResponse.json(
      {
        status: dbUp ? "ok" : "degraded",
        db: dbUp ? "connected" : "disconnected",
        uptimeMs: Date.now() - started,
      },
      { status: dbUp ? 200 : 503 }
    );
  } catch (err) {
    return NextResponse.json(
      { status: "error", db: "unreachable", error: err instanceof Error ? err.message : "unknown" },
      { status: 503 }
    );
  }
}
