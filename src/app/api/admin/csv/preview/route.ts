import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { previewEveningCsv } from "@/lib/admin-store";
import { validateCsvFileMeta } from "@/lib/csv-security";

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
  const preview = previewEveningCsv(csvText, file.name);

  if (preview.totalRows === 0) {
    return NextResponse.json(
      { error: "Il file CSV non contiene righe dati valide." },
      { status: 400 }
    );
  }

  return NextResponse.json({ preview });
}
