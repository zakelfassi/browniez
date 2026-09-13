> **Archived — no longer maintained.** Existing source remains available; no new features or support are planned.

# Browniez

Browniez is a web noise generator for tinnitus relief and focus through engineered noise. It combines white, pink, and brown noise with optional binaural beats, frequency shaping, and notch filters in a lightweight browser app.

Try it live: [browniez.zakelfassi.com](https://browniez.zakelfassi.com)

> Screenshot placeholder: add an app screenshot here before publishing a polished project page.

## Features

- **Multiple Noise Types**: White, pink, and brown noise generation
- **Binaural Beats**: Configurable frequencies (1-40Hz) mapped to brainwave states
  - Delta (1-4Hz): Deep sleep
  - Theta (4-8Hz): Meditation
  - Alpha (8-14Hz): Relaxation
  - Beta (14-30Hz): Focus
  - Gamma (30-40Hz): Cognition
- **Notch Filtering**: Target specific frequencies for tinnitus masking
- **Presets**: Built-in presets (Sleep, Focus, Tinnitus Relief, Calm) plus custom preset saving
- **Real-time Visualizer**: Waveform display of audio output
- **Keyboard Shortcuts**: Space to play/pause
- **Persistent Settings**: All configurations saved to localStorage

## How it works

Browniez runs entirely in the browser using the Web Audio API. White noise has equal energy across frequencies, pink noise rolls off with a gentler spectrum, and brown noise emphasizes lower frequencies for a deeper, softer sound. Binaural beats send slightly different sine tones to each ear, creating a perceived beat frequency when using headphones. Notch filters attenuate selected frequency bands, which can be useful when experimenting with tinnitus masking or personal comfort settings.

Browniez is not medical advice or a medical device. Use comfortable volumes and consult a clinician for persistent tinnitus or hearing concerns.

## Tech Stack

- [TanStack Start](https://tanstack.com/start) (React + Vite + TanStack Router)
- [Tailwind CSS v4](https://tailwindcss.com/)
- Web Audio API with AudioWorklet
- [Vitest](https://vitest.dev/) + React Testing Library

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview the production build |
| `pnpm test` | Run tests |

## Usage Tips

- **Use headphones** for binaural beats to work (requires stereo separation)
- Adjust the **brightness slider** to control noise frequency cutoff
- For tinnitus relief, add **notch filters** at your specific tinnitus frequencies
- Save your configurations as **custom presets** for quick access

## Project Structure

```
src/
├── audio/
│   ├── engine.ts          # AudioContext management
│   ├── types.ts           # Types and presets
│   └── worklet/           # AudioWorklet processors
├── components/
│   ├── Player.tsx         # Main player component
│   ├── Player.css         # All styles
│   ├── controls/          # Volume, noise type, frequency
│   ├── binaural/          # Binaural beats panel
│   ├── tinnitus/          # Notch filter controls
│   ├── presets/           # Preset selector and save modal
│   └── visualizer/        # Waveform canvas
├── hooks/
│   └── useAudioEngine.ts  # React hook for audio state
└── routes/
    └── index.tsx          # Main route
```

## License

MIT © Zak El Fassi

Part of the agentic software factory stack → [zakelfassi.com/labs](https://zakelfassi.com/labs)
