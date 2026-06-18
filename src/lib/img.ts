import ImageTracer from "imagetracerjs";

export const TARGET_IMG_EXTENSION = [
  "avif",
  "ico",
  "jpeg",
  "jpg",
  "png",
  "svg",
  "webp",
  "xpm",
];

export interface ConvertImageProps {
  file: File;
  extension: (typeof TARGET_IMG_EXTENSION)[number];
}

type RGBA = [number, number, number, number];

const X11_COLORS: Record<string, RGBA> = {
  aliceblue: [240, 248, 255, 255],
  antiquewhite: [250, 235, 215, 255],
  aqua: [0, 255, 255, 255],
  aquamarine: [127, 255, 212, 255],
  azure: [240, 255, 255, 255],
  beige: [245, 245, 220, 255],
  bisque: [255, 228, 196, 255],
  black: [0, 0, 0, 255],
  blanchedalmond: [255, 235, 205, 255],
  blue: [0, 0, 255, 255],
  blueviolet: [138, 43, 226, 255],
  brown: [165, 42, 42, 255],
  burlywood: [222, 184, 135, 255],
  cadetblue: [95, 158, 160, 255],
  chartreuse: [127, 255, 0, 255],
  chocolate: [210, 105, 30, 255],
  coral: [255, 127, 80, 255],
  cornflowerblue: [100, 149, 237, 255],
  cornsilk: [255, 248, 220, 255],
  crimson: [220, 20, 60, 255],
  cyan: [0, 255, 255, 255],
  darkblue: [0, 0, 139, 255],
  darkcyan: [0, 139, 139, 255],
  darkgoldenrod: [184, 134, 11, 255],
  darkgray: [169, 169, 169, 255],
  darkgreen: [0, 100, 0, 255],
  darkgrey: [169, 169, 169, 255],
  darkkhaki: [189, 183, 107, 255],
  darkmagenta: [139, 0, 139, 255],
  darkolivegreen: [85, 107, 47, 255],
  darkorange: [255, 140, 0, 255],
  darkorchid: [153, 50, 204, 255],
  darkred: [139, 0, 0, 255],
  darksalmon: [233, 150, 122, 255],
  darkseagreen: [143, 188, 143, 255],
  darkslateblue: [72, 61, 139, 255],
  darkslategray: [47, 79, 79, 255],
  darkslategrey: [47, 79, 79, 255],
  darkturquoise: [0, 206, 209, 255],
  darkviolet: [148, 0, 211, 255],
  deeppink: [255, 20, 147, 255],
  deepskyblue: [0, 191, 255, 255],
  dimgray: [105, 105, 105, 255],
  dimgrey: [105, 105, 105, 255],
  dodgerblue: [30, 144, 255, 255],
  firebrick: [178, 34, 34, 255],
  floralwhite: [255, 250, 240, 255],
  forestgreen: [34, 139, 34, 255],
  fuchsia: [255, 0, 255, 255],
  gainsboro: [220, 220, 220, 255],
  ghostwhite: [248, 248, 255, 255],
  gold: [255, 215, 0, 255],
  goldenrod: [218, 165, 32, 255],
  gray: [128, 128, 128, 255],
  green: [0, 128, 0, 255],
  greenyellow: [173, 255, 47, 255],
  grey: [128, 128, 128, 255],
  honeydew: [240, 255, 240, 255],
  hotpink: [255, 105, 180, 255],
  indianred: [205, 92, 92, 255],
  indigo: [75, 0, 130, 255],
  ivory: [255, 255, 240, 255],
  khaki: [240, 230, 140, 255],
  lavender: [230, 230, 250, 255],
  lavenderblush: [255, 240, 245, 255],
  lawngreen: [124, 252, 0, 255],
  lemonchiffon: [255, 250, 205, 255],
  lightblue: [173, 216, 230, 255],
  lightcoral: [240, 128, 128, 255],
  lightcyan: [224, 255, 255, 255],
  lightgoldenrodyellow: [250, 250, 210, 255],
  lightgray: [211, 211, 211, 255],
  lightgreen: [144, 238, 144, 255],
  lightgrey: [211, 211, 211, 255],
  lightpink: [255, 182, 193, 255],
  lightsalmon: [255, 160, 122, 255],
  lightseagreen: [32, 178, 170, 255],
  lightskyblue: [135, 206, 250, 255],
  lightslategray: [119, 136, 153, 255],
  lightslategrey: [119, 136, 153, 255],
  lightsteelblue: [176, 196, 222, 255],
  lightyellow: [255, 255, 224, 255],
  lime: [0, 255, 0, 255],
  limegreen: [50, 205, 50, 255],
  linen: [250, 240, 230, 255],
  magenta: [255, 0, 255, 255],
  maroon: [128, 0, 0, 255],
  mediumaquamarine: [102, 205, 170, 255],
  mediumblue: [0, 0, 205, 255],
  mediumorchid: [186, 85, 211, 255],
  mediumpurple: [147, 112, 219, 255],
  mediumseagreen: [60, 179, 113, 255],
  mediumslateblue: [123, 104, 238, 255],
  mediumspringgreen: [0, 250, 154, 255],
  mediumturquoise: [72, 209, 204, 255],
  mediumvioletred: [199, 21, 133, 255],
  midnightblue: [25, 25, 112, 255],
  mintcream: [245, 255, 250, 255],
  mistyrose: [255, 228, 225, 255],
  moccasin: [255, 228, 181, 255],
  navajowhite: [255, 222, 173, 255],
  navy: [0, 0, 128, 255],
  oldlace: [253, 245, 230, 255],
  olive: [128, 128, 0, 255],
  olivedrab: [107, 142, 35, 255],
  orange: [255, 165, 0, 255],
  orangered: [255, 69, 0, 255],
  orchid: [218, 112, 214, 255],
  palegoldenrod: [238, 232, 170, 255],
  palegreen: [152, 251, 152, 255],
  paleturquoise: [175, 238, 238, 255],
  palevioletred: [219, 112, 147, 255],
  papayawhip: [255, 239, 213, 255],
  peachpuff: [255, 218, 185, 255],
  peru: [205, 133, 63, 255],
  pink: [255, 192, 203, 255],
  plum: [221, 160, 221, 255],
  powderblue: [176, 224, 230, 255],
  purple: [128, 0, 128, 255],
  rebeccapurple: [102, 51, 153, 255],
  red: [255, 0, 0, 255],
  rosybrown: [188, 143, 143, 255],
  royalblue: [65, 105, 225, 255],
  saddlebrown: [139, 69, 19, 255],
  salmon: [250, 128, 114, 255],
  sandybrown: [244, 164, 96, 255],
  seagreen: [46, 139, 87, 255],
  seashell: [255, 245, 238, 255],
  sienna: [160, 82, 45, 255],
  silver: [192, 192, 192, 255],
  skyblue: [135, 206, 235, 255],
  slateblue: [106, 90, 205, 255],
  slategray: [112, 128, 144, 255],
  slategrey: [112, 128, 144, 255],
  snow: [255, 250, 250, 255],
  springgreen: [0, 255, 127, 255],
  steelblue: [70, 130, 180, 255],
  tan: [210, 180, 140, 255],
  teal: [0, 128, 128, 255],
  thistle: [216, 191, 216, 255],
  tomato: [255, 99, 71, 255],
  turquoise: [64, 224, 208, 255],
  violet: [238, 130, 238, 255],
  wheat: [245, 222, 179, 255],
  white: [255, 255, 255, 255],
  whitesmoke: [245, 245, 245, 255],
  yellow: [255, 255, 0, 255],
  yellowgreen: [154, 205, 50, 255],
};

