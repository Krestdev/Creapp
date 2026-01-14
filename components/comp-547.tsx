"use client";

import { AlertCircleIcon, UploadIcon, XIcon } from "lucide-react";
import { useEffect, useMemo } from "react";

import { Button } from "@/components/ui/button";
import {
  formatBytes,
  useFileUpload,
  type FileMetadata,
} from "@/hooks/use-file-upload";

interface Props {
  value?: (File | string)[] | File | string | null;
  onChange: (files: (File | string)[] | null) => void;
  name: string;
  maxSizeMB?: number;
  maxFiles?: number;
  accept?: string;
  multiple?: boolean;
  acceptTypes?: "images" | "documents" | "all";
}

const getAcceptString = (
  acceptTypes?: Props["acceptTypes"],
  customAccept?: string
): string => {
  if (customAccept) return customAccept;

  switch (acceptTypes) {
    case "images":
      return "image/*";
    case "documents":
      return ".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx";
    case "all":
      return "image/*,.pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx";
    default:
      return "image/*";
  }
};

const getMimeTypeFromFilename = (filename: string): string => {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  switch (ext) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "gif":
      return "image/gif";
    case "pdf":
      return "application/pdf";
    default:
      return "application/octet-stream";
  }
};

// Fonction pour obtenir l'URL d'affichage correcte
const getDisplayUrl = (url: string): string => {
  if (!url || typeof url !== "string") return url;

  // Si c'est déjà une URL complète ou blob
  if (
    url.startsWith("http") ||
    url.startsWith("blob:") ||
    url.startsWith("data:")
  ) {
    return url;
  }

  // Si c'est juste un nom de fichier
  const apiUrl = process.env.NEXT_PUBLIC_API || "";

  return `${apiUrl}/uploads/${url}`;
};

const valueToInitialFiles = (value: Props["value"]): FileMetadata[] => {
  if (!value) return [];

  const convertItem = (item: File | string, index: number): FileMetadata => {
    if (typeof item === "string") {
      const filename = item.split("/").pop() || `file-${index}`;
      const displayUrl = getDisplayUrl(item);

      return {
        id: `existing-${index}-${Date.now()}`,
        name: filename,
        size: 0,
        type: getMimeTypeFromFilename(filename),
        url: displayUrl,
      };
    } else {
      return {
        id: `file-${index}-${Date.now()}`,
        name: item.name,
        size: item.size,
        type: item.type,
        url: URL.createObjectURL(item),
      };
    }
  };

  if (Array.isArray(value)) {
    return value.map(convertItem);
  }

  return [convertItem(value, 0)];
};

export default function FilesUpload({
  value,
  onChange,
  name,
  maxSizeMB = 2,
  maxFiles = 2,
  accept,
  multiple = true,
  acceptTypes = "images",
}: Props) {
  const maxSize = maxSizeMB * 1024 * 1024;
  const acceptString = accept || getAcceptString(acceptTypes);

  const initialFiles = useMemo(() => {
    return valueToInitialFiles(value);
  }, [value]);

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
    accept: acceptString,
    initialFiles,
    maxFiles,
    maxSize,
    multiple,
  });

  useEffect(() => {
    if (files.length === 0) {
      onChange([]);
      return;
    }

    const extractedItems = files
      .map((item) => {
        if (item.file instanceof File) {
          return item.file;
        }
        if (typeof item.file === "object" && "url" in item.file) {
          // Retourner le nom de fichier original, pas l'URL complète
          const fileMetadata = item.file as FileMetadata;
          const fullUrl = fileMetadata.url;

          // Extraire juste le nom de fichier de l'URL
          if (fullUrl.includes("/uploads/")) {
            return fullUrl.split("/uploads/").pop() || fullUrl;
          }
          return fullUrl.split("/").pop() || fullUrl;
        }
        return null;
      })
      .filter(Boolean) as (File | string)[];

    if (multiple) {
      onChange(extractedItems);
    } else {
      onChange(extractedItems.length > 0 ? [extractedItems[0]] : []);
    }
  }, [files, onChange, multiple]);

  useEffect(() => {
    return () => {
      files.forEach((item) => {
        if (item.preview && item.preview.startsWith("blob:")) {
          URL.revokeObjectURL(item.preview);
        }
      });
    };
  }, [files]);

  return (
    <div className="w-full max-w-full flex flex-col gap-4">
      {/* Drop area */}
      <div
        className="relative flex flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-input px-4 py-2 transition-colors data-[dragging=true]:border-primary data-[dragging=true]:bg-primary/5"
        data-dragging={isDragging || undefined}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          {...getInputProps()}
          aria-label="Upload files"
          className="sr-only"
          name={name}
        />

        <div className="flex flex-col items-center gap-1 text-center">
          {/* <div className="rounded-full border border-gray-100 p-3">
            <UploadIcon size={16} className="text-gray-400" />
          </div> */}

          {/* <div className="space-y-1 text-sm text-gray-900">
            <p className="font-medium font-mono">
              {"Glissez-déposez vos fichiers ici"}
            </p>
            <p>{"ou"}</p>
          </div> */}
          <p className="font-medium font-mono text-[14px]">
            {"Glissez-déposez vos fichiers ici ou "}
            <Button
              onClick={(e) => {
                e.preventDefault();
                openFileDialog();
              }}
              variant="outline"
              size={"sm"}
            >
              {"Parcourir les fichiers"}
            </Button>
          </p>

          <p className="text-xs text-gray-400">
            {acceptTypes === "images" && `PNG, JPG, GIF jusqu'à ${maxSizeMB}MB`}
            {acceptTypes === "documents" &&
              `PDF, DOC, XLS jusqu'à ${maxSizeMB}MB`}
            {acceptTypes === "all" && `Tous fichiers jusqu'à ${maxSizeMB}MB`}
            {maxFiles > 1 && ` • Maximum ${maxFiles} fichiers`}
          </p>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircleIcon className="size-4" />
            <p className="text-sm font-medium">{errors[0]}</p>
          </div>
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              {files.length} fichier{files.length > 1 ? "s" : ""}
            </p>
            <Button onClick={clearFiles} variant="delete" size="sm">
              {"Tout supprimer"}
            </Button>
          </div>

          <div className="space-y-2">
            {files.map((item) => {
              const file = item.file;
              const isFile = file instanceof File;
              const fileName = isFile ? file.name : file.name;
              const fileSize = isFile ? file.size : file.size;
              const fileType = isFile ? file.type : file.type;
              const previewUrl = item.preview;

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-lg border bg-white p-3"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    {fileType.startsWith("image/") ? (
                      <div className="size-12 shrink-0 overflow-hidden rounded border">
                        <img
                          src={previewUrl}
                          alt={fileName}
                          className="size-full object-cover"
                          crossOrigin="anonymous" // Ajouter cet attribut pour CORS
                          onError={(e) => {
                            e.currentTarget.src = `data:image/svg+xml;base64,${btoa(
                              `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`
                            )}`;
                          }}
                        />
                      </div>
                    ) : (
                      <div className="flex size-12 shrink-0 items-center justify-center rounded border bg-gray-50">
                        <UploadIcon className="size-5 text-gray-400" />
                      </div>
                    )}

                    <div className="min-w-0 w-full">
                      <p className="line-clamp-1 text-sm font-medium">
                        {fileName}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{formatBytes(fileSize)}</span>
                        <span>•</span>
                        <span>
                          {fileType.split("/")[1]?.toUpperCase() || "FILE"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => removeFile(item.id)}
                    size="icon"
                    variant="ghost"
                    className="size-8 shrink-0 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <XIcon size={16} />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
