import { vi } from 'vitest';

// Mock AudioContext for testing
export class MockAudioContext {
  state: AudioContextState = 'suspended';
  currentTime = 0;
  destination = {};
  sampleRate = 44100;

  private _stateChangeCallback: (() => void) | null = null;

  createGain() {
    return {
      gain: {
        value: 1,
        setTargetAtTime: vi.fn(),
      },
      connect: vi.fn().mockReturnThis(),
      disconnect: vi.fn(),
    };
  }

  createBiquadFilter() {
    return {
      type: 'lowpass' as BiquadFilterType,
      frequency: {
        value: 1000,
        setTargetAtTime: vi.fn(),
      },
      Q: {
        value: 1,
        setTargetAtTime: vi.fn(),
      },
      connect: vi.fn().mockReturnThis(),
      disconnect: vi.fn(),
    };
  }

  createOscillator() {
    return {
      type: 'sine' as OscillatorType,
      frequency: {
        value: 440,
        setTargetAtTime: vi.fn(),
      },
      connect: vi.fn().mockReturnThis(),
      disconnect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };
  }

  createAnalyser() {
    return {
      fftSize: 256,
      frequencyBinCount: 128,
      getByteFrequencyData: vi.fn((array: Uint8Array) => {
        for (let i = 0; i < array.length; i++) {
          array[i] = Math.random() * 255;
        }
      }),
      getByteTimeDomainData: vi.fn((array: Uint8Array) => {
        for (let i = 0; i < array.length; i++) {
          array[i] = 128 + Math.random() * 20 - 10;
        }
      }),
      connect: vi.fn().mockReturnThis(),
      disconnect: vi.fn(),
    };
  }

  createChannelMerger(numberOfInputs?: number) {
    return {
      numberOfInputs: numberOfInputs || 2,
      connect: vi.fn().mockReturnThis(),
      disconnect: vi.fn(),
    };
  }

  get audioWorklet() {
    return {
      addModule: vi.fn().mockResolvedValue(undefined),
    };
  }

  async resume() {
    this.state = 'running';
    this._stateChangeCallback?.();
  }

  async suspend() {
    this.state = 'suspended';
    this._stateChangeCallback?.();
  }

  async close() {
    this.state = 'closed';
    this._stateChangeCallback?.();
  }

  addEventListener(type: string, callback: () => void) {
    if (type === 'statechange') {
      this._stateChangeCallback = callback;
    }
  }

  removeEventListener() {}
}

// Mock AudioWorkletNode
export class MockAudioWorkletNode {
  port = {
    postMessage: vi.fn(),
    onmessage: null as ((event: MessageEvent) => void) | null,
  };

  connect = vi.fn().mockReturnThis();
  disconnect = vi.fn();

  constructor(
    _context: MockAudioContext,
    _name: string,
    _options?: AudioWorkletNodeOptions
  ) {}
}

// Setup function to install mocks
export function setupWebAudioMocks() {
  // @ts-expect-error - Mocking global
  globalThis.AudioContext = MockAudioContext;
  // @ts-expect-error - Mocking global
  globalThis.AudioWorkletNode = MockAudioWorkletNode;
  // @ts-expect-error - Mocking URL.createObjectURL
  globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
  // @ts-expect-error - Mocking URL.revokeObjectURL
  globalThis.URL.revokeObjectURL = vi.fn();
}
