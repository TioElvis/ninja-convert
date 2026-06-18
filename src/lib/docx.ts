import mammoth from "mammoth";
import { jsPDF } from "jspdf";
import { Document, ImageRun, Packer, Paragraph, AlignmentType } from "docx";

export interface ConvertImageToDocxProps {
  file: File;
}

const PAGE_WIDTH_DXA = 12240;
const PAGE_HEIGHT_DXA = 15840;
const MARGIN_DXA = 1440;
const CONTENT_WIDTH_DXA = PAGE_WIDTH_DXA - MARGIN_DXA * 2;
const CONTENT_HEIGHT_DXA = PAGE_HEIGHT_DXA - MARGIN_DXA * 2;
const DXA_TO_EMU = 914400 / 1440;

function dxaToEmu(dxa: number): number {
  return Math.round(dxa * DXA_TO_EMU);
}

function fitDimensions(
  imgWidth: number,
  imgHeight: number,
): { width: number; height: number } {
  const maxW = CONTENT_WIDTH_DXA;
  const maxH = CONTENT_HEIGHT_DXA;
  const ratio = Math.min(maxW / imgWidth, maxH / imgHeight, 1);
  return {
    width: Math.round(imgWidth * ratio),
    height: Math.round(imgHeight * ratio),
  };
}

function getImageType(mimeType: string): "png" | "jpg" | "gif" | "bmp" {
  const map: Record<string, "png" | "jpg" | "gif" | "bmp"> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/gif": "gif",
    "image/bmp": "bmp",
    "image/webp": "png",
    "image/avif": "png",
  };
  return map[mimeType] ?? "png";
}

async function normalizeToArrayBuffer(
  file: File,
): Promise<{ data: ArrayBuffer; type: "png" | "jpg" | "gif" | "bmp" }> {
  const needsConversion =
    file.type === "image/webp" ||
    file.type === "image/avif" ||
    file.type === "image/svg+xml" ||
    file.type === "image/x-xpixmap" ||
    file.name.endsWith(".xpm");

  if (!needsConversion) {
    return {
      data: await file.arrayBuffer(),
      type: getImageType(file.type),
    };
  }

  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      canvas.toBlob(
        async (blob) => {
          if (!blob)
            return reject(new Error("Failed to convert image to PNG."));
          resolve({ data: await blob.arrayBuffer(), type: "png" });
        },
        "image/png",
        1,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("The file cannot be loaded."));
    };

    img.src = url;
  });
}

function getImageDimensions(
  file: File,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to read image dimensions."));
    };
    img.src = url;
  });
}

