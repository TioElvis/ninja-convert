import Image from "next/image";
import { Fragment } from "react/jsx-runtime";

import { Dropzone } from "@/components/dropzone";
import { Card, CardContent } from "@/components/ui/card";
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
        </div>
        <Dropzone />
        <Card className="w-full flex-1">
          <CardContent>{/* TODO: Table */}</CardContent>
        </Card>
        <div className="w-full"></div>
      </MaxWidthWrapper>
    </Fragment>
  );
}
