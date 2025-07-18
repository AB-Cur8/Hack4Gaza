import { useRef, useEffect } from "react";
import jsQR from "jsqr";

interface QRScannerProps {
  onDetected: (data: string) => void;
  onClose: () => void;
}

export default function QRScanner({ onDetected, onClose }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  let animationFrameId: number;

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          scan();
        }
      } catch (err) {
        console.error("Camera error:", err);
        alert("Could not access camera.");
        onClose();
      }
    }

    startCamera();

    return () => {
      stopCamera();
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach((track) => track.stop());
  };

  const scan = () => {
    if (!canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, canvas.width, canvas.height);

    if (code) {
      onDetected(code.data);
      stopCamera();
    } else {
      animationFrameId = requestAnimationFrame(scan);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex flex-col items-center justify-center">
      <video ref={videoRef} className="w-full h-auto max-w-md" />
      <canvas ref={canvasRef} className="hidden" />
      <button
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
        onClick={() => {
          stopCamera();
          onClose();
        }}
      >
        Close
      </button>
    </div>
  );
}
