import { StudyResult } from "./study.functions";

export async function exportToPDF(
  title: string,
  result: StudyResult,
  notes: string
): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF();

  let yPosition = 20;
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = doc.internal.pageSize.getWidth() - 2 * margin;

  // Helper to add text with automatic wrapping
  const addWrappedText = (text: string, fontSize: number, isBold = false) => {
    doc.setFontSize(fontSize);
    if (isBold) doc.setFont("helvetica", "bold");
    else doc.setFont("helvetica", "normal");

    const lines = doc.splitTextToSize(text, maxWidth);
    lines.forEach((line: string) => {
      if (yPosition > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text(line, margin, yPosition);
      yPosition += 7;
    });
  };

  // Title
  addWrappedText(title, 18, true);
  yPosition += 5;

  // Metadata
  addWrappedText(`Topic: ${result.title}`, 10);
  addWrappedText(`Date: ${new Date().toLocaleDateString()}`, 10);
  yPosition += 5;

  // Summary
  addWrappedText("SUMMARY", 14, true);
  addWrappedText(result.summary, 11);
  yPosition += 10;

  // Flashcards
  addWrappedText("FLASHCARDS", 14, true);
  result.flashcards.forEach((card, idx) => {
    addWrappedText(`${idx + 1}. Q: ${card.question}`, 11, true);
    addWrappedText(`A: ${card.answer}`, 11);
    yPosition += 3;
  });
  yPosition += 5;

  // Quiz
  addWrappedText("QUIZ QUESTIONS", 14, true);
  result.quiz.forEach((q, idx) => {
    addWrappedText(`${idx + 1}. ${q.question}`, 11, true);
    q.choices.forEach((choice, cidx) => {
      const isCorrect = cidx === q.correctIndex ? " ✓" : "";
      addWrappedText(`  ${String.fromCharCode(97 + cidx)}) ${choice}${isCorrect}`, 10);
    });
    yPosition += 3;
  });

  // Tip
  addWrappedText("STUDY TIP", 12, true);
  addWrappedText(result.tip, 11);

  return doc.output("blob");
}

export function downloadPDF(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}