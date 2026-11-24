import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { getStoreDb } from "@/lib/admin-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Accesso non autorizzato." }, { status: 401 });
  }

  const history = getStoreDb().csvImports.map(
    ({ previousProductsSnapshot: _snap, ...meta }) => meta
  );
  return NextResponse.json({ history });
}
