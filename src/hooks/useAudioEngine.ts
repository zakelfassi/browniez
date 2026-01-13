import { useState, useCallback, useEffect, useRef } from 'react';
import {
  getAudioEngine,
  type AudioEngineState,
  type NoiseType,
  type NotchFilterConfig,
  type Preset,
  DEFAULT_ENGINE_STATE,
  DEFAULT_PRESETS,
} from '../audio';

const STORAGE_KEY = 'browniez-settings';
const CUSTOM_PRESETS_KEY = 'browniez-custom-presets';

function loadSettings(): Partial<AudioEngineState> {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore parse errors
  }
  return {};
}

function saveSettings(state: AudioEngineState): void {
  if (typeof window === 'undefined') return;
  try {
    const toSave: Partial<AudioEngineState> = {
      volume: state.volume,
      noiseType: state.noiseType,
      frequency: state.frequency,
      binauralEnabled: state.binauralEnabled,
      binauralBeatFrequency: state.binauralBeatFrequency,
      binauralBaseFrequency: state.binauralBaseFrequency,
      binauralVolume: state.binauralVolume,
      notchFilters: state.notchFilters,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    // Ignore storage errors
  }
}

function loadCustomPresets(): Preset[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(CUSTOM_PRESETS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore parse errors
  }
  return [];
}

function saveCustomPresets(presets: Preset[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify(presets));
  } catch {
    // Ignore storage errors
  }
}

