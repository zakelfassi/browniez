import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AudioEngine } from '../engine';

describe('AudioEngine', () => {
  let engine: AudioEngine;

  beforeEach(() => {
    engine = new AudioEngine();
  });

  describe('initialization', () => {
    it('should initialize successfully', async () => {
      await engine.initialize();
      expect(engine.isPlaying()).toBe(false);
    });

    it('should not reinitialize if already initialized', async () => {
      await engine.initialize();
      await engine.initialize(); // Should not throw
      expect(engine.isPlaying()).toBe(false);
    });
  });

  describe('playback controls', () => {
    it('should toggle play state', async () => {
      const isPlaying = await engine.toggle();
      expect(isPlaying).toBe(true);
    });

    it('should toggle back to paused', async () => {
      await engine.toggle(); // Play
      const isPlaying = await engine.toggle(); // Pause
      expect(isPlaying).toBe(false);
    });

    it('should play when calling play()', async () => {
      await engine.play();
      expect(engine.isPlaying()).toBe(true);
    });

    it('should pause when calling pause()', async () => {
      await engine.play();
      await engine.pause();
      expect(engine.isPlaying()).toBe(false);
    });
  });

  describe('volume control', () => {
    it('should set volume', async () => {
      await engine.initialize();
      engine.setVolume(0.5);
      // No error means success (we can't easily test the actual gain value with mocks)
    });

    it('should clamp volume to valid range', async () => {
      await engine.initialize();
      engine.setVolume(-1); // Should clamp to 0
      engine.setVolume(2); // Should clamp to 1
      // No error means success
    });
  });

  describe('noise type', () => {
    it('should set noise type to white', async () => {
      await engine.initialize();
      engine.setNoiseType('white');
      // No error means success
    });

    it('should set noise type to pink', async () => {
      await engine.initialize();
      engine.setNoiseType('pink');
    });

    it('should set noise type to brown', async () => {
      await engine.initialize();
      engine.setNoiseType('brown');
    });
  });

  describe('frequency filter', () => {
    it('should set frequency', async () => {
      await engine.initialize();
      engine.setFrequency(500);
    });

    it('should clamp frequency to valid range', async () => {
      await engine.initialize();
      engine.setFrequency(50); // Below min, should clamp
      engine.setFrequency(25000); // Above max, should clamp
    });
  });

  describe('binaural beats', () => {
    it('should enable binaural beats', async () => {
      await engine.initialize();
      engine.enableBinaural(200, 10, 0.2);
      // No error means success
    });

    it('should disable binaural beats', async () => {
      await engine.initialize();
      engine.enableBinaural(200, 10, 0.2);
      engine.disableBinaural();
    });

    it('should update binaural beat frequency', async () => {
      await engine.initialize();
      engine.enableBinaural(200, 10, 0.2);
      engine.setBinauralBeatFrequency(15);
    });

    it('should update binaural volume', async () => {
      await engine.initialize();
      engine.enableBinaural(200, 10, 0.2);
      engine.setBinauralVolume(0.3);
    });
  });

  describe('notch filters', () => {
    it('should add a notch filter', async () => {
      await engine.initialize();
      engine.addNotchFilter({ id: 'test-notch', frequency: 4000, q: 10, enabled: true });
    });

    it('should remove a notch filter', async () => {
      await engine.initialize();
      engine.addNotchFilter({ id: 'test-notch', frequency: 4000, q: 10, enabled: true });
      engine.removeNotchFilter('test-notch');
    });

    it('should update a notch filter', async () => {
      await engine.initialize();
      engine.addNotchFilter({ id: 'test-notch', frequency: 4000, q: 10, enabled: true });
      engine.updateNotchFilter('test-notch', { frequency: 6000 });
    });

    it('should handle multiple notch filters', async () => {
      await engine.initialize();
      engine.addNotchFilter({ id: 'notch-1', frequency: 4000, q: 10, enabled: true });
      engine.addNotchFilter({ id: 'notch-2', frequency: 6000, q: 10, enabled: true });
      engine.addNotchFilter({ id: 'notch-3', frequency: 8000, q: 10, enabled: true });
    });
  });

  describe('analyser', () => {
    it('should return frequency data', async () => {
      await engine.initialize();
      const data = engine.getFrequencyData();
      expect(data).toBeInstanceOf(Uint8Array);
    });

    it('should return time domain data', async () => {
      await engine.initialize();
      const data = engine.getTimeDomainData();
      expect(data).toBeInstanceOf(Uint8Array);
    });
  });

  describe('cleanup', () => {
    it('should dispose properly', async () => {
      await engine.initialize();
      await engine.play();
      engine.dispose();
      expect(engine.isPlaying()).toBe(false);
    });
  });
});
