import "./globals.css";
import type { Metadata } from "next";
import { Roboto } from "next/font/google";

import { cn } from "@/lib/utils";

const roboto = Roboto({
  weight: ["100", "300", "400", "500", "700", "900"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NinjaConvert",
};

interface Props {
  children: React.ReactNode;
}

export default function Layout({ children }: Props) {
  return (
    <html lang="en">
      <body className={cn(roboto.className)}>{children}</body>
    </html>
  );
}
