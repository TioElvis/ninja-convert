import { toast } from "sonner";
import { useRef, useState } from "react";

import {
  ALLOW_CONVERT_MIME_TYPES,
  ALLOW_MIME_TYPES,
  MIME_TYPE_MAP,
} from "@/lib/extensions";
import { convertImageToPdf, convertPdfToDocx } from "@/lib/pdf";
import { convertDocxToPdf, convertImageToDocx } from "@/lib/docx";
import { convertImageFormat, TARGET_IMG_EXTENSION } from "@/lib/img";

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

    try {
      let convertedFile: File;

      if (
        targetExtension === "pdf" &&
        TARGET_IMG_EXTENSION.includes(fileExtension)
      ) {
        convertedFile = await convertImageToPdf({ file });
      }

      if (
        targetExtension === "pdf" &&
        (fileExtension === "doc" || fileExtension === "docx")
      ) {
        convertedFile = await convertPdfToDocx({ file });
      }

      if (
        (targetExtension === "doc" || targetExtension === "docx") &&
        TARGET_IMG_EXTENSION.includes(fileExtension)
      ) {
        convertedFile = await convertImageToDocx({ file });
      }

      if (
        (targetExtension === "doc" || targetExtension === "docx") &&
        fileExtension === "pdf"
      ) {
        convertedFile = await convertDocxToPdf({ file });
      }

      if (TARGET_IMG_EXTENSION.includes(targetExtension)) {
        convertedFile = await convertImageFormat({
          file,
          extension: targetExtension,
        });
      }

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
