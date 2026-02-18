import React, { useState, useCallback } from 'react';
import { CameraInterface } from './components/CameraInterface';
import { Gallery } from './components/Gallery';
import { AppState, CapturedImage, CameraSettings, LensType } from './types';
import { enhanceImageWithGemini } from './services/geminiService';

const App: React.FC = () => {
  const [view, setView] = useState<AppState>(AppState.CAMERA);
  const [images, setImages] = useState<CapturedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCapture = useCallback(async (imageSrc: string, settings: CameraSettings, lens: LensType) => {
    const newImage: CapturedImage = {
      id: Date.now().toString(),
      originalUrl: imageSrc,
      timestamp: Date.now(),
      meta: {
        iso: settings.iso,
        shutterSpeed: settings.shutterSpeed,
        aperture: settings.aperture,
        lens: lens
      }
    };

    // Add to gallery immediately with original
    setImages(prev => [newImage, ...prev]);
    
    // Automatically switch to gallery or show processing indicator in view
    // For this specific UX, let's flash a "Processing" toast or similar, 
    // but the user wanted "Stacking" simulation. 
    // Let's trigger processing in background and update the image when done.
    
    setIsProcessing(true);
    
    // Simulate "Stacking" delay for effect
    // Then call Gemini
    try {
      const enhancedBase64 = await enhanceImageWithGemini(imageSrc);
      
      if (enhancedBase64) {
        setImages(prev => prev.map(img => 
          img.id === newImage.id 
            ? { ...img, enhancedUrl: enhancedBase64 }
            : img
        ));
      }
    } catch (e) {
      console.error("Enhancement failed", e);
    } finally {
      setIsProcessing(false);
    }

  }, []);

  return (
    <div className="w-full h-screen bg-black text-white overflow-hidden">
      {view === AppState.CAMERA && (
        <CameraInterface 
          onCapture={handleCapture} 
          onOpenGallery={() => setView(AppState.GALLERY)}
        />
      )}
      
      {view === AppState.GALLERY && (
        <Gallery 
          images={images} 
          onClose={() => setView(AppState.CAMERA)}
          isProcessing={isProcessing}
        />
      )}
      
      {/* Simple Processing Toast in Camera View */}
      {view === AppState.CAMERA && isProcessing && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur border border-orange-500/50 text-orange-500 px-6 py-3 rounded-full flex items-center gap-3 z-50 shadow-2xl">
          <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <span className="font-mono text-sm font-bold tracking-wider">HIGH-RES STACKING...</span>
        </div>
      )}
    </div>
  );
};

export default App;