function parseHexColor(hex: string): RGBA {
  const h = hex.replace("#", "");
  if (h.length === 3) {
    return [
      parseInt(h[0] + h[0], 16),
      parseInt(h[1] + h[1], 16),
      parseInt(h[2] + h[2], 16),
      255,
    ];
  }
  if (h.length === 6) {
    return [
      parseInt(h.slice(0, 2), 16),
      parseInt(h.slice(2, 4), 16),
      parseInt(h.slice(4, 6), 16),
      255,
    ];
  }
  if (h.length === 12) {
    return [
      parseInt(h.slice(0, 2), 16),
      parseInt(h.slice(4, 6), 16),
      parseInt(h.slice(8, 10), 16),
      255,
    ];
  }
  return [0, 0, 0, 255];
}

function extractColorSpec(spec: string, type: string): string | null {
  const re = new RegExp(`(?:^|\\s)${type}\\s+(\\S+)(?=\\s+[cgms]\\s|$)`, "i");
  const re2 = new RegExp(`(?:^|\\s)${type}\\s+(\\S+)`, "i");
  const match = re.exec(spec) ?? re2.exec(spec);
  return match ? match[1] : null;
}

function parseXPM(xpmText: string): {
  width: number;
  height: number;
  data: Uint8ClampedArray;
} {
  const lines: string[] = [];
  const quoted = /"((?:[^"\\]|\\.)*)"/g;
  let m: RegExpExecArray | null;
  while ((m = quoted.exec(xpmText)) !== null) {
    lines.push(m[1]);
  }
  if (lines.length === 0) throw new Error("Invalid XPM: no quoted data found.");

  const headerParts = lines[0].trim().split(/\s+/);
  const width = parseInt(headerParts[0], 10);
  const height = parseInt(headerParts[1], 10);
  const ncolors = parseInt(headerParts[2], 10);
  const cpp = parseInt(headerParts[3], 10);

  if ([width, height, ncolors, cpp].some((v) => isNaN(v) || v <= 0)) {
    throw new Error("Invalid XPM header values.");
  }
  if (cpp > 4)
    throw new Error(
      "XPM files with more than 4 chars-per-pixel are not supported.",
    );

  const colorMap: Record<string, RGBA> = Object.create(null);

  for (let i = 1; i <= ncolors; i++) {
    const line = lines[i];
    if (line.length < cpp) continue;

    const key = line.substring(0, cpp);
    const spec = line.substring(cpp);

    const colorValue =
      extractColorSpec(spec, "c") ??
      extractColorSpec(spec, "g") ??
      extractColorSpec(spec, "m") ??
      extractColorSpec(spec, "s");

    if (!colorValue || colorValue.toLowerCase() === "none") {
      colorMap[key] = [0, 0, 0, 0];
    } else if (colorValue.startsWith("#")) {
      colorMap[key] = parseHexColor(colorValue);
    } else {
      colorMap[key] = X11_COLORS[colorValue.toLowerCase()] ?? [0, 0, 0, 255];
    }
  }

  const data = new Uint8ClampedArray(width * height * 4);
  const pixelLines = lines.slice(1 + ncolors);
  const fallback: RGBA = [0, 0, 0, 255];

  for (let y = 0; y < height; y++) {
    const row = pixelLines[y] ?? "";
    const rowBase = y * width * 4;
    for (let x = 0; x < width; x++) {
      const pixel = row.substring(x * cpp, x * cpp + cpp);
      const [r, g, b, a] = colorMap[pixel] ?? fallback;
      const idx = rowBase + x * 4;
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = a;
    }
  }

  return { width, height, data };
}

