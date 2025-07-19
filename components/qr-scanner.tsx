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
      <div className="relative w-full max-w-xs aspect-square flex items-center justify-center">
        <video
          ref={videoRef}
          className="absolute top-0 left-0 w-full h-full object-cover rounded-lg"
          autoPlay
          playsInline
          muted
        />
        {/* Square scan area overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-4/5 aspect-square border-4 border-red-500 rounded-lg">
            {/* Corner markers */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-red-500 rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-red-500 rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-red-500 rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-red-500 rounded-br-lg" />
          </div>
        </div>
      </div>
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
