import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { applyEveningCsv } from "@/lib/admin-store";
import { validateCsvFileMeta } from "@/lib/csv-security";
import { getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Accesso non autorizzato." }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Form multipart non valido." },
      { status: 400 }
    );
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Nessun file CSV allegato." },
      { status: 400 }
    );
  }

  const metaError = validateCsvFileMeta({
    name: file.name,
    size: file.size,
    type: file.type,
  });
  if (metaError) {
    return NextResponse.json({ error: metaError }, { status: 400 });
  }

  const csvText = await file.text();
  const { preview, importEntry } = applyEveningCsv({
    csvText,
    filename: file.name,
    actorEmail: session.email,
    ip: getClientIp(request),
  });

  return NextResponse.json({
    ok: true,
    preview,
    importEntry: {
      id: importEntry.id,
      filename: importEntry.filename,
      uploadedBy: importEntry.uploadedBy,
      uploadedAt: importEntry.uploadedAt,
      rowsProcessed: importEntry.rowsProcessed,
      updatedCount: importEntry.updatedCount,
      createdCount: importEntry.createdCount,
      errorCount: importEntry.errorCount,
      detectedUnitsSold: importEntry.detectedUnitsSold,
      rolledBack: importEntry.rolledBack,
      rolledBackAt: importEntry.rolledBackAt,
    },
  });
}
