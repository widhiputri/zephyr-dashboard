import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function exportDashboardPdf(element: HTMLElement, projectKey: string) {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#f9fafb",
  });

  const imgData = canvas.toDataURL("image/png");
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;

  // A4 landscape fits dashboards better
  const pdf = new jsPDF("landscape", "mm", "a4");
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
  const w = imgWidth * ratio;
  const h = imgHeight * ratio;

  pdf.addImage(imgData, "PNG", (pdfWidth - w) / 2, 5, w, h);

  const date = new Date().toLocaleDateString("en-GB");
  pdf.save(`${projectKey}-qa-dashboard-${date}.pdf`);
}