export function useAudioEngine() {
  const engineRef = useRef(getAudioEngine());
  const [state, setState] = useState<AudioEngineState>(() => ({
    ...DEFAULT_ENGINE_STATE,
    ...loadSettings(),
  }));
  const [customPresets, setCustomPresets] = useState<Preset[]>(() => loadCustomPresets());

  // Save settings when they change
  useEffect(() => {
    saveSettings(state);
  }, [state]);

  // Save custom presets when they change
  useEffect(() => {
    saveCustomPresets(customPresets);
  }, [customPresets]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Don't dispose - keep singleton alive for hot reload
    };
  }, []);

  const toggle = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true }));
    try {
      const engine = engineRef.current;
      const isPlaying = await engine.toggle();

      // Apply current settings when starting
      if (isPlaying) {
        engine.setVolume(state.volume);
        engine.setNoiseType(state.noiseType);
        engine.setFrequency(state.frequency);

        if (state.binauralEnabled) {
          engine.enableBinaural(
            state.binauralBaseFrequency,
            state.binauralBeatFrequency,
            state.binauralVolume
          );
        }

        state.notchFilters.forEach((filter) => {
          if (filter.enabled) {
            engine.addNotchFilter(filter);
          }
        });
      }

      setState((s) => ({ ...s, isPlaying, isLoading: false }));
    } catch (error) {
      console.error('Audio engine error:', error);
      setState((s) => ({ ...s, isLoading: false }));
    }
  }, [state]);

  const setVolume = useCallback((volume: number) => {
    engineRef.current.setVolume(volume);
    setState((s) => ({ ...s, volume }));
  }, []);

  const setNoiseType = useCallback((noiseType: NoiseType) => {
    engineRef.current.setNoiseType(noiseType);
    setState((s) => ({ ...s, noiseType }));
  }, []);

  const setFrequency = useCallback((frequency: number) => {
    engineRef.current.setFrequency(frequency);
    setState((s) => ({ ...s, frequency }));
  }, []);

  const setBinauralEnabled = useCallback(
    (enabled: boolean) => {
      const engine = engineRef.current;
      if (enabled) {
        engine.enableBinaural(
          state.binauralBaseFrequency,
          state.binauralBeatFrequency,
          state.binauralVolume
        );
      } else {
        engine.disableBinaural();
      }
      setState((s) => ({ ...s, binauralEnabled: enabled }));
    },
    [state.binauralBaseFrequency, state.binauralBeatFrequency, state.binauralVolume]
  );

  const setBinauralBeatFrequency = useCallback((frequency: number) => {
    engineRef.current.setBinauralBeatFrequency(frequency);
    setState((s) => ({ ...s, binauralBeatFrequency: frequency }));
  }, []);

  const setBinauralVolume = useCallback((volume: number) => {
    engineRef.current.setBinauralVolume(volume);
    setState((s) => ({ ...s, binauralVolume: volume }));
  }, []);

  const addNotchFilter = useCallback((frequency: number, q: number = 10) => {
    const id = `notch-${Date.now()}`;
    const filter: NotchFilterConfig = { id, frequency, q, enabled: true };
    engineRef.current.addNotchFilter(filter);
    setState((s) => ({
      ...s,
      notchFilters: [...s.notchFilters, filter],
    }));
    return id;
  }, []);

  const removeNotchFilter = useCallback((id: string) => {
    engineRef.current.removeNotchFilter(id);
    setState((s) => ({
      ...s,
      notchFilters: s.notchFilters.filter((f) => f.id !== id),
    }));
  }, []);

  const updateNotchFilter = useCallback(
    (id: string, updates: Partial<NotchFilterConfig>) => {
      engineRef.current.updateNotchFilter(id, updates);
      setState((s) => ({
        ...s,
        notchFilters: s.notchFilters.map((f) =>
          f.id === id ? { ...f, ...updates } : f
        ),
      }));
    },
    []
  );

  const applyPreset = useCallback(
    (preset: Preset) => {
      const engine = engineRef.current;
      const config = preset.config;

      if (config.volume !== undefined) engine.setVolume(config.volume);
      if (config.noiseType) engine.setNoiseType(config.noiseType);
      if (config.frequency !== undefined) engine.setFrequency(config.frequency);

      // Handle binaural
      if (config.binauralEnabled !== undefined) {
        if (config.binauralEnabled) {
          engine.enableBinaural(
            config.binauralBaseFrequency ?? state.binauralBaseFrequency,
            config.binauralBeatFrequency ?? state.binauralBeatFrequency,
            config.binauralVolume ?? state.binauralVolume
          );
        } else {
          engine.disableBinaural();
        }
      }

      // Handle notch filters
      if (config.notchFilters) {
        // Remove existing filters
        state.notchFilters.forEach((f) => engine.removeNotchFilter(f.id));
        // Add new filters
        config.notchFilters.forEach((f) => {
          if (f.enabled) engine.addNotchFilter(f);
        });
      }

      setState((s) => ({
        ...s,
        ...config,
        notchFilters: config.notchFilters ?? s.notchFilters,
      }));
    },
    [state]
  );

  const getAnalyserData = useCallback(() => {
    return {
      frequency: engineRef.current.getFrequencyData(),
      timeDomain: engineRef.current.getTimeDomainData(),
    };
  }, []);

  const savePreset = useCallback(
    (name: string) => {
      const newPreset: Preset = {
        id: `custom-${Date.now()}`,
        name,
        description: 'Custom preset',
        isCustom: true,
        createdAt: Date.now(),
        config: {
          volume: state.volume,
          noiseType: state.noiseType,
          frequency: state.frequency,
          binauralEnabled: state.binauralEnabled,
          binauralBeatFrequency: state.binauralBeatFrequency,
          binauralBaseFrequency: state.binauralBaseFrequency,
          binauralVolume: state.binauralVolume,
          notchFilters: state.notchFilters,
        },
      };
      setCustomPresets((prev) => [...prev, newPreset]);
      return newPreset.id;
    },
    [state]
  );

  const deletePreset = useCallback((id: string) => {
    setCustomPresets((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // Combine default and custom presets
  const allPresets = [...DEFAULT_PRESETS, ...customPresets];

  return {
    state,
    presets: allPresets,
    customPresets,
    toggle,
    setVolume,
    setNoiseType,
    setFrequency,
    setBinauralEnabled,
    setBinauralBeatFrequency,
    setBinauralVolume,
    addNotchFilter,
    removeNotchFilter,
    updateNotchFilter,
    applyPreset,
    getAnalyserData,
    savePreset,
    deletePreset,
  };
}
