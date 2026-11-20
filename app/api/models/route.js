import { NextResponse } from "next/server";
import { listModels } from "@/lib/providers";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(listModels());
}
