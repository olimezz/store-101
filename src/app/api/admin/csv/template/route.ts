import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { getLiveProducts } from "@/lib/admin-store";
import { buildSampleCsvTemplate } from "@/lib/csv-security";

export const runtime = "nodejs";

export async function GET() {
  const session = await getAdminSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Accesso non autorizzato." }, { status: 401 });
  }

  const csvContent = buildSampleCsvTemplate(getLiveProducts());
  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition":
        'attachment; filename="store101_template_serale.csv"',
      "X-Content-Type-Options": "nosniff",
    },
  });
}
