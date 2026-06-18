"use client";
import { createContext, useState } from "react";

interface Context {
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
}

export const FilesContext = createContext<Context | null>(null);

interface Props {
  children: React.ReactNode;
}

export function FilesProvider({ children }: Props) {
  const [files, setFiles] = useState<File[]>([]);

  return (
    <FilesContext.Provider value={{ files, setFiles }}>
      {children}
    </FilesContext.Provider>
  );
}
