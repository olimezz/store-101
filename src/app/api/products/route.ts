import { NextResponse } from "next/server";
import { getLiveProducts } from "@/lib/admin-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  // Espone solo i campi pubblici: costEur resta strettamente riservato all'area admin
  const publicProducts = getLiveProducts().map(({ costEur: _hiddenCost, ...rest }) => ({
    ...rest,
    costEur: 0,
  }));

  return NextResponse.json(
    { products: publicProducts },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
