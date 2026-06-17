"use client";
import { useDropzone } from "@/hooks/use-dropzone";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

export function Dropzone() {
  const {
    handleFileChange,
    fileInputRef,
    file,
    setTargetExtension,
    dynamicItems,
    targetExtension,
    handleConvert,
    fileExtension,
  } = useDropzone();

  return (
    <Card className="w-full">
      <CardContent className="flex items-center gap-2">
        <Input
          type="file"
          id="custom-file-input"
          className="hidden"
          onChange={handleFileChange}
          ref={fileInputRef}
        />
        <Button
          nativeButton={false}
          className="flex-1 justify-start"
          render={
            <label htmlFor="custom-file-input">
              {file ? file.name : "Select file"}
            </label>
          }
        />
        {!file && <span>Select file</span>}
        {file && <span>{fileExtension}</span>}
        <span>to</span>
        <Select
          value={targetExtension}
          onValueChange={(e) => setTargetExtension(e)}
          disabled={!file || dynamicItems.length === 0}>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Extensions</SelectLabel>
              {dynamicItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button
          onClick={() => handleConvert()}
          disabled={!file || dynamicItems.length === 0 || !targetExtension}>
          Convert
        </Button>
      </CardContent>
    </Card>
  );
}
