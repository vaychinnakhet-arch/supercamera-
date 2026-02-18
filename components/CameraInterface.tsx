import React, { useRef, useEffect, useState, useCallback } from 'react';
import { CameraSettings, LensType } from '../types';
import { SonyOSD } from './SonyOSD';
import { Icons } from './Icons';

interface CameraInterfaceProps {
  onCapture: (imageSrc: string, settings: CameraSettings, lens: LensType) => void;
  onOpenGallery: () => void;
}

export const CameraInterface: React.FC<CameraInterfaceProps> = ({ onCapture, onOpenGallery }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [lens, setLens] = useState<LensType>(LensType.WIDE);
  const [error, setError] = useState<string>('');
  
  // Fake settings state to simulate camera adjusting to light
  const [settings, setSettings] = useState<CameraSettings>({
    iso: 100,
    shutterSpeed: '1/250',
    aperture: 'F2.8',
    ev: 0.0
  });

  const [batteryLevel, setBatteryLevel] = useState(100);

  // Initialize Camera
  useEffect(() => {
    const startCamera = async () => {
      try {
        const constraints = {
          video: {
            facingMode: 'environment', // Rear camera by default
            width: { ideal: 4096 },
            height: { ideal: 2160 }
          },
          audio: false
        };
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        setError('Camera access denied or unavailable.');
        console.error(err);
      }
    };

    startCamera();

    // Battery API (Chrome only, simulated elsewhere)
    if ('getBattery' in navigator) {
      // @ts-ignore
      navigator.getBattery().then((battery: any) => {
        setBatteryLevel(Math.floor(battery.level * 100));
        battery.addEventListener('levelchange', () => {
           setBatteryLevel(Math.floor(battery.level * 100));
        });
      });
    }

    // Simulate settings changes
    const interval = setInterval(() => {
      setSettings(prev => ({
        ...prev,
        iso: Math.random() > 0.5 ? 100 : 125,
        shutterSpeed: Math.random() > 0.5 ? '1/250' : '1/320'
      }));
    }, 2000);

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCapture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Flip horizontally if mirroring is needed (usually not for rear cam)
    // ctx.scale(-1, 1);
    // ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    
    // Simple draw
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageSrc = canvas.toDataURL('image/jpeg', 0.95);
    onCapture(imageSrc, settings, lens);
  }, [lens, settings, onCapture]);

  // Lens Change Logic (Simulated Zoom)
  const getScale = () => {
    switch (lens) {
      case LensType.ULTRA_WIDE: return 0.6; // Simulate wide by zooming out (requires container overflow hidden)
      case LensType.WIDE: return 1;
      case LensType.TELEPHOTO: return 2; // Digital crop
      default: return 1;
    }
  };

  return (
    <div className="relative h-screen w-full bg-black flex flex-col md:flex-row overflow-hidden">
      {/* Main Viewfinder Area */}
      <div className="relative flex-1 bg-neutral-900 overflow-hidden flex items-center justify-center">
        {error ? (
          <div className="text-red-500 text-center p-4">
            <p>{error}</p>
            <button className="mt-4 px-4 py-2 bg-neutral-800 rounded" onClick={() => window.location.reload()}>Retry</button>
          </div>
        ) : (
          <div className="relative w-full h-full">
             <video 
               ref={videoRef}
               autoPlay 
               playsInline 
               muted 
               className="absolute top-1/2 left-1/2 min-w-full min-h-full object-cover transition-transform duration-500 ease-out"
               style={{ 
                 transform: `translate(-50%, -50%) scale(${getScale()})`,
                 // When zooming out (ultra-wide simulation), we might see black borders if video doesn't cover enough. 
                 // In a real app, we'd switch cameras. Here we rely on scaling. 
                 // If scale < 1, we might need a bigger video source or accept borders (Sony style borders are fine).
               }}
             />
             <SonyOSD settings={settings} lens={lens} batteryLevel={batteryLevel} />
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Control Strip (Right side on Landscape/Fold, Bottom on Mobile Portrait) */}
      <div className="bg-black text-white p-4 z-30 flex md:flex-col items-center justify-between md:w-32 md:border-l border-neutral-800 shadow-2xl">
        
        {/* Top Controls */}
        <div className="flex md:flex-col gap-6 md:mt-4">
           <button className="p-3 rounded-full hover:bg-neutral-800 transition-colors text-white/80">
             <Icons.Menu size={24} />
           </button>
           <button className="p-3 rounded-full hover:bg-neutral-800 transition-colors text-white/80">
              <span className="font-bold font-mono text-orange-500">Fn</span>
           </button>
        </div>

        {/* Lens Selection (The 3 distances) */}
        <div className="flex md:flex-col gap-3 my-4">
           {[LensType.ULTRA_WIDE, LensType.WIDE, LensType.TELEPHOTO].map((l) => (
             <button
               key={l}
               onClick={() => setLens(l)}
               className={`w-12 h-12 rounded-full flex items-center justify-center text-xs font-bold border transition-all duration-200 ${
                 lens === l 
                   ? 'bg-orange-600 border-orange-600 text-white scale-110 shadow-lg shadow-orange-900/50' 
                   : 'bg-transparent border-neutral-600 text-neutral-400 hover:border-neutral-400'
               }`}
             >
               {l.replace('mm', '')}
             </button>
           ))}
        </div>

        {/* Shutter & Gallery */}
        <div className="flex md:flex-col gap-6 items-center md:mb-8">
           <button 
             onClick={onOpenGallery}
             className="w-12 h-12 rounded-lg bg-neutral-800 border border-neutral-700 overflow-hidden hover:opacity-80 transition-opacity"
           >
             {/* Preview placeholder */}
             <div className="w-full h-full bg-neutral-700 flex items-center justify-center text-neutral-500">
               <Icons.Gallery size={20} />
             </div>
           </button>

           <button 
             onClick={handleCapture}
             className="w-20 h-20 rounded-full bg-white border-4 border-neutral-300 flex items-center justify-center active:scale-95 transition-transform"
           >
             <div className="w-16 h-16 rounded-full border-2 border-black/10" />
           </button>
        </div>

      </div>
    </div>
  );
};