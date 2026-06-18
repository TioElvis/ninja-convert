import { toast } from "sonner";
import { useRef, useState } from "react";

import {
  ALLOW_CONVERT_MIME_TYPES,
  ALLOW_MIME_TYPES,
  MIME_TYPE_MAP,
} from "@/lib/extensions";
import {
  convertJpgJpegToAvif,
  convertJpgJpegToPng,
  convertJpgJpegToWebp,
} from "@/lib/jpg-jpeg";
import {
  convertPngToAvif,
  convertPngToJpgJpeg,
  convertPngToWebp,
} from "@/lib/png";
import {
  convertWebpToAvif,
  convertWebpToJpgJpeg,
  convertWebpToPng,
} from "@/lib/webp";
import {
  convertAvifToJpgJpeg,
  convertAvifToPng,
  convertAvifToWebp,
} from "@/lib/avif";
import { convertImageToPdf } from "@/lib/pdf";

import { useFiles } from "./use-files";

export function useDropzone() {
  const [loading, setLoading] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [targetExtension, setTargetExtension] = useState<string | null>(null);

  const { setFiles } = useFiles();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const clear = () => {
    setLoading(false);
    setFile(null);
    setTargetExtension("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];

    if (f) {
      setFile(f);
      setTargetExtension("");

      const mimetype = MIME_TYPE_MAP[f.type];

      if (!ALLOW_MIME_TYPES.includes(mimetype)) {
        toast.error(`Not allowed type ${mimetype} for now`);
        return clear();
      }

      return;
    }

    return clear();
  };

  const fileExtension = MIME_TYPE_MAP[file?.type ?? ""];
  const allowedConversions = ALLOW_CONVERT_MIME_TYPES[fileExtension] || [];

  const dynamicItems = allowedConversions.map((ext) => ({
    label: ext.toUpperCase(),
    value: ext,
  }));

  const handleConvert = async () => {
    setLoading(true);

    if (!file || !targetExtension) {
      toast.error("Please select a file and a target extension.");
      return;
    }

    const conversionStrategies: Record<string, () => Promise<File>> = {
      // PNG
      "png-jpg": () => convertPngToJpgJpeg({ file, extension: "jpg" }),
      "png-jpeg": () => convertPngToJpgJpeg({ file, extension: "jpeg" }),
      "png-webp": () => convertPngToWebp({ file }),
      "png-avif": () => convertPngToAvif({ file }),
      "png-pdf": () => convertImageToPdf({ file }),

      // JPG/JPEG
      "jpg-png": () => convertJpgJpegToPng({ file }),
      "jpeg-png": () => convertJpgJpegToPng({ file }),
      "jpg-webp": () => convertJpgJpegToWebp({ file }),
      "jpeg-webp": () => convertJpgJpegToWebp({ file }),
      "jpg-avif": () => convertJpgJpegToAvif({ file }),
      "jpeg-avif": () => convertJpgJpegToAvif({ file }),
      "jpg-pdf": () => convertImageToPdf({ file }),
      "jpeg-pdf": () => convertImageToPdf({ file }),

      // WEBP
      "webp-png": () => convertWebpToPng({ file }),
      "webp-jpg": () => convertWebpToJpgJpeg({ file, extension: "jpg" }),
      "webp-jpeg": () => convertWebpToJpgJpeg({ file, extension: "jpeg" }),
      "webp-avif": () => convertWebpToAvif({ file }),
      "webp-pdf": () => convertImageToPdf({ file }),

      // AVIF
      "avif-png": () => convertAvifToPng({ file }),
      "avif-jpg": () => convertAvifToJpgJpeg({ file, extension: "jpg" }),
      "avif-jpeg": () => convertAvifToJpgJpeg({ file, extension: "jpeg" }),
      "avif-webp": () => convertAvifToWebp({ file }),
      "avif-pdf": () => convertImageToPdf({ file }),
    };

    const strategyKey = `${fileExtension}-${targetExtension}`;
    const convertAction = conversionStrategies[strategyKey];

    if (!convertAction) {
      toast.error(
        `Conversion from ${fileExtension} to ${targetExtension} is not supported.`,
      );
      return clear();
    }

    try {
      const convertedFile = await convertAction();

      setFiles((prev) => [...prev, convertedFile]);
      toast.success("Converting file successfully");
    } catch (error) {
      console.error(error);
      toast.error("Error converting file.");
    }

    return clear();
  };

  return {
    handleFileChange,
    fileInputRef,
    file,
    setTargetExtension,
    dynamicItems,
    targetExtension,
    handleConvert,
    loading,
  };
}
