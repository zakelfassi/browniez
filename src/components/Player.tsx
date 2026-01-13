import { useEffect, useCallback } from 'react';
import { useAudioEngine } from '../hooks/useAudioEngine';
import { PlayButton } from './controls/PlayButton';
import { VolumeSlider } from './controls/VolumeSlider';
import { NoiseTypeSelector } from './controls/NoiseTypeSelector';
import { FrequencySlider } from './controls/FrequencySlider';
import { BinauralPanel } from './binaural/BinauralPanel';
import { NotchFilterPanel } from './tinnitus/NotchFilterPanel';
import { PresetSelector } from './presets/PresetSelector';
import { Waveform } from './visualizer/Waveform';

export function Player() {
  const {
    state,
    presets,
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
  } = useAudioEngine();

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (
        e.code === 'Space' &&
        !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)
      ) {
        e.preventDefault();
        toggle();
      }
    },
    [toggle]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="player">
      {/* Atmospheric background */}
      <div className="player__atmosphere">
        <div className="player__orb player__orb--1" />
        <div className="player__orb player__orb--2" />
        <div className="player__orb player__orb--3" />
        <div className="player__grain" />
      </div>

      <div className="player__content">
        {/* Header */}
        <header className="player__header">
          <h1 className="player__title">
            <span className="player__title-accent">brownie</span>z
          </h1>
          <p className="player__subtitle">tinnitus relief & focus</p>
        </header>

        {/* Central Play Control */}
        <div className="player__main">
          <Waveform
            isPlaying={state.isPlaying}
            getAnalyserData={getAnalyserData}
          />
          <PlayButton
            isPlaying={state.isPlaying}
            isLoading={state.isLoading}
            onToggle={toggle}
          />
        </div>

        {/* Controls Grid */}
        <div className="player__controls">
          {/* Primary Controls */}
          <div className="player__section player__section--primary">
            <NoiseTypeSelector
              value={state.noiseType}
              onChange={setNoiseType}
            />
            <VolumeSlider value={state.volume} onChange={setVolume} />
            <FrequencySlider value={state.frequency} onChange={setFrequency} />
          </div>

          {/* Presets */}
          <div className="player__section player__section--presets">
            <PresetSelector
              presets={presets}
              onSelect={applyPreset}
              onSave={savePreset}
              onDelete={deletePreset}
            />
          </div>

          {/* Advanced Controls */}
          <div className="player__section player__section--advanced">
            <BinauralPanel
              enabled={state.binauralEnabled}
              beatFrequency={state.binauralBeatFrequency}
              volume={state.binauralVolume}
              onToggle={setBinauralEnabled}
              onBeatFrequencyChange={setBinauralBeatFrequency}
              onVolumeChange={setBinauralVolume}
            />
            <NotchFilterPanel
              filters={state.notchFilters}
              onAdd={addNotchFilter}
              onRemove={removeNotchFilter}
              onUpdate={updateNotchFilter}
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="player__footer">
          <p>
            Use headphones for binaural beats
            <span className="player__kbd">Space</span> to play/pause
          </p>

          <div className="signature">
            <div className="signature__divider">
              <span className="signature__wave">~</span>
            </div>
            <p className="signature__intro">
              Fueled by tinnitus. For more ramblings on tech, philosophy & the metaphysical...
            </p>
            <a
              href="https://zakelfassi.com"
              target="_blank"
              rel="noopener noreferrer"
              className="signature__link"
            >
              <span className="signature__name">Zak El Fassi</span>
              <svg className="signature__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