export async function convertImageToDocx({
  file,
}: ConvertImageToDocxProps): Promise<File> {
  if (!(file instanceof File)) {
    throw new Error("File must be a valid File object.");
  }

  if (!file.type.startsWith("image/") && !file.name.endsWith(".xpm")) {
    throw new Error("The file must be an image.");
  }

  const [{ data, type }, { width: imgWidth, height: imgHeight }] =
    await Promise.all([normalizeToArrayBuffer(file), getImageDimensions(file)]);

  const { width, height } = fitDimensions(imgWidth, imgHeight);

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: PAGE_WIDTH_DXA, height: PAGE_HEIGHT_DXA },
            margin: {
              top: MARGIN_DXA,
              right: MARGIN_DXA,
              bottom: MARGIN_DXA,
              left: MARGIN_DXA,
            },
          },
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new ImageRun({
                data,
                transformation: {
                  width: dxaToEmu(width),
                  height: dxaToEmu(height),
                },
                type,
              }),
            ],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const nameWithoutExt =
    file.name.substring(0, file.name.lastIndexOf(".")) || file.name;

  return new File([blob], `${nameWithoutExt}.docx`, {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
}

export interface ConvertDocxToPdfProps {
  file: File;
}

const PAGE_WIDTH_PT = 595.28;
const PAGE_HEIGHT_PT = 841.89;
const MARGIN_PT = 56.69;
const CONTENT_WIDTH_PT = PAGE_WIDTH_PT - MARGIN_PT * 2;
const LINE_HEIGHT = 14;
const FONT_SIZE_BODY = 11;
const FONT_SIZE_H1 = 20;
const FONT_SIZE_H2 = 16;
const FONT_SIZE_H3 = 13;

interface DocLine {
  text: string;
  fontSize: number;
  bold: boolean;
  italic: boolean;
  spaceBefore: number;
  spaceAfter: number;
  isListItem: boolean;
  listDepth: number;
}

function parseHtmlToLines(html: string): DocLine[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const lines: DocLine[] = [];

  function extractText(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? "";
    return Array.from(node.childNodes).map(extractText).join("");
  }

  function processNode(node: Element, depth = 0) {
    const tag = node.tagName?.toLowerCase();

    if (["h1", "h2", "h3", "h4", "h5", "h6"].includes(tag)) {
      const level = parseInt(tag[1]);
      const fontSize =
        level === 1 ? FONT_SIZE_H1 : level === 2 ? FONT_SIZE_H2 : FONT_SIZE_H3;
      lines.push({
        text: extractText(node).trim(),
        fontSize,
        bold: true,
        italic: false,
        spaceBefore: level === 1 ? 16 : 10,
        spaceAfter: level === 1 ? 8 : 4,
        isListItem: false,
        listDepth: 0,
      });
      return;
    }

    if (tag === "p") {
      const text = extractText(node).trim();
      if (!text) return;
      const isBold = !!node.querySelector("strong, b");
      const isItalic = !!node.querySelector("em, i");
      lines.push({
        text,
        fontSize: FONT_SIZE_BODY,
        bold: isBold,
        italic: isItalic,
        spaceBefore: 0,
        spaceAfter: 6,
        isListItem: false,
        listDepth: 0,
      });
      return;
    }

    if (tag === "li") {
      const text = extractText(node).trim();
      if (!text) return;
      lines.push({
        text,
        fontSize: FONT_SIZE_BODY,
        bold: false,
        italic: false,
        spaceBefore: 0,
        spaceAfter: 3,
        isListItem: true,
        listDepth: depth,
      });
      return;
    }

    if (["ul", "ol"].includes(tag)) {
      Array.from(node.children).forEach((child) =>
        processNode(child as Element, depth + 1),
      );
      return;
    }

    Array.from(node.children).forEach((child) =>
      processNode(child as Element, depth),
    );
  }

  Array.from(doc.body.children).forEach((child) =>
    processNode(child as Element),
  );

  return lines;
}

function wrapText(
  pdf: jsPDF,
  text: string,
  maxWidth: number,
  indent = 0,
): string[] {
  return pdf.splitTextToSize(text, maxWidth - indent);
}

export async function convertDocxToPdf({
  file,
}: ConvertDocxToPdfProps): Promise<File> {
  if (!(file instanceof File)) {
    throw new Error("File must be a valid File object.");
  }

  const isDocx =
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.name.endsWith(".docx") ||
    file.name.endsWith(".doc");

  if (!isDocx) {
    throw new Error("The file must be a .docx or .doc document.");
  }

  const arrayBuffer = await file.arrayBuffer();

  const { value: html } = await mammoth.convertToHtml(
    { arrayBuffer },
    {
      styleMap: [
        "p[style-name='Heading 1'] => h1:fresh",
        "p[style-name='Heading 2'] => h2:fresh",
        "p[style-name='Heading 3'] => h3:fresh",
      ],
    },
  );

  const docLines = parseHtmlToLines(html);

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  });

  let y = MARGIN_PT;

  const addPage = () => {
    pdf.addPage();
    y = MARGIN_PT;
  };

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > PAGE_HEIGHT_PT - MARGIN_PT) addPage();
  };

  for (const line of docLines) {
    if (line.spaceBefore > 0) {
      checkPageBreak(line.spaceBefore);
      y += line.spaceBefore;
    }

    const style =
      line.bold && line.italic
        ? "bolditalic"
        : line.bold
          ? "bold"
          : line.italic
            ? "italic"
            : "normal";

    pdf.setFont("helvetica", style);
    pdf.setFontSize(line.fontSize);

    const indent = line.isListItem ? line.listDepth * 12 + 12 : 0;
    const prefix = line.isListItem ? "• " : "";
    const fullText = prefix + line.text;
    const wrapped = wrapText(pdf, fullText, CONTENT_WIDTH_PT, indent);
    const blockHeight = wrapped.length * LINE_HEIGHT + line.spaceAfter;

    checkPageBreak(blockHeight);

    for (const wrappedLine of wrapped) {
      pdf.text(wrappedLine, MARGIN_PT + indent, y);
      y += LINE_HEIGHT;
    }

    y += line.spaceAfter;
  }

  const pdfBlob = pdf.output("blob");
  const nameWithoutExt =
    file.name.substring(0, file.name.lastIndexOf(".")) || file.name;

  return new File([pdfBlob], `${nameWithoutExt}.pdf`, {
    type: "application/pdf",
  });
}
