import { describe, it, expect } from 'vitest';

// Test the noise generation algorithms directly
// These are the same algorithms used in the AudioWorklet

describe('Noise Algorithms', () => {
  describe('White Noise', () => {
    function generateWhiteNoise(): number {
      return Math.random() * 2 - 1;
    }

    it('should generate values between -1 and 1', () => {
      for (let i = 0; i < 1000; i++) {
        const sample = generateWhiteNoise();
        expect(sample).toBeGreaterThanOrEqual(-1);
        expect(sample).toBeLessThanOrEqual(1);
      }
    });

    it('should have roughly uniform distribution', () => {
      const samples = Array.from({ length: 10000 }, generateWhiteNoise);
      const mean = samples.reduce((a, b) => a + b, 0) / samples.length;

      // Mean should be close to 0 for uniform distribution in [-1, 1]
      expect(Math.abs(mean)).toBeLessThan(0.1);
    });
  });

  describe('Brown Noise', () => {
    let lastOut = 0;

    function generateBrownNoise(): number {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.02 * white) / 1.02;
      return lastOut * 3.5;
    }

    function resetBrownNoise() {
      lastOut = 0;
    }

    it('should generate values within reasonable bounds', () => {
      resetBrownNoise();

      for (let i = 0; i < 10000; i++) {
        const sample = generateBrownNoise();
        // Brown noise with 3.5x gain should stay roughly within [-3.5, 3.5]
        // but typically much closer to center due to integration
        expect(sample).toBeGreaterThanOrEqual(-4);
        expect(sample).toBeLessThanOrEqual(4);
      }
    });

    it('should have smoother output than white noise', () => {
      resetBrownNoise();

      const samples: number[] = [];
      for (let i = 0; i < 1000; i++) {
        samples.push(generateBrownNoise());
      }

      // Calculate average absolute difference between consecutive samples
      let totalDiff = 0;
      for (let i = 1; i < samples.length; i++) {
        totalDiff += Math.abs(samples[i] - samples[i - 1]);
      }
      const avgDiff = totalDiff / (samples.length - 1);

      // Brown noise should have small differences between consecutive samples
      // because it's integrated (low-pass filtered) white noise
      expect(avgDiff).toBeLessThan(0.5);
    });
  });

  describe('Pink Noise', () => {
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    function generatePinkNoise(): number {
      const white = Math.random() * 2 - 1;

      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;

      const output = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;

      return output;
    }

    function resetPinkNoise() {
      b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0;
    }

    it('should generate values within reasonable bounds after warmup', () => {
      resetPinkNoise();

      // Warmup period for filter coefficients to stabilize
      for (let i = 0; i < 1000; i++) {
        generatePinkNoise();
      }

      for (let i = 0; i < 10000; i++) {
        const sample = generatePinkNoise();
        // Pink noise should stay within [-1, 1] with 0.11 gain factor
        expect(sample).toBeGreaterThanOrEqual(-2);
        expect(sample).toBeLessThanOrEqual(2);
      }
    });

    it('should produce values centered around zero', () => {
      resetPinkNoise();

      // Warmup
      for (let i = 0; i < 1000; i++) {
        generatePinkNoise();
      }

      const samples = Array.from({ length: 10000 }, generatePinkNoise);
      const mean = samples.reduce((a, b) => a + b, 0) / samples.length;

      expect(Math.abs(mean)).toBeLessThan(0.1);
    });
  });
});
