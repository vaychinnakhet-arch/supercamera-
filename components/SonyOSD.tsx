import React from 'react';
import { CameraSettings, LensType } from '../types';

interface SonyOSDProps {
  settings: CameraSettings;
  lens: LensType;
  batteryLevel: number;
}

export const SonyOSD: React.FC<SonyOSDProps> = ({ settings, lens, batteryLevel }) => {
  return (
    <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between z-20 text-xs md:text-sm font-mono tracking-tighter select-none">
      {/* Top Bar */}
      <div className="flex justify-between items-start text-white/90 drop-shadow-md">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="bg-orange-600 px-1 text-black font-bold text-[10px] md:text-xs">M</span>
            <span>NO CARD</span>
            <span className="text-neutral-400">|</span>
            <span>RAW+J</span>
          </div>
          <div className="mt-1">
            <span>AF-C</span>
            <span className="ml-2 bg-neutral-800/50 px-1 border border-white/20">Wide</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2">
            <span>120min</span>
            <div className="flex items-center gap-1">
               <span className="text-[10px]">{batteryLevel}%</span>
               <div className="w-6 h-3 border border-white/70 relative">
                 <div 
                   className="h-full bg-white/90" 
                   style={{ width: `${batteryLevel}%` }}
                 />
               </div>
            </div>
          </div>
          <div>
            <span>STBY</span>
          </div>
        </div>
      </div>

      {/* Focus Area (Center) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 md:w-24 md:h-24 border border-white/30 flex items-center justify-center">
         <div className="w-2 h-2 bg-white/50 rounded-full" />
         <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-white/80" />
         <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-white/80" />
         <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-white/80" />
         <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-white/80" />
      </div>

      {/* Bottom Bar Stats */}
      <div className="flex justify-between items-end pb-1 text-white drop-shadow-md">
        <div className="flex gap-4 md:gap-8 items-end">
           <div className="flex flex-col items-center">
             <span className="text-[10px] text-neutral-400">SHUTTER</span>
             <span className="text-sm md:text-lg font-bold">{settings.shutterSpeed}</span>
           </div>
           <div className="flex flex-col items-center">
             <span className="text-[10px] text-neutral-400">F-NO</span>
             <span className="text-sm md:text-lg font-bold text-orange-500">{settings.aperture}</span>
           </div>
           <div className="flex flex-col items-center">
             <span className="text-[10px] text-neutral-400">ISO</span>
             <span className="text-sm md:text-lg font-bold">{settings.iso}</span>
           </div>
           <div className="flex flex-col items-center">
             <span className="text-[10px] text-neutral-400">MM</span>
             <span className="text-sm md:text-lg font-bold">{parseInt(lens)}</span>
           </div>
        </div>

        <div className="flex flex-col items-end">
           <span className="text-neutral-400 text-xs">
             {settings.ev > 0 ? `+${settings.ev}` : settings.ev} EV
           </span>
           <div className="w-32 h-2 bg-neutral-800/80 border border-neutral-600 mt-1 relative overflow-hidden">
              {/* Fake Histogram */}
              <svg className="w-full h-full text-neutral-400" viewBox="0 0 100 20" preserveAspectRatio="none">
                 <path d="M0,20 Q10,18 20,10 T40,15 T60,5 T80,12 T100,20 Z" fill="currentColor" />
              </svg>
           </div>
        </div>
      </div>
    </div>
  );
};