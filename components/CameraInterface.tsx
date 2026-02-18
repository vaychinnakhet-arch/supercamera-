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
  const [loading, setLoading] = useState<boolean>(true);
  
  // Fake settings state to simulate camera adjusting to light
  const [settings, setSettings] = useState<CameraSettings>({
    iso: 100,
    shutterSpeed: '1/250',
    aperture: 'F2.8',
    ev: 0.0
  });

  const [batteryLevel, setBatteryLevel] = useState(100);

  // Initialize Camera with Fallback
  useEffect(() => {
    let active = true;
    const startCamera = async () => {
      setLoading(true);
      setError('');

      // Check for Secure Context
      if (window.isSecureContext === false) {
        if (active) {
          setError('Camera requires HTTPS or localhost (Secure Context).');
          setLoading(false);
        }
        return;
      }

      // Check for MediaDevices API
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
         if (active) {
          setError('Camera API not supported in this browser.');
          setLoading(false);
        }
        return;
      }

      try {
        // Try high-quality rear camera first
        try {
          const constraints = {
            video: {
              facingMode: 'environment',
              width: { ideal: 4096 },
              height: { ideal: 2160 }
            },
            audio: false
          };
          const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
          if (active) {
            setStream(mediaStream);
            if (videoRef.current) {
              videoRef.current.srcObject = mediaStream;
            }
            setLoading(false);
            return;
          }
        } catch (e) {
          console.warn("High-quality rear camera failed, trying fallback...", e);
        }

        // Fallback to any camera
        const fallbackConstraints = {
          video: true,
          audio: false
        };
        const mediaStream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
        if (active) {
          setStream(mediaStream);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
          setLoading(false);
        }

      } catch (err) {
        if (active) {
          setError('Camera access denied or unavailable. Please ensure permissions are granted.');
          setLoading(false);
          console.error(err);
        }
      }
    };

    startCamera();

    // Battery API
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      // @ts-ignore
      navigator.getBattery().then((battery: any) => {
        if (active) {
           setBatteryLevel(Math.floor(battery.level * 100));
           battery.addEventListener('levelchange', () => {
              if (active) setBatteryLevel(Math.floor(battery.level * 100));
           });
        }
      }).catch((e: any) => console.log("Battery API not supported", e));
    }

    // Simulate settings changes
    const interval = setInterval(() => {
      if (active) {
        setSettings(prev => ({
          ...prev,
          iso: Math.random() > 0.5 ? 100 : 125,
          shutterSpeed: Math.random() > 0.5 ? '1/250' : '1/320'
        }));
      }
    }, 2000);

    return () => {
      active = false;
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
    
    // Draw the image
    // Note: We are capturing the raw feed, not the CSS filtered one.
    // To bake in the Sony look, we could use filter on context, but typically we want raw for AI processing.
    // However, if we want the "Sony tone" to be instant, let's keep it raw for AI to enhance properly.
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageSrc = canvas.toDataURL('image/jpeg', 0.95);
    onCapture(imageSrc, settings, lens);
  }, [lens, settings, onCapture]);

  // Lens Change Logic (Simulated Zoom)
  const getScale = () => {
    switch (lens) {
      case LensType.ULTRA_WIDE: return 0.6; // Simulate wide by zooming out
      case LensType.WIDE: return 1;
      case LensType.TELEPHOTO: return 2; // Digital crop
      default: return 1;
    }
  };

  return (
    <div className="relative h-screen w-full bg-black flex flex-col md:flex-row overflow-hidden">
      {/* Main Viewfinder Area */}
      <div className="relative flex-1 bg-neutral-900 overflow-hidden flex items-center justify-center">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-40 bg-black text-white">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="font-mono text-sm tracking-widest">INITIALIZING SENSOR...</p>
          </div>
        )}
        
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-black text-red-500 p-4">
            <Icons.Camera className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-center mb-4 font-mono">{error}</p>
            <button 
              className="px-6 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded font-mono text-xs uppercase tracking-wider" 
              onClick={() => window.location.reload()}
            >
              Restart System
            </button>
          </div>
        ) : (
          <div className="relative w-full h-full">
             <video 
               ref={videoRef}
               autoPlay 
               playsInline 
               muted 
               className="sony-look absolute top-1/2 left-1/2 min-w-full min-h-full object-cover transition-transform duration-500 ease-out"
               style={{ 
                 transform: `translate(-50%, -50%) scale(${getScale()})`,
               }}
             />
             <SonyOSD settings={settings} lens={lens} batteryLevel={batteryLevel} />
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Control Strip (Right side on Landscape/Fold, Bottom on Mobile Portrait) */}
      <div className="bg-black text-white p-4 z-30 flex md:flex-col items-center justify-between md:w-32 md:border-l border-neutral-800 shadow-2xl safe-area-pb">
        
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