async function xpmToBlob(
  xpm: { width: number; height: number; data: Uint8ClampedArray },
  mimeType: string,
): Promise<Blob> {
  const buffer = new ArrayBuffer(xpm.data.length);
  const safeData = new Uint8ClampedArray(buffer);
  safeData.set(xpm.data);
  const imageData = new ImageData(safeData, xpm.width, xpm.height);
  let blob: Blob | null = null;

  if (typeof OffscreenCanvas !== "undefined") {
    const oc = new OffscreenCanvas(xpm.width, xpm.height);
    const ctx = oc.getContext("2d")!;
    ctx.putImageData(imageData, 0, 0);
    blob = await oc.convertToBlob({ type: mimeType, quality: 1 });
  } else {
    const canvas = document.createElement("canvas");
    canvas.width = xpm.width;
    canvas.height = xpm.height;
    const ctx = canvas.getContext("2d")!;
    ctx.putImageData(imageData, 0, 0);
    blob = await new Promise<Blob | null>((res) =>
      canvas.toBlob(res, mimeType, 1),
    );
  }

  if (!blob) throw new Error(`Browser cannot encode to ${mimeType}.`);
  return blob;
}

function encodeXPM(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  name: string,
): string {
  const identifier = name.replace(/[^a-zA-Z0-9_]/g, "_") + "_xpm";
  const colorToKey = new Map<string, string>();
  const colorTable: Array<{ key: string; hex: string }> = [];

  const CHARS =
    " !#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`abcdefghijklmnopqrstuvwxyz{|}~";

  function indexToKey(idx: number, cpp: number): string {
    if (cpp === 1) return CHARS[idx];
    return CHARS[Math.floor(idx / CHARS.length)] + CHARS[idx % CHARS.length];
  }

  for (let i = 0; i < width * height; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    const a = data[i * 4 + 3];
    const colorId =
      a < 128
        ? "none"
        : `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
    if (!colorToKey.has(colorId)) {
      colorToKey.set(colorId, "");
    }
  }

  const uniqueCount = colorToKey.size;
  const cpp = uniqueCount <= CHARS.length ? 1 : 2;
  const maxColors = cpp === 1 ? CHARS.length : CHARS.length * CHARS.length;

  if (uniqueCount > maxColors) {
    throw new Error(
      `Image has too many unique colors (${uniqueCount}) for XPM format (max ${maxColors}).`,
    );
  }

  let keyIdx = 0;
  for (const [colorId] of colorToKey) {
    const key = indexToKey(keyIdx++, cpp);
    colorToKey.set(colorId, key);
    colorTable.push({ key, hex: colorId });
  }

  const lines: string[] = [];
  lines.push("/* XPM */");
  lines.push(`static char * ${identifier}[] = {`);
  lines.push(`"${width} ${height} ${uniqueCount} ${cpp}",`);

  for (const { key, hex } of colorTable) {
    const colorSpec = hex === "none" ? "None" : hex.toUpperCase();
    lines.push(`"${key.padEnd(cpp)}	c ${colorSpec}",`);
  }

  for (let y = 0; y < height; y++) {
    let row = "";
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      const colorId =
        a < 128
          ? "none"
          : `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
      row += colorToKey.get(colorId)!;
    }
    const isLast = y === height - 1;
    lines.push(`"${row}"${isLast ? "" : ","}`);
  }

  lines.push("};");
  return lines.join("\n");
}

