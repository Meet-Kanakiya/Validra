import * as React from "react";
import { UploadCloud, Image as ImageIcon, Trash2, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/shared/ui/button";
import { cn } from "@/lib/utils";

export interface ImageUploaderProps {
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
  disabled?: boolean;
  className?: string;
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB matching backend constraint
const ACCEPTED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/bmp",
];
const ACCEPTED_EXTENSIONS = ".jpg, .jpeg, .png, .webp, .bmp";

function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Accessible ImageUploader with drag-and-drop, format/size validation, and preview.
 */
export function ImageUploader({
  selectedFile,
  onFileSelect,
  disabled = false,
  className,
}: ImageUploaderProps) {
  const [isDragOver, setIsDragOver] = React.useState(false);
  const [validationError, setValidationError] = React.useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Compute preview URL safely without setting state in effect
  const previewUrl = React.useMemo(() => {
    if (!selectedFile) return null;
    return URL.createObjectURL(selectedFile);
  }, [selectedFile]);

  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const validateAndProcessFile = (file: File): boolean => {
    setValidationError(null);

    if (!ACCEPTED_MIME_TYPES.includes(file.type.toLowerCase())) {
      setValidationError(
        "Unsupported image format. Please upload JPEG, PNG, WEBP, or BMP."
      );
      return false;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setValidationError(
        `File exceeds maximum limit of 5MB (${formatBytes(file.size)}).`
      );
      return false;
    }

    onFileSelect(file);
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndProcessFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndProcessFile(file);
    }
  };

  const handleRemove = () => {
    onFileSelect(null);
    setValidationError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleTriggerInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("space-y-4", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_EXTENSIONS}
        onChange={handleFileChange}
        className="sr-only"
        disabled={disabled}
        aria-label="Upload commodity package image"
      />

      {/* Validation Error Alert */}
      {validationError && (
        <div
          role="alert"
          className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" aria-hidden="true" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Preview View when file is selected */}
      {selectedFile && previewUrl ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            {/* Image Preview Thumbnail */}
            <div className="relative w-full sm:w-48 h-48 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Selected package preview"
                className="w-full h-full object-contain"
              />
            </div>

            {/* File Info & Replace/Remove Actions */}
            <div className="flex-1 min-w-0 space-y-2 w-full">
              <div className="flex items-center gap-2 text-emerald-700 text-xs font-semibold uppercase tracking-wider">
                <ImageIcon className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Image Ready for Inspection</span>
              </div>
              <h4 className="text-sm font-semibold text-slate-900 truncate">
                {selectedFile.name}
              </h4>
              <p className="text-xs text-slate-500 font-mono">
                Size: {formatBytes(selectedFile.size)} • Type: {selectedFile.type || "image"}
              </p>

              <div className="pt-3 flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleTriggerInput}
                  disabled={disabled}
                  className="gap-1.5 text-xs h-8"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Replace image</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRemove}
                  disabled={disabled}
                  className="gap-1.5 text-xs h-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 hover:border-rose-300"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty Drag & Drop Dropzone */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleTriggerInput}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleTriggerInput();
            }
          }}
          tabIndex={disabled ? -1 : 0}
          role="button"
          aria-label="Upload package label image. Drag and drop file or click to select."
          className={cn(
            "relative flex flex-col items-center justify-center p-8 sm:p-12 rounded-2xl border-2 border-dashed transition-all cursor-pointer select-none text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30",
            isDragOver
              ? "border-emerald-600 bg-emerald-50/50"
              : "border-slate-300 hover:border-emerald-500 bg-slate-50/60 hover:bg-emerald-50/20",
            disabled && "opacity-50 pointer-events-none cursor-not-allowed"
          )}
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mb-4">
            <UploadCloud className="w-6 h-6" aria-hidden="true" />
          </div>

          <h3 className="text-sm sm:text-base font-semibold text-slate-900">
            Click to upload or drag and drop package photo
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">
            Ensure MRP, Net Quantity, Mfg Date, and Manufacturer declarations are clearly visible.
          </p>

          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-[11px] font-mono text-slate-500 border border-slate-200 shadow-2xs">
            <span>JPG, PNG, WEBP, BMP</span>
            <span>•</span>
            <span>Max 5MB</span>
          </div>
        </div>
      )}
    </div>
  );
}
