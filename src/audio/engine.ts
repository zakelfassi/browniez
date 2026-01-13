import type { NoiseType, NotchFilterConfig } from './types';

export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private noiseNode: AudioWorkletNode | null = null;
  private noiseGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private frequencyFilter: BiquadFilterNode | null = null;
  private analyser: AnalyserNode | null = null;

  // Binaural beat oscillators
  private binauralLeft: OscillatorNode | null = null;
  private binauralRight: OscillatorNode | null = null;
  private binauralGain: GainNode | null = null;
  private binauralMerger: ChannelMergerNode | null = null;

  // Notch filters
  private notchFilters: Map<string, BiquadFilterNode> = new Map();

  private isInitialized = false;
  private currentNoiseType: NoiseType = 'brown';

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log('[AudioEngine] Step 1: Creating AudioContext...');
    this.audioContext = new AudioContext();
    console.log('[AudioEngine] Step 1 done. State:', this.audioContext.state, 'Sample rate:', this.audioContext.sampleRate);

    // Load worklet from static file (better iOS Safari compatibility)
    console.log('[AudioEngine] Step 2: Loading AudioWorklet module...');
    try {
      await this.audioContext.audioWorklet.addModule('/noise-processor.js');
      console.log('[AudioEngine] Step 2 done. Worklet loaded.');
    } catch (e) {
      console.error('[AudioEngine] Step 2 FAILED:', e);
      throw e;
    }

    // Create noise worklet node
    console.log('[AudioEngine] Step 3: Creating AudioWorkletNode...');
    this.noiseNode = new AudioWorkletNode(this.audioContext, 'noise-processor', {
      processorOptions: { noiseType: this.currentNoiseType },
    });
    console.log('[AudioEngine] Step 3 done. Node created.');

    // Create gain nodes
    this.noiseGain = this.audioContext.createGain();
    this.noiseGain.gain.value = 1;

    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = 0.5;

    // Create frequency filter (lowpass for brightness control)
    this.frequencyFilter = this.audioContext.createBiquadFilter();
    this.frequencyFilter.type = 'lowpass';
    this.frequencyFilter.frequency.value = 1000;
    this.frequencyFilter.Q.value = 0.7;

    // Create analyser for visualization
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;

    // Create binaural beat components
    this.binauralGain = this.audioContext.createGain();
    this.binauralGain.gain.value = 0;

    this.binauralMerger = this.audioContext.createChannelMerger(2);

    // Connect noise path: NoiseNode -> NoiseGain -> FrequencyFilter -> MasterGain -> Destination
    this.noiseNode.connect(this.noiseGain);
    this.noiseGain.connect(this.frequencyFilter);
    // Notch filters will be inserted between frequencyFilter and masterGain
    this.frequencyFilter.connect(this.masterGain);

    // Connect binaural to master (will be set up when enabled)
    this.binauralMerger.connect(this.binauralGain);
    this.binauralGain.connect(this.masterGain);

    // Connect master to destination and analyser
    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);

    this.isInitialized = true;
  }

  async play(): Promise<void> {
    console.log('[AudioEngine] play() called. Has context:', !!this.audioContext);
    if (!this.audioContext) {
      await this.initialize();
    }

    console.log('[AudioEngine] Context state before resume:', this.audioContext?.state);
    if (this.audioContext?.state === 'suspended') {
      console.log('[AudioEngine] Calling resume()...');
      await this.audioContext.resume();
      console.log('[AudioEngine] resume() done. State:', this.audioContext.state);
    }
  }

  async pause(): Promise<void> {
    if (this.audioContext?.state === 'running') {
      await this.audioContext.suspend();
    }
  }

  async toggle(): Promise<boolean> {
    if (!this.audioContext) {
      await this.initialize();
      await this.play();
      return true;
    }

    if (this.audioContext.state === 'running') {
      await this.pause();
      return false;
    } else {
      await this.play();
      return true;
    }
  }

  setVolume(volume: number): void {
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(
        Math.max(0, Math.min(1, volume)),
        this.audioContext?.currentTime || 0,
        0.02
      );
    }
  }

  setNoiseType(type: NoiseType): void {
    this.currentNoiseType = type;
    if (this.noiseNode) {
      this.noiseNode.port.postMessage({ type: 'setNoiseType', noiseType: type });
    }
  }

  setFrequency(frequency: number): void {
    if (this.frequencyFilter && this.audioContext) {
      this.frequencyFilter.frequency.setTargetAtTime(
        Math.max(100, Math.min(20000, frequency)),
        this.audioContext.currentTime,
        0.02
      );
    }
  }

  // Binaural beats methods
  enableBinaural(baseFrequency: number, beatFrequency: number, volume: number): void {
    if (!this.audioContext || !this.binauralMerger || !this.binauralGain) return;

    // Stop existing oscillators
    this.disableBinaural();

    // Create new oscillators
    this.binauralLeft = this.audioContext.createOscillator();
    this.binauralRight = this.audioContext.createOscillator();

    this.binauralLeft.type = 'sine';
    this.binauralRight.type = 'sine';

    this.binauralLeft.frequency.value = baseFrequency;
    this.binauralRight.frequency.value = baseFrequency + beatFrequency;

    // Create gain nodes for each channel
    const leftGain = this.audioContext.createGain();
    const rightGain = this.audioContext.createGain();
    leftGain.gain.value = 1;
    rightGain.gain.value = 1;

    // Connect: Left oscillator -> left channel, Right oscillator -> right channel
    this.binauralLeft.connect(leftGain);
    this.binauralRight.connect(rightGain);
    leftGain.connect(this.binauralMerger, 0, 0);
    rightGain.connect(this.binauralMerger, 0, 1);

    // Set binaural volume
    this.binauralGain.gain.setTargetAtTime(volume, this.audioContext.currentTime, 0.02);

    // Start oscillators
    this.binauralLeft.start();
    this.binauralRight.start();
  }

  disableBinaural(): void {
    if (this.binauralLeft) {
      this.binauralLeft.stop();
      this.binauralLeft.disconnect();
      this.binauralLeft = null;
    }
    if (this.binauralRight) {
      this.binauralRight.stop();
      this.binauralRight.disconnect();
      this.binauralRight = null;
    }
    if (this.binauralGain && this.audioContext) {
      this.binauralGain.gain.setTargetAtTime(0, this.audioContext.currentTime, 0.02);
    }
  }

  setBinauralBeatFrequency(beatFrequency: number): void {
    if (this.binauralRight && this.binauralLeft && this.audioContext) {
      const baseFreq = this.binauralLeft.frequency.value;
      this.binauralRight.frequency.setTargetAtTime(
        baseFreq + beatFrequency,
        this.audioContext.currentTime,
        0.02
      );
    }
  }

  setBinauralVolume(volume: number): void {
    if (this.binauralGain && this.audioContext) {
      this.binauralGain.gain.setTargetAtTime(
        Math.max(0, Math.min(1, volume)),
        this.audioContext.currentTime,
        0.02
      );
    }
  }

  // Notch filter methods
  addNotchFilter(config: NotchFilterConfig): void {
    if (!this.audioContext || !this.frequencyFilter || !this.masterGain) return;

    const notch = this.audioContext.createBiquadFilter();
    notch.type = 'notch';
    notch.frequency.value = config.frequency;
    notch.Q.value = config.q;

    this.notchFilters.set(config.id, notch);
    this.rebuildFilterChain();
  }

  removeNotchFilter(id: string): void {
    const filter = this.notchFilters.get(id);
    if (filter) {
      filter.disconnect();
      this.notchFilters.delete(id);
      this.rebuildFilterChain();
    }
  }

  updateNotchFilter(id: string, config: Partial<NotchFilterConfig>): void {
    const filter = this.notchFilters.get(id);
    if (filter && this.audioContext) {
      if (config.frequency !== undefined) {
        filter.frequency.setTargetAtTime(config.frequency, this.audioContext.currentTime, 0.02);
      }
      if (config.q !== undefined) {
        filter.Q.setTargetAtTime(config.q, this.audioContext.currentTime, 0.02);
      }
    }
  }

  private rebuildFilterChain(): void {
    if (!this.frequencyFilter || !this.masterGain) return;

    // Disconnect existing chain
    this.frequencyFilter.disconnect();
    this.notchFilters.forEach((filter) => filter.disconnect());

    // Rebuild chain
    let lastNode: AudioNode = this.frequencyFilter;
    this.notchFilters.forEach((filter) => {
      lastNode.connect(filter);
      lastNode = filter;
    });
    lastNode.connect(this.masterGain);
  }

  // Visualization
  getAnalyserNode(): AnalyserNode | null {
    return this.analyser;
  }

  getFrequencyData(): Uint8Array {
    if (!this.analyser) return new Uint8Array(0);
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    return data;
  }

  getTimeDomainData(): Uint8Array {
    if (!this.analyser) return new Uint8Array(0);
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteTimeDomainData(data);
    return data;
  }

  isPlaying(): boolean {
    return this.audioContext?.state === 'running';
  }

  dispose(): void {
    this.disableBinaural();
    this.notchFilters.forEach((filter) => filter.disconnect());
    this.notchFilters.clear();

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.noiseNode = null;
    this.noiseGain = null;
    this.masterGain = null;
    this.frequencyFilter = null;
    this.analyser = null;
    this.isInitialized = false;
  }
}

// Singleton instance
let engineInstance: AudioEngine | null = null;

export function getAudioEngine(): AudioEngine {
  if (!engineInstance) {
    engineInstance = new AudioEngine();
  }
  return engineInstance;
}
