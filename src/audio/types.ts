export type NoiseType = 'white' | 'pink' | 'brown';

export interface AudioEngineState {
  isPlaying: boolean;
  isLoading: boolean;
  volume: number;
  noiseType: NoiseType;
  frequency: number; // Filter cutoff frequency for brightness
  binauralEnabled: boolean;
  binauralBeatFrequency: number; // Hz (1-40)
  binauralBaseFrequency: number; // Hz (carrier frequency)
  binauralVolume: number;
  notchFilters: NotchFilterConfig[];
}

export interface NotchFilterConfig {
  id: string;
  frequency: number; // Hz
  q: number; // Quality factor (width)
  enabled: boolean;
}

export interface Preset {
  id: string;
  name: string;
  description: string;
  config: Partial<AudioEngineState>;
  isCustom?: boolean;
  createdAt?: number;
}

// Helper to get wave type name from frequency
export function getWaveTypeName(frequency: number): string {
  if (frequency >= 1 && frequency <= 4) return 'Delta';
  if (frequency > 4 && frequency <= 8) return 'Theta';
  if (frequency > 8 && frequency <= 14) return 'Alpha';
  if (frequency > 14 && frequency <= 30) return 'Beta';
  if (frequency > 30 && frequency <= 40) return 'Gamma';
  return 'Custom';
}

// Helper to get wave type description
export function getWaveTypeInfo(frequency: number): { name: string; description: string } {
  if (frequency >= 1 && frequency <= 4) return { name: 'Delta', description: 'Deep sleep' };
  if (frequency > 4 && frequency <= 8) return { name: 'Theta', description: 'Meditation' };
  if (frequency > 8 && frequency <= 14) return { name: 'Alpha', description: 'Relaxation' };
  if (frequency > 14 && frequency <= 30) return { name: 'Beta', description: 'Focus' };
  if (frequency > 30 && frequency <= 40) return { name: 'Gamma', description: 'Cognition' };
  return { name: 'Custom', description: `${frequency}Hz` };
}

export const DEFAULT_PRESETS: Preset[] = [
  {
    id: 'sleep',
    name: 'Sleep',
    description: 'Deep brown noise for restful sleep',
    config: {
      noiseType: 'brown',
      volume: 0.4,
      frequency: 800,
      binauralEnabled: true,
      binauralBeatFrequency: 3, // Delta waves
      binauralVolume: 0.15,
    },
  },
  {
    id: 'focus',
    name: 'Focus',
    description: 'Pink noise with beta waves for concentration',
    config: {
      noiseType: 'pink',
      volume: 0.35,
      frequency: 2000,
      binauralEnabled: true,
      binauralBeatFrequency: 22, // Beta waves for active focus
      binauralVolume: 0.2,
    },
  },
  {
    id: 'relief',
    name: 'Tinnitus Relief',
    description: 'Brown noise with common tinnitus frequency notches',
    config: {
      noiseType: 'brown',
      volume: 0.5,
      frequency: 1500,
      binauralEnabled: false,
      notchFilters: [
        { id: 'notch-4k', frequency: 4000, q: 10, enabled: true },
        { id: 'notch-6k', frequency: 6000, q: 10, enabled: true },
      ],
    },
  },
  {
    id: 'calm',
    name: 'Calm',
    description: 'Gentle brown noise with theta waves',
    config: {
      noiseType: 'brown',
      volume: 0.3,
      frequency: 600,
      binauralEnabled: true,
      binauralBeatFrequency: 6, // Theta waves
      binauralVolume: 0.12,
    },
  },
];

export const DEFAULT_ENGINE_STATE: AudioEngineState = {
  isPlaying: false,
  isLoading: false,
  volume: 0.5,
  noiseType: 'brown',
  frequency: 1000,
  binauralEnabled: false,
  binauralBeatFrequency: 10,
  binauralBaseFrequency: 200,
  binauralVolume: 0.2,
  notchFilters: [],
};
