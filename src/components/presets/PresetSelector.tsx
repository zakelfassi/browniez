import { useState } from 'react';
import type { Preset } from '../../audio/types';
import { getWaveTypeInfo } from '../../audio';
import { SavePresetModal } from './SavePresetModal';

interface PresetSelectorProps {
  presets: Preset[];
  onSelect: (preset: Preset) => void;
  onSave: (name: string) => void;
  onDelete: (id: string) => void;
}

function getNoiseTypeLabel(type: string | undefined): string {
  switch (type) {
    case 'white': return 'White Noise';
    case 'pink': return 'Pink Noise';
    case 'brown': return 'Brown Noise';
    default: return 'Brown Noise';
  }
}

function PresetCard({
  preset,
  onSelect,
  onDelete,
}: {
  preset: Preset;
  onSelect: () => void;
  onDelete?: () => void;
}) {
  const config = preset.config;
  const noiseLabel = getNoiseTypeLabel(config.noiseType);
  const hasBinaural = config.binauralEnabled;
  const binauralInfo = hasBinaural && config.binauralBeatFrequency
    ? getWaveTypeInfo(config.binauralBeatFrequency)
    : null;
  const notchCount = config.notchFilters?.length || 0;

  return (
    <button
      className="preset-card"
      onClick={onSelect}
      title={preset.description}
    >
      {preset.isCustom && onDelete && (
        <button
          className="preset-card__delete"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          aria-label={`Delete ${preset.name}`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}

      <div className="preset-card__header">
        <span className="preset-card__name">{preset.name}</span>
        {preset.isCustom && <span className="preset-card__custom-badge">Custom</span>}
      </div>

      <div className="preset-card__details">
        <span className="preset-card__noise">{noiseLabel}</span>

        {binauralInfo && (
          <span className="preset-card__binaural">
            {binauralInfo.name} {config.binauralBeatFrequency}Hz
            <span className="preset-card__binaural-desc">{binauralInfo.description}</span>
          </span>
        )}

        {!hasBinaural && (
          <span className="preset-card__no-binaural">No binaural</span>
        )}

        {notchCount > 0 && (
          <span className="preset-card__notch">
            {notchCount} notch filter{notchCount > 1 ? 's' : ''}
          </span>
        )}
      </div>

      <p className="preset-card__description">{preset.description}</p>
    </button>
  );
}

export function PresetSelector({ presets, onSelect, onSave, onDelete }: PresetSelectorProps) {
  const [showSaveModal, setShowSaveModal] = useState(false);

  const defaultPresets = presets.filter(p => !p.isCustom);
  const customPresets = presets.filter(p => p.isCustom);

  return (
    <div className="presets-section">
      <div className="presets-header">
        <span className="presets__label">Presets</span>
        <button
          className="presets__save-btn"
          onClick={() => setShowSaveModal(true)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Save Current
        </button>
      </div>

      <div className="presets__grid">
        {defaultPresets.map((preset) => (
          <PresetCard
            key={preset.id}
            preset={preset}
            onSelect={() => onSelect(preset)}
          />
        ))}
      </div>

      {customPresets.length > 0 && (
        <>
          <span className="presets__label presets__label--custom">Your Presets</span>
          <div className="presets__grid presets__grid--custom">
            {customPresets.map((preset) => (
              <PresetCard
                key={preset.id}
                preset={preset}
                onSelect={() => onSelect(preset)}
                onDelete={() => onDelete(preset.id)}
              />
            ))}
          </div>
        </>
      )}

      {showSaveModal && (
        <SavePresetModal
          onSave={(name) => {
            onSave(name);
            setShowSaveModal(false);
          }}
          onClose={() => setShowSaveModal(false)}
        />
      )}
    </div>
  );
}
