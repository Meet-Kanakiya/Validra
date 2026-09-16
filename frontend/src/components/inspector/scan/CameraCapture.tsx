import * as React from "react";
import { Camera, RefreshCw, CheckCircle2, VideoOff } from "lucide-react";
import { Button } from "@/components/shared/ui/button";
import { cn } from "@/lib/utils";

export interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onCancel?: () => void;
  className?: string;
}

/**
 * CameraCapture component that interfaces with navigator.mediaDevices.getUserMedia.
 * Safely handles stream lifecycle, permission states, and snapshots.
 */
export function CameraCapture({
  onCapture,
  onCancel,
  className,
}: CameraCaptureProps) {
  const [stream, setStream] = React.useState<MediaStream | null>(null);
  const [capturedBlobUrl, setCapturedBlobUrl] = React.useState<string | null>(null);
  const [capturedFile, setCapturedFile] = React.useState<File | null>(null);
  const [cameraError, setCameraError] = React.useState<string | null>(null);
  const [isInitializing, setIsInitializing] = React.useState(true);
  const [retryTrigger, setRetryTrigger] = React.useState(0);

  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  // Initialize camera stream asynchronously in a microtask to avoid synchronous setState in effect
  React.useEffect(() => {
    let isMounted = true;

    Promise.resolve().then(() => {
      if (!isMounted) return;

      if (
        typeof window === "undefined" ||
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        setCameraError("Camera access is not supported by your browser or environment.");
        setIsInitializing(false);
        return;
      }

      navigator.mediaDevices
        .getUserMedia({
          video: {
            facingMode: "environment", // Prefer back-facing camera on mobile devices
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        })
        .then((mediaStream) => {
          if (!isMounted) {
            mediaStream.getTracks().forEach((track) => track.stop());
            return;
          }
          setStream(mediaStream);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
          setIsInitializing(false);
        })
        .catch((err: unknown) => {
          if (!isMounted) return;
          if (err instanceof DOMException && err.name === "NotAllowedError") {
            setCameraError(
              "Camera access was denied. Please allow camera permissions in your browser settings."
            );
          } else if (err instanceof DOMException && err.name === "NotFoundError") {
            setCameraError("No camera hardware found on this device.");
          } else {
            setCameraError("Unable to access camera. Please check device permissions.");
          }
          setIsInitializing(false);
        });
    });

    return () => {
      isMounted = false;
    };
  }, [retryTrigger]);

  // Clean up media stream on unmount
  React.useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const stopCurrentStream = React.useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  // Capture frame from video stream to canvas
  const handleSnap = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, width, height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `scan_capture_${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        const url = URL.createObjectURL(blob);

        setCapturedFile(file);
        setCapturedBlobUrl(url);
        stopCurrentStream();
      },
      "image/jpeg",
      0.92
    );
  };

  const handleRetake = () => {
    if (capturedBlobUrl) {
      URL.revokeObjectURL(capturedBlobUrl);
      setCapturedBlobUrl(null);
      setCapturedFile(null);
    }
    setIsInitializing(true);
    setCameraError(null);
    setRetryTrigger((prev) => prev + 1);
  };

  const handleConfirm = () => {
    if (capturedFile) {
      onCapture(capturedFile);
    }
  };

  const handleRetryCamera = () => {
    setIsInitializing(true);
    setCameraError(null);
    setRetryTrigger((prev) => prev + 1);
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-6 space-y-4 shadow-xs",
        className
      )}
    >
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

      {/* Error state */}
      {cameraError ? (
        <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center">
            <VideoOff className="w-6 h-6" aria-hidden="true" />
          </div>
          <h4 className="text-sm font-semibold text-slate-900">Camera Unavailable</h4>
          <p className="text-xs text-slate-500 max-w-sm">{cameraError}</p>
          <div className="pt-2 flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleRetryCamera}
              className="text-xs gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry camera</span>
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onCancel}
                className="text-xs"
              >
                Switch to file upload
              </Button>
            )}
          </div>
        </div>
      ) : capturedBlobUrl ? (
        /* Captured Snapshot Preview */
        <div className="space-y-4">
          <div className="relative aspect-[4/3] w-full max-w-lg mx-auto rounded-xl bg-slate-950 border border-slate-200 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={capturedBlobUrl}
              alt="Captured package frame"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRetake}
              className="text-xs gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retake photo</span>
            </Button>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handleConfirm}
              className="text-xs gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Use this photo</span>
            </Button>
          </div>
        </div>
      ) : (
        /* Live Video Viewfinder */
        <div className="space-y-4">
          <div className="relative aspect-[4/3] w-full max-w-lg mx-auto rounded-xl bg-slate-950 border border-slate-200 overflow-hidden flex items-center justify-center">
            {isInitializing && (
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                <span>Starting camera...</span>
              </div>
            )}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={cn(
                "w-full h-full object-cover",
                isInitializing && "opacity-0"
              )}
            />
            {/* Frame alignment overlay */}
            <div className="absolute inset-6 border border-emerald-400/60 rounded-lg pointer-events-none flex flex-col justify-between p-3">
              <span className="text-[10px] font-mono text-emerald-300 bg-slate-900/80 px-1.5 py-0.5 rounded self-start">
                Align label text inside box
              </span>
              <span className="text-[10px] font-mono text-emerald-300 bg-slate-900/80 px-1.5 py-0.5 rounded self-end">
                Hold still
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <Button
              type="button"
              variant="default"
              size="md"
              onClick={handleSnap}
              disabled={isInitializing || !stream}
              className="gap-2 font-semibold"
            >
              <Camera className="w-4 h-4" />
              <span>Capture Label</span>
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onCancel}
                className="text-xs text-slate-500 hover:text-slate-900"
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
