import { useRef, useEffect, useState } from "react";
import jsQR from "jsqr";

interface QRScannerProps {
  onDetected: (data: string) => void;
  onClose: () => void;
}

export default function QRScanner({ onDetected, onClose }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | undefined>(undefined);
  const isUnmounted = useRef<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  useEffect(() => {
    console.log("QRScanner: Component mounted, starting camera...");
    isUnmounted.current = false;
    
    async function startCamera() {
      // Check if we're in a browser environment
      if (typeof window === "undefined") {
        console.log("QRScanner: Not in browser environment");
        setCameraError("Camera API not available in this environment.");
        return;
      }

      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.log("QRScanner: getUserMedia not available");
        setCameraError("Camera API not available in this browser.");
        return;
      }

      try {
        console.log("QRScanner: Requesting camera access...");
        
        // Request camera with more specific constraints
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280, min: 640 },
            height: { ideal: 720, min: 480 }
          },
          audio: false
        });

        console.log("QRScanner: Camera stream obtained:", stream);
        console.log("QRScanner: videoRef.current:", videoRef.current);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          
          // Wait for video to be ready
          videoRef.current.onloadedmetadata = () => {
            console.log("QRScanner: Video metadata loaded");
            if (videoRef.current) {
              videoRef.current.play().then(() => {
                console.log("QRScanner: Video started playing");
                setIsCameraActive(true);
                scan();
              }).catch((err) => {
                console.error("QRScanner: Video play failed:", err);
                setCameraError("Failed to start video playback.");
              });
            }
          };

          videoRef.current.onerror = (err) => {
            console.error("QRScanner: Video error:", err);
            setCameraError("Video playback error occurred.");
          };
        } else {
          console.error("QRScanner: videoRef.current is null");
          setCameraError("Video element not found.");
        }
      } catch (err) {
        console.error("QRScanner: Camera access error:", err);
        let errorMessage = "Could not access camera.";
        
        if (err instanceof Error) {
          if (err.name === "NotAllowedError") {
            errorMessage = "Camera access denied. Please allow camera access and try again.";
          } else if (err.name === "NotFoundError") {
            errorMessage = "No camera found on this device.";
          } else if (err.name === "NotSupportedError") {
            errorMessage = "Camera not supported in this browser.";
          } else {
            errorMessage = `Camera error: ${err.message}`;
          }
        }
        
        setCameraError(errorMessage);
      }
    }

    function stopCamera() {
      console.log("QRScanner: Stopping camera...");
      const stream = videoRef.current?.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach((track) => {
          console.log("QRScanner: Stopping track:", track.kind);
          track.stop();
        });
      }
      setIsCameraActive(false);
    }

    function scan() {
      if (!canvasRef.current || !videoRef.current) {
        console.log("QRScanner: Canvas or video not ready for scanning");
        return;
      }

      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext("2d");
      
      if (!ctx) {
        console.log("QRScanner: Could not get canvas context");
        return;
      }

      // Check if video is ready
      if (video.readyState !== video.HAVE_ENOUGH_DATA) {
        console.log("QRScanner: Video not ready, retrying...");
        if (!isUnmounted.current) {
          animationFrameId.current = requestAnimationFrame(scan);
        }
        return;
      }

      try {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, canvas.width, canvas.height);
        
        if (code) {
          console.log("QRScanner: QR code detected:", code.data);
          onDetected(code.data);
          stopCamera();
        } else if (!isUnmounted.current) {
          animationFrameId.current = requestAnimationFrame(scan);
        }
      } catch (err) {
        console.error("QRScanner: Scanning error:", err);
        if (!isUnmounted.current) {
          animationFrameId.current = requestAnimationFrame(scan);
        }
      }
    }

    startCamera();

    return () => {
      console.log("QRScanner: Component unmounting, cleaning up...");
      isUnmounted.current = true;
      stopCamera();
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [onClose, onDetected]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex flex-col items-center justify-center">
      <div className="relative w-full max-w-xs flex justify-center items-center" style={{ aspectRatio: 1 }}>
        <video
          ref={videoRef}
          className="absolute top-0 left-0 w-full h-full object-cover rounded-lg"
          autoPlay
          playsInline
          muted
        />
        {/* Square scan area overlay, always centered and square */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative" style={{ width: 220, height: 220 }}>
            <div className="absolute inset-0 border-4 border-red-500 rounded-lg" />
            {/* Corner markers */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-red-500 rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-red-500 rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-red-500 rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-red-500 rounded-br-lg" />
          </div>
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Status indicator */}
      {!isCameraActive && !cameraError && (
        <div className="text-white bg-blue-600 bg-opacity-80 rounded p-2 mt-4 text-center max-w-xs">
          Starting camera...
        </div>
      )}
      
      {cameraError && (
        <div className="text-red-500 bg-white bg-opacity-80 rounded p-2 mt-4 text-center max-w-xs">
          {cameraError}
        </div>
      )}
      
      <button
        className="mt-4 px-4 py-2 bg-white text-black rounded font-medium"
        onClick={() => {
          console.log("QRScanner: Close button clicked");
          const stream = videoRef.current?.srcObject as MediaStream;
          stream?.getTracks().forEach((track) => track.stop());
          onClose();
        }}
      >
        Stop Scanning
      </button>
    </div>
  );
}
