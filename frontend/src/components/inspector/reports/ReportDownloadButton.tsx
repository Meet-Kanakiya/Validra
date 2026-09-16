import * as React from "react";
import { Download, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/shared/ui/button";
import { reportService } from "@/services/report-service";
import { cn } from "@/lib/utils";

export interface ReportDownloadButtonProps {
  reportId: string;
  downloadUrl?: string | null;
  className?: string;
}

/**
 * ReportDownloadButton component.
 * Connects to real download endpoint when available, or shows clear pending state without fake files.
 */
export function ReportDownloadButton({
  reportId,
  downloadUrl,
  className,
}: ReportDownloadButtonProps) {
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [notice, setNotice] = React.useState<string | null>(null);

  const handleDownload = async () => {
    if (downloadUrl) {
      window.open(downloadUrl, "_blank");
      return;
    }

    setIsDownloading(true);
    setNotice(null);

    try {
      const result = await reportService.downloadReport(reportId);
      if (!result.supported) {
        setNotice(result.message);
      }
    } catch {
      setNotice("Download request failed. Please check server connection.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className={cn("inline-flex flex-col items-start gap-1.5", className)}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleDownload}
        disabled={isDownloading}
        className="gap-1.5 text-xs font-medium text-slate-700 hover:text-emerald-800 border-slate-300 hover:border-emerald-400 hover:bg-emerald-50/50 cursor-pointer"
        aria-label="Download inspection report certificate"
      >
        {isDownloading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
            <span>Checking export...</span>
          </>
        ) : (
          <>
            <Download className="w-3.5 h-3.5" />
            <span>Download Certificate</span>
          </>
        )}
      </Button>

      {notice && (
        <div
          role="status"
          className="flex items-center gap-1.5 text-[11px] text-amber-700 pt-1"
        >
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>{notice}</span>
        </div>
      )}
    </div>
  );
}
