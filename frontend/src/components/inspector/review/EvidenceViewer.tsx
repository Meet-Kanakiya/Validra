import * as React from "react";
import { ZoomIn, ZoomOut, Maximize2, Image as ImageIcon, ImageOff } from "lucide-react";
import { EvidenceItem } from "@/types/review";
import { Button } from "@/components/shared/ui/button";
import { cn } from "@/lib/utils";

export interface EvidenceViewerProps {
  images: EvidenceItem[];
  className?: string;
}

/**
 * EvidenceViewer component allowing inspectors to zoom, pan, and review package photography.
 */
export function EvidenceViewer({ images, className }: EvidenceViewerProps) {
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [zoomLevel, setZoomLevel] = React.useState(1);
  const [imageError, setImageError] = React.useState(false);

  const activeImage = images[selectedIndex] || null;

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 2.5));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.75));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  return (
    <section
      aria-labelledby="evidence-viewer-title"
      className={cn(
        "rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between",
        className
      )}
    >
      {/* Header with Zoom Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h2
            id="evidence-viewer-title"
            className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight"
          >
            Package Evidence Viewer
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Original scan and cropped declaration bounding boxes
          </p>
        </div>

        {/* Zoom Control Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleZoomOut}
            disabled={zoomLevel <= 0.75 || !activeImage?.imageUrl || imageError}
            className="h-7 w-7 p-0 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            aria-label="Zoom out evidence image"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </Button>
          <span className="text-[11px] font-mono text-slate-600 px-1 select-none">
            {Math.round(zoomLevel * 100)}%
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleZoomIn}
            disabled={zoomLevel >= 2.5 || !activeImage?.imageUrl || imageError}
            className="h-7 w-7 p-0 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            aria-label="Zoom in evidence image"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResetZoom}
            disabled={zoomLevel === 1 || !activeImage?.imageUrl || imageError}
            className="h-7 w-7 p-0 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            aria-label="Reset zoom level to 100%"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Main Image Viewport */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] my-4 rounded-xl bg-slate-950 border border-slate-200 overflow-hidden flex items-center justify-center">
        {imageError || !activeImage || !activeImage.imageUrl ? (
          <div className="flex flex-col items-center justify-center text-center p-6 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center">
              <ImageOff className="w-5 h-5" aria-hidden="true" />
            </div>
            <p className="text-xs font-medium text-slate-800">
              Evidence Image Preview Unavailable
            </p>
            <p className="text-[11px] text-slate-500 max-w-xs leading-relaxed">
              Original scan image stored on server disk. Check server upload storage.
            </p>
          </div>
        ) : (
          <div className="w-full h-full overflow-auto flex items-center justify-center p-2 cursor-grab active:cursor-grabbing">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeImage.imageUrl}
              alt={activeImage.title}
              onError={() => setImageError(true)}
              style={{ transform: `scale(${zoomLevel})` }}
              className="max-h-full max-w-full object-contain transition-transform duration-200 select-none"
            />
          </div>
        )}
      </div>

      {/* Thumbnails list if multiple evidence crops exist */}
      {images.length > 1 && (
        <div className="flex items-center gap-2 pt-2 overflow-x-auto pb-1">
          {images.map((img, idx) => (
            <button
              key={img.id}
              type="button"
              onClick={() => {
                setSelectedIndex(idx);
                setImageError(false);
                setZoomLevel(1);
              }}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors shrink-0 cursor-pointer",
                idx === selectedIndex
                  ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              )}
            >
              <ImageIcon className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{img.title}</span>
            </button>
          ))}
        </div>
      )}

      {/* Image caption footer */}
      {activeImage && (
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-3 border-t border-slate-100">
          <span>{activeImage.title}</span>
          <span className="font-mono uppercase">{activeImage.type}</span>
        </div>
      )}
    </section>
  );
}
