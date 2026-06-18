import { useContext } from "react";

import { FilesContext } from "@/context/files";

export function useFiles() {
  const context = useContext(FilesContext);

  if (!context) throw new Error("useFiles must be used within FilesProvider.");

  return context;
}
