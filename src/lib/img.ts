import ImageTracer from "imagetracerjs";

export const TARGET_IMG_EXTENSION = [
  "jpg",
  "jpeg",
  "webp",
  "avif",
  "png",
  "svg",
];

export interface ConvertImageProps {
  file: File;
  extension: (typeof TARGET_IMG_EXTENSION)[number];
}

export function convertImageFormat({
  file,
  extension,
}: ConvertImageProps): Promise<File> {
  return new Promise((resolve, reject) => {
    if (!(file instanceof File)) {
      return reject(new Error("The file must be a file."));
    }

    if (!file.type.startsWith("image/")) {
      return reject(new Error("The file must be an image."));
    }

    const mimeTypeMap: Record<(typeof TARGET_IMG_EXTENSION)[number], string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      webp: "image/webp",
      avif: "image/avif",
      png: "image/png",
      svg: "image/svg+xml",
    };

    const targetMimeType = mimeTypeMap[extension];
    const srcUrl = URL.createObjectURL(file);

    const originalName = file.name;
    const nameWithoutExt =
      originalName.substring(0, originalName.lastIndexOf(".")) || originalName;
    const newName = `${nameWithoutExt}.${extension}`;

    if (extension === "svg") {
      try {
        ImageTracer.imageToSVG(
          srcUrl,
          (svgString: string) => {
            URL.revokeObjectURL(srcUrl);

            const blob = new Blob([svgString], { type: targetMimeType });
            const convertedFile = new File([blob], newName, {
              type: targetMimeType,
            });

            resolve(convertedFile);
          },
          "detailed",
        );
      } catch (error) {
        URL.revokeObjectURL(srcUrl);
        reject(
          new Error(error instanceof Error ? error.message : "Error in svg."),
        );
      }
      return;
    }

    const img = new Image();

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");

        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");

        if (!ctx) {
          throw new Error("The 2d context is not defined.");
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        if (targetMimeType === "image/jpeg") {
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(srcUrl);

            if (!blob) {
              return reject(
                new Error(
                  `The browser cannot support ${extension.toUpperCase()}.`,
                ),
              );
            }

            const convertedFile = new File([blob], newName, {
              type: targetMimeType,
            });

            resolve(convertedFile);
          },
          targetMimeType,
          1,
        );
      } catch (error) {
        URL.revokeObjectURL(srcUrl);
        reject(
          new Error(
            error instanceof Error ? error.message : "Error rendering image.",
          ),
        );
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(srcUrl);
      reject(new Error("The file cannot be loaded."));
    };

    img.src = srcUrl;
  });
}
