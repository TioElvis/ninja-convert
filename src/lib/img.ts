import ImageTracer from "imagetracerjs";

export const TARGET_IMG_EXTENSION = [
  "jpg",
  "jpeg",
  "webp",
  "avif",
  "png",
  "svg",
  "ico",
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
      return reject(new Error("The file must be a File."));
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
      ico: "image/x-icon",
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
          new Error(
            error instanceof Error ? error.message : "Error rendering SVG.",
          ),
        );
      }
      return;
    }

    const img = new Image();

    img.onload = async () => {
      try {
        if (extension === "ico") {
          const sizes = [256, 48, 32, 16];
          const buffers = await Promise.all(
            sizes.map((size) => generatePngBuffer(img, size)),
          );

          const headerSize = 6;
          const directoryEntrySize = 16;
          const directoryTotalSize = directoryEntrySize * sizes.length;
          const totalDataSize = buffers.reduce(
            (acc, buf) => acc + buf.byteLength,
            0,
          );

          const icoBuffer = new ArrayBuffer(
            headerSize + directoryTotalSize + totalDataSize,
          );
          const view = new DataView(icoBuffer);
          const icoArray = new Uint8Array(icoBuffer);

          view.setUint16(0, 0, true);
          view.setUint16(2, 1, true);
          view.setUint16(4, sizes.length, true);

          let dataOffset = headerSize + directoryTotalSize;

          sizes.forEach((size, i) => {
            const buf = buffers[i];
            const dirOffset = headerSize + i * directoryEntrySize;

            const w = size >= 256 ? 0 : size;
            const h = size >= 256 ? 0 : size;

            view.setUint8(dirOffset + 0, w);
            view.setUint8(dirOffset + 1, h);
            view.setUint8(dirOffset + 2, 0);
            view.setUint8(dirOffset + 3, 0);
            view.setUint16(dirOffset + 4, 1, true);
            view.setUint16(dirOffset + 6, 32, true);
            view.setUint32(dirOffset + 8, buf.byteLength, true);
            view.setUint32(dirOffset + 12, dataOffset, true);

            icoArray.set(new Uint8Array(buf), dataOffset);
            dataOffset += buf.byteLength;
          });

          URL.revokeObjectURL(srcUrl);
          const finalBlob = new Blob([icoBuffer], { type: targetMimeType });
          const convertedFile = new File([finalBlob], newName, {
            type: targetMimeType,
          });
          return resolve(convertedFile);
        }

        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");

        if (!ctx) throw new Error("The 2d context is not defined.");

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

function generatePngBuffer(
  img: HTMLImageElement,
  size: number,
): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    if (!ctx) return reject(new Error("The 2d context is not defined."));

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    const scale = Math.min(size / img.width, size / img.height);
    const x = size / 2 - (img.width / 2) * scale;
    const y = size / 2 - (img.height / 2) * scale;

    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

    canvas.toBlob(async (blob) => {
      if (!blob) return reject(new Error("Failed to generate PNG blob."));
      resolve(await blob.arrayBuffer());
    }, "image/png");
  });
}
