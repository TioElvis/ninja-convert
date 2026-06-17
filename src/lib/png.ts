interface ConvertPngToJpgJpegProps {
  file: File;
  extension: "jpg" | "jpeg";
}

export function convertPngToJpeg({
  file,
  extension,
}: ConvertPngToJpgJpegProps): Promise<File> {
  return new Promise((resolve, reject) => {
    if (!(file instanceof File)) {
      return reject(new Error("File must be a valid File object."));
    }

    if (file.type !== "image/png") {
      return reject(new Error("File must be a PNG image."));
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

        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
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

            const newName = `${nameWithoutExt}.${extension}`;
            const jpgJpegFile = new File([blob], newName, {
              type: "image/jpeg",
            });

            resolve(jpgJpegFile);
          },
          "image/jpeg",
          1.0,
        );
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
