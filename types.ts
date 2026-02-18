export enum LensType {
  ULTRA_WIDE = '16mm',
  WIDE = '24mm',
  TELEPHOTO = '50mm'
}

export enum AppState {
  CAMERA = 'CAMERA',
  GALLERY = 'GALLERY',
  PROCESSING = 'PROCESSING'
}

export interface CapturedImage {
  id: string;
  originalUrl: string;
  enhancedUrl?: string;
  timestamp: number;
  meta: {
    iso: number;
    shutterSpeed: string;
    aperture: string;
    lens: LensType;
  };
}

export interface CameraSettings {
  iso: number;
  shutterSpeed: string;
  aperture: string;
  ev: number;
}