function buildIcoBlob(buffers: ArrayBuffer[], sizes: number[]): Blob {
  const headerSize = 6;
  const directoryEntrySize = 16;
  const directoryTotalSize = directoryEntrySize * sizes.length;
  const totalDataSize = buffers.reduce((acc, buf) => acc + buf.byteLength, 0);

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

  return new Blob([icoBuffer], { type: "image/x-icon" });
}

function loadImageFromBlob(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load intermediate image."));
    };
    img.src = url;
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

export function convertImageFormat({
  file,
  extension,
}: ConvertImageProps): Promise<File> {
  return new Promise((resolve, reject) => {
    if (!(file instanceof File)) {
      return reject(new Error("The file must be a File."));
    }

    if (!file.type.startsWith("image/") && !file.name.endsWith(".xpm")) {
      return reject(new Error("The file must be an image."));
    }

    const mimeTypeMap: Record<(typeof TARGET_IMG_EXTENSION)[number], string> = {
      avif: "image/avif",
      ico: "image/x-icon",
      jpeg: "image/jpeg",
      jpg: "image/jpeg",
      png: "image/png",
      svg: "image/svg+xml",
      webp: "image/webp",
      xpm: "image/x-xpixmap",
    };

    const targetMimeType = mimeTypeMap[extension];
    const originalName = file.name;
    const nameWithoutExt =
      originalName.substring(0, originalName.lastIndexOf(".")) || originalName;
    const newName = `${nameWithoutExt}.${extension}`;

    if (
      file.name.toLowerCase().endsWith(".xpm") ||
      file.type === "image/x-xpixmap"
    ) {
      file
        .text()
        .then(async (xpmText) => {
          const xpm = parseXPM(xpmText);

          if (extension === "xpm") {
            return resolve(new File([file], newName, { type: targetMimeType }));
          }

          if (extension === "svg") {
            const imageData = {
              width: xpm.width,
              height: xpm.height,
              data: xpm.data,
            };
            const svgString: string = await new Promise((res, rej) => {
              try {
                const svg = ImageTracer.imagedataToSVG(imageData, "detailed");
                res(svg);
              } catch (e) {
                rej(
                  new Error(
                    e instanceof Error ? e.message : "SVG tracing failed.",
                  ),
                );
              }
            });
            const blob = new Blob([svgString], { type: targetMimeType });
            return resolve(new File([blob], newName, { type: targetMimeType }));
          }

          if (extension === "ico") {
            const blob = await xpmToBlob(xpm, "image/png");
            const imgEl = await loadImageFromBlob(blob);
            const buffers = await Promise.all(
              [256, 48, 32, 16].map((s) => generatePngBuffer(imgEl, s)),
            );
            const icoBlob = buildIcoBlob(buffers, [256, 48, 32, 16]);
            return resolve(
              new File([icoBlob], newName, { type: targetMimeType }),
            );
          }

          const blob = await xpmToBlob(xpm, targetMimeType);
          resolve(new File([blob], newName, { type: targetMimeType }));
        })
        .catch((err) =>
          reject(
            new Error(
              err instanceof Error ? err.message : "Failed to read XPM file.",
            ),
          ),
        );
      return;
    }

    if (extension === "xpm") {
      const srcUrl = URL.createObjectURL(file);
      const img = new Image();

      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d")!;
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0);

          const { data, width, height } = ctx.getImageData(
            0,
            0,
            img.width,
            img.height,
          );
          URL.revokeObjectURL(srcUrl);

          const xpmContent = encodeXPM(data, width, height, nameWithoutExt);
          const blob = new Blob([xpmContent], { type: targetMimeType });
          resolve(new File([blob], newName, { type: targetMimeType }));
        } catch (err) {
          URL.revokeObjectURL(srcUrl);
          reject(
            new Error(
              err instanceof Error ? err.message : "Error encoding XPM.",
            ),
          );
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(srcUrl);
        reject(new Error("The file cannot be loaded."));
      };

      img.src = srcUrl;
      return;
    }

    const srcUrl = URL.createObjectURL(file);

    if (extension === "svg") {
      try {
        ImageTracer.imageToSVG(
          srcUrl,
          (svgString: string) => {
            URL.revokeObjectURL(srcUrl);
            const blob = new Blob([svgString], { type: targetMimeType });
            resolve(new File([blob], newName, { type: targetMimeType }));
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
          URL.revokeObjectURL(srcUrl);
          const icoBlob = buildIcoBlob(buffers, sizes);
          return resolve(
            new File([icoBlob], newName, { type: targetMimeType }),
          );
        }

        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d")!;

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
            resolve(new File([blob], newName, { type: targetMimeType }));
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
