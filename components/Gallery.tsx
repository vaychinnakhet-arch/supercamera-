import React from 'react';
import { CapturedImage } from '../types';
import { Icons } from './Icons';

interface GalleryProps {
  images: CapturedImage[];
  onClose: () => void;
  isProcessing: boolean;
}

export const Gallery: React.FC<GalleryProps> = ({ images, onClose, isProcessing }) => {
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const currentImage = images[selectedIndex];

  if (!images.length) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center text-white">
        <p className="text-neutral-500 mb-4">No images captured yet</p>
        <button onClick={onClose} className="px-6 py-2 bg-orange-600 rounded text-white font-bold">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Toolbar */}
      <div className="flex justify-between items-center p-4 bg-black/80 backdrop-blur-md border-b border-neutral-800">
        <button onClick={onClose} className="text-white hover:text-orange-500 transition-colors flex items-center gap-2">
           <Icons.Back />
           <span className="font-mono text-sm">RETURN</span>
        </button>
        <div className="font-mono text-xs text-neutral-400">
          {selectedIndex + 1} / {images.length}
        </div>
        <div className="flex gap-4">
           <Icons.Share className="text-neutral-400 hover:text-white cursor-pointer" />
        </div>
      </div>

      {/* Main Image Area */}
      <div className="flex-1 overflow-hidden relative flex items-center justify-center bg-neutral-900">
         {currentImage && (
           <div className="relative max-w-full max-h-full">
              <img 
                src={currentImage.enhancedUrl || currentImage.originalUrl} 
                alt="Captured" 
                className="max-h-[80vh] max-w-full object-contain shadow-2xl"
              />
              
              {/* Comparison Badge / Status */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                 {isProcessing && selectedIndex === 0 ? (
                    <div className="bg-black/60 text-orange-400 px-3 py-1 rounded-full text-xs font-mono flex items-center gap-2 border border-orange-500/30 animate-pulse">
                      <Icons.Processing size={14} className="animate-spin" />
                      STACKING & PROCESSING...
                    </div>
                 ) : currentImage.enhancedUrl ? (
                    <div className="bg-orange-600 text-white px-3 py-1 text-xs font-bold font-mono shadow-lg">
                      ALPHA AI HIGH-RES
                    </div>
                 ) : (
                    <div className="bg-neutral-800 text-white px-3 py-1 text-xs font-mono">
                      STANDARD PREVIEW
                    </div>
                 )}
              </div>

              {/* Metadata Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6 text-white font-mono text-sm">
                 <div className="flex justify-between items-end">
                    <div>
                       <div className="text-orange-500 text-xs mb-1">SONY STYLE META</div>
                       <div className="flex gap-4">
                          <span>{currentImage.meta.lens}</span>
                          <span>{currentImage.meta.aperture}</span>
                          <span>{currentImage.meta.shutterSpeed}</span>
                          <span>ISO {currentImage.meta.iso}</span>
                       </div>
                    </div>
                    <div className="text-neutral-500 text-xs">
                       {new Date(currentImage.timestamp).toLocaleTimeString()}
                    </div>
                 </div>
              </div>
           </div>
         )}
      </div>

      {/* Thumbnails */}
      <div className="h-24 bg-black border-t border-neutral-800 flex items-center gap-2 px-4 overflow-x-auto">
        {images.map((img, idx) => (
          <button 
            key={img.id}
            onClick={() => setSelectedIndex(idx)}
            className={`relative flex-shrink-0 h-16 w-16 md:w-24 overflow-hidden rounded border-2 transition-all ${
              selectedIndex === idx ? 'border-orange-500 opacity-100' : 'border-transparent opacity-50 hover:opacity-80'
            }`}
          >
             <img src={img.originalUrl} className="w-full h-full object-cover" alt="thumbnail" />
             {img.enhancedUrl && (
                <div className="absolute top-0 right-0 w-3 h-3 bg-orange-500 rounded-bl-md" />
             )}
          </button>
        ))}
      </div>
    </div>
  );
};