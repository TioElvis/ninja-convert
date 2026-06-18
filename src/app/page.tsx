import Image from "next/image";
import { Fragment } from "react/jsx-runtime";

import { FilesProvider } from "@/context/files";

import { Dropzone } from "@/components/dropzone";
import { FilesTable } from "@/components/files-table";
import { MaxWidthWrapper } from "@/components/max-width-wrapper";

export default function Page() {
  return (
    <Fragment>
      <header className="w-full h-14 flex items-center border-b border-border">
        <MaxWidthWrapper className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="logo" width={40} height={40} />
            <span className="font-bold text-primary">NinjaConvert</span>
          </div>
        </MaxWidthWrapper>
      </header>
      <MaxWidthWrapper className="flex-1 flex flex-col items-center py-4 gap-4">
        <div className="w-full">
          <h1 className="text-primary">Convert your files without problems</h1>
          <p className="text-muted-foreground">
            Convert your files quickly and securely — no uploads, no servers.
            Your files stay in your browser and are automatically removed when
            you close or refresh the page, so your data never leaves your
            device.
          </p>
        </div>
        <FilesProvider>
          <Dropzone />
          <FilesTable />
        </FilesProvider>
      </MaxWidthWrapper>
    </Fragment>
  );
}
