import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function downloadFile(file: File | Blob | null, customName?: string) {
  if (!file) return;

  const url = URL.createObjectURL(file);
  const link = document.createElement("a");

  link.href = url;
  link.download =
    customName || (file instanceof File ? file.name : "downloaded_file");

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
