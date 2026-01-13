import { useState } from 'react';

interface BinauralPanelProps {
  enabled: boolean;
  beatFrequency: number;
  volume: number;
  onToggle: (enabled: boolean) => void;
  onBeatFrequencyChange: (frequency: number) => void;
  onVolumeChange: (volume: number) => void;
}

const WAVE_RANGES = [
  { name: 'Delta', range: '1-4Hz', description: 'Deep sleep', min: 1, max: 4, detail: 'Promotes deep, restorative sleep and physical healing' },
  { name: 'Theta', range: '4-8Hz', description: 'Meditation', min: 4, max: 8, detail: 'Enhances creativity, meditation, and light dreaming' },
  { name: 'Alpha', range: '8-14Hz', description: 'Relaxation', min: 8, max: 14, detail: 'Calm, wakeful state ideal for stress relief' },
  { name: 'Beta', range: '14-30Hz', description: 'Focus', min: 14, max: 30, detail: 'Active concentration, problem-solving, alertness' },
  { name: 'Gamma', range: '30-40Hz', description: 'Cognition', min: 30, max: 40, detail: 'High-level information processing and peak awareness' },
];

export function BinauralPanel({
  enabled,
  beatFrequency,
  volume,
  onToggle,
  onBeatFrequencyChange,
  onVolumeChange,
}: BinauralPanelProps) {
  const [showGuide, setShowGuide] = useState(false);
  const currentWave = WAVE_RANGES.find(
    (w) => beatFrequency >= w.min && beatFrequency <= w.max
  );

  return (
    <div className={`panel ${enabled ? 'panel--active' : ''}`}>
      <div className="panel__header">
        <button
          className="panel__toggle"
          onClick={() => onToggle(!enabled)}
          aria-pressed={enabled}
        >
          <div className={`toggle ${enabled ? 'toggle--on' : ''}`}>
            <div className="toggle__track" />
            <div className="toggle__thumb" />
          </div>
          <span className="panel__title">Binaural Beats</span>
        </button>
        {currentWave && enabled && (
          <span className="panel__badge">{currentWave.name}</span>
        )}
      </div>

      {enabled && (
        <div className="panel__content">
          <div className="binaural-waves">
            {WAVE_RANGES.map((wave) => (
              <button
                key={wave.name}
                className={`wave-chip ${
                  beatFrequency >= wave.min && beatFrequency <= wave.max
                    ? 'wave-chip--active'
                    : ''
                }`}
                onClick={() => onBeatFrequencyChange((wave.min + wave.max) / 2)}
                title={wave.description}
              >
                <span className="wave-chip__name">{wave.name}</span>
                <span className="wave-chip__range">{wave.range}</span>
              </button>
            ))}
          </div>

          <button
            className="brainwave-guide__toggle"
            onClick={() => setShowGuide(!showGuide)}
            aria-expanded={showGuide}
          >
            <svg className="brainwave-guide__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
            {showGuide ? 'Hide' : 'Learn about'} brainwave frequencies
            <svg
              className={`brainwave-guide__chevron ${showGuide ? 'brainwave-guide__chevron--open' : ''}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {showGuide && (
            <div className="brainwave-guide">
              {WAVE_RANGES.map((wave) => (
                <div key={wave.name} className="brainwave-guide__item">
                  <div className="brainwave-guide__header">
                    <span className="brainwave-guide__name">{wave.name}</span>
                    <span className="brainwave-guide__range">{wave.range}</span>
                  </div>
                  <p className="brainwave-guide__detail">{wave.detail}</p>
                </div>
              ))}
            </div>
          )}

          <div className="control-group control-group--compact">
            <label className="control-label">
              <span className="control-label__text">Beat Frequency</span>
              <span className="control-label__value">{beatFrequency}Hz</span>
            </label>
            <div className="slider">
              <input
                type="range"
                min="1"
                max="40"
                value={beatFrequency}
                onChange={(e) => onBeatFrequencyChange(Number(e.target.value))}
                className="slider__input"
                aria-label="Binaural beat frequency"
              />
              <div
                className="slider__track"
                style={{ '--progress': `${((beatFrequency - 1) / 39) * 100}%` } as React.CSSProperties}
              />
              <div
                className="slider__thumb"
                style={{ '--progress': `${((beatFrequency - 1) / 39) * 100}%` } as React.CSSProperties}
              />
            </div>
          </div>

          <div className="control-group control-group--compact">
            <label className="control-label">
              <span className="control-label__text">Binaural Volume</span>
              <span className="control-label__value">{Math.round(volume * 100)}%</span>
            </label>
            <div className="slider">
              <input
                type="range"
                min="0"
                max="100"
                value={volume * 100}
                onChange={(e) => onVolumeChange(Number(e.target.value) / 100)}
                className="slider__input"
                aria-label="Binaural volume"
              />
              <div
                className="slider__track"
                style={{ '--progress': `${volume * 100}%` } as React.CSSProperties}
              />
              <div
                className="slider__thumb"
                style={{ '--progress': `${volume * 100}%` } as React.CSSProperties}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
