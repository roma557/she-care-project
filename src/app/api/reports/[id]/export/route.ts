import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-server";
import { assertAccess } from "@/lib/permissions";
import { getReportAsync } from "@/lib/db";
import { generatePdfBuffer, generateDoctorReportContent } from "@/lib/reports/export-pdf";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const { id } = await params;
  const format = req.nextUrl.searchParams.get("format") ?? "pdf";
  const report = await getReportAsync(user.id, id);
  if (!report) return NextResponse.json({ error: "Report not found" }, { status: 404 });

  try {
    if (format === "doctor") {
      await assertAccess(user.id, "doctor_report");
      const content = generateDoctorReportContent(report.summary, user.name);
      const buffer = await generatePdfBuffer("Doctor Report — HerWellness", content);
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="doctor-report-${id}.pdf"`,
        },
      });
    }

    await assertAccess(user.id, "pdf_export");
    const buffer = await generatePdfBuffer(report.title, report.content);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="wellness-report-${id}.pdf"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "upgrade_required", requiredTier: "premium" }, { status: 403 });
  }
}
