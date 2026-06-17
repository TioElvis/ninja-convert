import "./globals.css";
import type { Metadata } from "next";
import { Roboto } from "next/font/google";

import { cn } from "@/lib/utils";

import { Toaster } from "@/components/ui/sonner";

const roboto = Roboto({
  weight: ["100", "300", "400", "500", "700", "900"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  creator: "Elvis Vera",
  title: {
    default: "NinjaConvert",
    template: "%s | NinjaConvert",
  },
  description:
    "Project to convert file into another extension without API, payment or other method unnecessary for you.",
  keywords: [
    "Elvis Vera",
    "TioElvis",
    "Files",
    "Convert",
    "Converter",
    "png",
    "jpeg",
    "jpg",
    "gif",
    "webp",
    "svg",
    "bmp",
    "tiff",
    "ico",
    "pdf",
    "doc",
    "docx",
    "txt",
    "rtf",
    "odt",
    "xls",
    "xlsx",
    "csv",
    "ods",
    "ppt",
    "pptx",
    "odp",
    "mp3",
    "wav",
    "ogg",
    "flac",
    "aac",
    "m4a",
    "mp4",
    "avi",
    "mov",
    "mkv",
    "webm",
    "wmv",
    "zip",
    "rar",
    "7z",
    "tar",
    "gz",
  ],
};

interface Props {
  children: React.ReactNode;
}

export default function Layout({ children }: Props) {
  return (
    <html lang="en">
      <body className={cn(roboto.className)}>
        <Toaster richColors />
        {children}
      </body>
    </html>
  );
}
