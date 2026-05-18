export type GarmentClass = 'playera' | 'pantalon' | 'sudadera' | 'calzado';

export interface ClassificationProbabilities {
  playera: number;
  pantalon: number;
  sudadera: number;
  calzado: number;
}

export interface ClassificationResult {
  class: GarmentClass;
  confidence: number;
  probabilities: ClassificationProbabilities;
  low_confidence: boolean;
}

export interface ClassificationError {
  error: string;
  code: 'INVALID_FORMAT' | 'FILE_TOO_LARGE' | 'SERVICE_UNAVAILABLE' | 'LOW_QUALITY' | 'UNKNOWN';
}

export type ClassificationResponse = ClassificationResult | ClassificationError;

export type UploadState =
  | { status: 'idle' }
  | { status: 'previewing'; file: File; previewUrl: string }
  | { status: 'processing' }
  | { status: 'success'; result: ClassificationResult }
  | { status: 'error'; message: string }
  | { status: 'low_confidence'; result: ClassificationResult };
