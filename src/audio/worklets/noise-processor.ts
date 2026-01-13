// AudioWorklet processor for generating white, pink, and brown noise
// This runs in a separate thread for low-latency audio processing

export type NoiseType = 'white' | 'pink' | 'brown';

interface NoiseProcessorOptions {
  processorOptions?: {
    noiseType?: NoiseType;
  };
}

class NoiseProcessor extends AudioWorkletProcessor {
  private noiseType: NoiseType = 'brown';

  // Brown noise state
  private brownLastOut = 0;

  // Pink noise state (Paul Kellet algorithm)
  private pinkB0 = 0;
  private pinkB1 = 0;
  private pinkB2 = 0;
  private pinkB3 = 0;
  private pinkB4 = 0;
  private pinkB5 = 0;
  private pinkB6 = 0;

  static get parameterDescriptors() {
    return [
      {
        name: 'noiseType',
        defaultValue: 2, // 0 = white, 1 = pink, 2 = brown
        minValue: 0,
        maxValue: 2,
        automationRate: 'k-rate' as const,
      },
    ];
  }

  constructor(options?: NoiseProcessorOptions) {
    super();
    if (options?.processorOptions?.noiseType) {
      this.noiseType = options.processorOptions.noiseType;
    }

    // Listen for messages from main thread
    this.port.onmessage = (event) => {
      if (event.data.type === 'setNoiseType') {
        this.noiseType = event.data.noiseType;
      }
    };
  }

  private generateWhiteNoise(): number {
    return Math.random() * 2 - 1;
  }

  private generatePinkNoise(): number {
    const white = this.generateWhiteNoise();

    // Paul Kellet's refined method
    this.pinkB0 = 0.99886 * this.pinkB0 + white * 0.0555179;
    this.pinkB1 = 0.99332 * this.pinkB1 + white * 0.0750759;
    this.pinkB2 = 0.96900 * this.pinkB2 + white * 0.1538520;
    this.pinkB3 = 0.86650 * this.pinkB3 + white * 0.3104856;
    this.pinkB4 = 0.55000 * this.pinkB4 + white * 0.5329522;
    this.pinkB5 = -0.7616 * this.pinkB5 - white * 0.0168980;

    const output = (
      this.pinkB0 + this.pinkB1 + this.pinkB2 + this.pinkB3 +
      this.pinkB4 + this.pinkB5 + this.pinkB6 + white * 0.5362
    ) * 0.11;

    this.pinkB6 = white * 0.115926;

    return output;
  }

  private generateBrownNoise(): number {
    const white = this.generateWhiteNoise();
    this.brownLastOut = (this.brownLastOut + 0.02 * white) / 1.02;
    return this.brownLastOut * 3.5; // Gain compensation
  }

  process(
    _inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>
  ): boolean {
    const output = outputs[0];

    // Get noise type from parameter (allows automation)
    const noiseTypeParam = parameters.noiseType[0];
    let currentNoiseType = this.noiseType;
    if (noiseTypeParam !== undefined) {
      if (noiseTypeParam < 0.5) currentNoiseType = 'white';
      else if (noiseTypeParam < 1.5) currentNoiseType = 'pink';
      else currentNoiseType = 'brown';
    }

    for (let channel = 0; channel < output.length; channel++) {
      const outputChannel = output[channel];

      for (let i = 0; i < outputChannel.length; i++) {
        let sample: number;

        switch (currentNoiseType) {
          case 'white':
            sample = this.generateWhiteNoise();
            break;
          case 'pink':
            sample = this.generatePinkNoise();
            break;
          case 'brown':
          default:
            sample = this.generateBrownNoise();
            break;
        }

        outputChannel[i] = sample;
      }
    }

    return true; // Keep processor alive
  }
}

registerProcessor('noise-processor', NoiseProcessor);
