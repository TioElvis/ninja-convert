import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  PageBreak,
  AlignmentType,
} from "docx";

export interface ConvertImageToPdfProps {
  file: File;
}

export function convertImageToPdf({
  file,
}: ConvertImageToPdfProps): Promise<File> {
  return new Promise((resolve, reject) => {
    if (!(file instanceof File)) {
      return reject(new Error("File must be a valid File object."));
    }

    const img = new Image();
    const srcUrl = URL.createObjectURL(file);

    img.onload = async () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas 2D context is undefined.");

        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        const orientation = img.width > img.height ? "l" : "p";
        const imgData = canvas.toDataURL("image/jpeg", 1.0);

        const { jsPDF } = await import("jspdf");

        const pdf = new jsPDF({
          orientation,
          unit: "px",
          format: [img.width, img.height],
        });

        pdf.addImage(imgData, "JPEG", 0, 0, img.width, img.height);
        const pdfBlob = pdf.output("blob");

        URL.revokeObjectURL(srcUrl);

        const originalName = file.name;
        const nameWithoutExt =
          originalName.substring(0, originalName.lastIndexOf(".")) ||
          originalName;
        const pdfFile = new File([pdfBlob], `${nameWithoutExt}.pdf`, {
          type: "application/pdf",
        });

        resolve(pdfFile);
      } catch (error) {
        URL.revokeObjectURL(srcUrl);
        reject(
          new Error(
            error instanceof Error ? error.message : "Error creating PDF.",
          ),
        );
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(srcUrl);
      reject(new Error("The file cannot be loaded and may be corrupted."));
    };

    img.src = srcUrl;
  });
}

export interface ConvertPdfToDocxProps {
  file: File;
}

interface TextItem {
  str: string;
  transform: number[];
  width: number;
  height: number;
  fontName: string;
}

function isTextItem(item: unknown): item is TextItem {
  return (
    typeof item === "object" &&
    item !== null &&
    "str" in item &&
    "transform" in item
  );
}

function getAlignment(
  x: number,
  pageWidth: number,
): (typeof AlignmentType)[keyof typeof AlignmentType] {
  const ratio = x / pageWidth;
  if (ratio > 0.55) return AlignmentType.RIGHT;
  if (ratio > 0.35) return AlignmentType.CENTER;
  return AlignmentType.LEFT;
}

function isBold(fontName: string): boolean {
  return /bold/i.test(fontName);
}

function isItalic(fontName: string): boolean {
  return /italic|oblique/i.test(fontName);
}

export async function convertPdfToDocx({
  file,
}: ConvertPdfToDocxProps): Promise<File> {
  if (!(file instanceof File)) {
    throw new Error("File must be a valid File object.");
  }

  if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
    throw new Error("The file must be a PDF.");
  }

  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

  const sections: Paragraph[][] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1 });
    const textContent = await page.getTextContent();
    const pageParagraphs: Paragraph[] = [];

    let lastY: number | null = null;
    let currentLine: TextItem[] = [];

    const flushLine = () => {
      if (currentLine.length === 0) return;

      const lineText = currentLine
        .map((i) => i.str)
        .join(" ")
        .trim();
      if (!lineText) return;

      const firstItem = currentLine[0];
      const x = firstItem.transform[4];
      const fontSize = Math.abs(firstItem.transform[3]);
      const bold = isBold(firstItem.fontName);
      const italics = isItalic(firstItem.fontName);
      const alignment = getAlignment(x, viewport.width);

      const runs = currentLine
        .map((item) => item.str)
        .filter(Boolean)
        .map(
          (text, idx) =>
            new TextRun({
              text: idx === 0 ? text : ` ${text}`,
              bold,
              italics,
              size: Math.round(fontSize) * 2,
            }),
        );

      pageParagraphs.push(
        new Paragraph({
          children: runs,
          alignment,
          spacing: { after: 120 },
        }),
      );

      currentLine = [];
    };

    for (const item of textContent.items) {
      if (!isTextItem(item)) continue;
      if (!item.str.trim() && item.str !== " ") continue;

      const y = item.transform[5];

      if (lastY !== null && Math.abs(y - lastY) > 2) {
        flushLine();
      }

      currentLine.push(item);
      lastY = y;
    }

    flushLine();

    if (pageNum < pdf.numPages && pageParagraphs.length > 0) {
      pageParagraphs[pageParagraphs.length - 1] = new Paragraph({
        children: [new PageBreak()],
      });
    }

    sections.push(pageParagraphs);
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: 12240, height: 15840 },
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        children: sections.flat(),
      },
    ],
  });

  const blob = await Packer.toBlob(doc);

  const originalName = file.name;
  const nameWithoutExt =
    originalName.substring(0, originalName.lastIndexOf(".")) || originalName;

  return new File([blob], `${nameWithoutExt}.docx`, {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
}
