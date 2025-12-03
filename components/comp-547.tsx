"use client";

import { AlertCircleIcon, UploadIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  formatBytes,
  useFileUpload,
} from "@/hooks/use-file-upload";

// Create some dummy initial files
const initialFiles = [
  {
    id: "image-01-123456789",
    name: "image-01.jpg",
    size: 1528737,
    type: "image/jpeg",
    url: "https://picsum.photos/1000/800?grayscale&random=1",
  },
  {
    id: "image-02-123456789",
    name: "image-02.jpg",
    size: 2345678,
    type: "image/jpeg",
    url: "https://picsum.photos/1000/800?grayscale&random=2",
  },
  {
    id: "image-03-123456789",
    name: "image-03.jpg",
    size: 3456789,
    type: "image/jpeg",
    url: "https://picsum.photos/1000/800?grayscale&random=3",
  },
];

interface Props {
  value?: File | string | null;
  onChange: (file: File | null) => void
  name: string
  maxSizeMB?: number;
  maxFiles?: number;
}

export default function FilesUpload({
  value,
  onChange,
  name,
  maxSizeMB=2,
  maxFiles=2
}:Props) {
  const maxSize = maxSizeMB * 1024 * 1024; // 5MB default

  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      clearFiles,
      getInputProps,
    },
  ] = useFileUpload({
    accept: "image/svg+xml,image/png,image/jpeg,image/jpg,image/gif", //Can we make it in props like images or images and pdf, docx for example ?
    initialFiles, //Convert value here
    maxFiles,
    maxSize,
    multiple: true,
  });

  return (
    <div className="flex flex-col gap-2">
      {/* Drop area */}
      <div
        className="relative flex flex-col items-center not-data-[files]:justify-center overflow-hidden rounded-xl border border-input border-dashed px-4 py-2 transition-colors has-[input:focus]:border-ring has-[input:focus]:ring-[3px] has-[input:focus]:ring-ring/50 data-[dragging=true]:bg-accent/50"
        data-dragging={isDragging || undefined}
        data-files={files.length > 0 || undefined}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          {...getInputProps()}
          aria-label="Upload image file"
          className="sr-only"
          name={name}
        />
        <div className="flex flex-col gap-1 items-center justify-center text-center">
          <div
            aria-hidden="true"
            className="flex size-10 shrink-0 items-center justify-center rounded-full border border-input bg-transparent"
          >
            <UploadIcon size={16} className="text-gray-400" />
          </div>
          <p className="font-medium text-sm">{"Déposez vos fichiers ici"}</p>
          <p className="text-gray-400 text-[10px]">
            {`SVG, PNG, JPG or GIF (max. ${maxSizeMB}MB)`}
          </p>
          <Button onClick={(e)=>{e.preventDefault(); openFileDialog()}} size={"sm"} variant="outline" className="text-xs!">
            {"Importer un fichier"}
          </Button>
        </div>
      </div>

      {errors.length > 0 && (
        <div
          className="flex items-center gap-1 text-destructive text-xs"
          role="alert"
        >
          <AlertCircleIcon className="size-3 shrink-0" />
          <span>{errors[0]}</span>
        </div>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              className="flex items-center justify-between gap-2 rounded-lg border bg-background p-2 pe-3"
              key={file.id}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="aspect-square shrink-0 rounded bg-accent">
                  <img
                    alt={file.file.name}
                    className="size-10 rounded-[inherit] object-cover"
                    src={file.preview}
                  />
                </div>
                <div className="flex min-w-0 flex-col gap-0.5">
                  <p className="truncate font-medium text-[13px]">
                    {file.file.name}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {formatBytes(file.file.size)}
                  </p>
                </div>
              </div>

              <Button
                aria-label="Remove file"
                className="-me-2 size-8 text-muted-foreground/80 hover:bg-transparent hover:text-foreground"
                onClick={() => removeFile(file.id)}
                size="icon"
                variant="ghost"
              >
                <XIcon aria-hidden="true" />
              </Button>
            </div>
          ))}

          {/* Remove all files button */}
          {files.length > 1 && (
            <div>
              <Button onClick={clearFiles} size="sm" variant="outline">
                {"Tout supprimer"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
