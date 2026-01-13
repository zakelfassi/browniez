# Browniez - Brown Noise Simulator

A web-based therapeutic audio application for tinnitus relief and focus enhancement.

## Tech Stack

- **Framework**: TanStack Start (React + Vite + TanStack Router)
- **Audio**: Web Audio API with AudioWorklet for low-latency processing
- **Styling**: Tailwind CSS v4
- **Testing**: Vitest + React Testing Library + Playwright
- **Package Manager**: pnpm

## Project Structure

```
src/
├── audio/                    # Audio engine and processing
│   ├── engine.ts            # Main AudioContext management
│   ├── types.ts             # TypeScript types and presets
│   └── worklets/            # AudioWorklet processors
├── components/              # React components
│   ├── Player.tsx          # Main player component
│   ├── Player.css          # Player styles
│   ├── controls/           # Play, volume, noise type, frequency
│   ├── binaural/           # Binaural beats panel
│   ├── tinnitus/           # Notch filter controls
│   ├── presets/            # Quick preset buttons
│   └── visualizer/         # Waveform canvas
├── hooks/
│   └── useAudioEngine.ts   # React hook for audio state
└── routes/
    └── index.tsx           # Main page
```

## Key Features

1. **Noise Types**: White, Pink, Brown noise generation via AudioWorklet
2. **Binaural Beats**: Stereo oscillators with configurable beat frequencies (1-40Hz)
3. **Notch Filtering**: Remove specific tinnitus frequencies
4. **Presets**: Sleep, Focus, Tinnitus Relief, Calm
5. **Persistence**: Settings saved to localStorage
6. **Keyboard**: Space to play/pause

## Development

```bash
pnpm dev      # Start dev server
pnpm build    # Production build
pnpm test     # Run unit tests
pnpm test:e2e # Run E2E tests
```

## Audio Architecture

```
NoiseWorklet → NoiseGain → FrequencyFilter → [NotchFilters] → MasterGain → Destination
                                                                    ↑
BinauralOscillators (L/R) → ChannelMerger → BinauralGain ──────────┘
```

## Notes

- Always use pnpm (not npm/yarn)
- Web Audio API requires user interaction to start
- Binaural beats require headphones for effect
- AudioWorklet runs in separate thread for low latency
