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
