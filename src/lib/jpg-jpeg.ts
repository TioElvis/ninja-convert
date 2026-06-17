interface ConvertJpgToPngProps {
  file: File;
}

export function convertJpgJpegToPng({
  file,
}: ConvertJpgToPngProps): Promise<File> {
  return new Promise((resolve, reject) => {
    if (!(file instanceof File)) {
      return reject(new Error("File must be a valid File object."));
    }

    if (file.type !== "image/jpeg") {
      return reject(new Error("File must be a JPEG/JPG image."));
    }

    const img = new Image();
    const srcUrl = URL.createObjectURL(file);

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");

        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");

        if (!ctx) {
          throw new Error("Canvas 2D context is undefined.");
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        ctx.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
          URL.revokeObjectURL(srcUrl);

          if (!blob) {
            return reject(
              new Error("Browser failed to process the image blob."),
            );
          }

          const originalName = file.name;
          const nameWithoutExt =
            originalName.substring(0, originalName.lastIndexOf(".")) ||
            originalName;

          const newName = `${nameWithoutExt}.png`;
          const pngFile = new File([blob], newName, { type: "image/png" });

          resolve(pngFile);
        }, "image/png");
      } catch (error) {
        URL.revokeObjectURL(srcUrl);
        reject(
          new Error(
            error instanceof Error
              ? error.message
              : "Error rendering the image.",
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
