import PDFDocument from "pdfkit";

export async function generatePdfBuffer(title: string, content: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(20).text(title, { align: "center" });
    doc.moveDown();
    doc.fontSize(11).text(content, { align: "left" });
    doc.end();
  });
}

export function generateDoctorReportContent(summary: Record<string, unknown>, profileName: string): string {
  return [
    "CLINICAL SUMMARY (Patient-reported data — not a diagnosis)",
    `Patient: ${profileName}`,
    `Generated: ${new Date().toLocaleDateString("en-IN")}`,
    "",
    "CYCLE DATA",
    `- Configured cycle length: ${summary.cycleLength ?? "N/A"} days`,
    `- Period days in report period: ${summary.periodDaysLogged ?? 0}`,
    `- Symptom/mood days logged: ${summary.symptomDaysLogged ?? 0}`,
    "",
    "WELLNESS METRICS",
    `- Average sleep: ${summary.avgSleepHours ?? 0} hrs/night`,
    `- Average hydration: ${summary.avgHydrationGlasses ?? 0} glasses/day`,
    `- Assessment score: ${summary.assessmentScore ?? "Not completed"}`,
    "",
    "DISCLAIMER: This summary is generated from self-reported app data.",
    "Please correlate with clinical examination and laboratory findings.",
  ].join("\n");
}
