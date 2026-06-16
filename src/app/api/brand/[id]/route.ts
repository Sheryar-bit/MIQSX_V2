import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongoose";
import Brand from "@/models/Brand";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await connectDB();
  const brand = await Brand.findOne({ _id: id, userId: session.user.id }).lean();
  if (!brand) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ brand });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  await connectDB();
  const brand = await Brand.findOneAndUpdate(
    { _id: id, userId: session.user.id },
    { $set: body },
    { new: true }
  ).lean();

  if (!brand) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ brand });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await connectDB();
  await Brand.deleteOne({ _id: id, userId: session.user.id });
  return NextResponse.json({ success: true });
}
