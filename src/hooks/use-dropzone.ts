import { toast } from "sonner";
import { useRef, useState } from "react";

import {
  ALLOW_CONVERT_MIME_TYPES,
  ALLOW_MIME_TYPES,
  MIME_TYPE_MAP,
} from "@/lib/extensions";

export function useDropzone() {
  const [file, setFile] = useState<File | null>(null);
  const [targetExtension, setTargetExtension] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const clear = () => {
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

  const handleConvert = () => {};

  return {
    handleFileChange,
    fileInputRef,
    file,
    fileExtension,
    setTargetExtension,
    dynamicItems,
    targetExtension,
    handleConvert,
  };
}
