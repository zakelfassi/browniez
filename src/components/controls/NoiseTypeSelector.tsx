import type { NoiseType } from '../../audio/types';

interface NoiseTypeSelectorProps {
  value: NoiseType;
  onChange: (type: NoiseType) => void;
}

const NOISE_TYPES: { value: NoiseType; label: string; description: string }[] = [
  { value: 'white', label: 'White', description: 'Bright, airy' },
  { value: 'pink', label: 'Pink', description: 'Balanced, natural' },
  { value: 'brown', label: 'Brown', description: 'Deep, warm' },
];

export function NoiseTypeSelector({ value, onChange }: NoiseTypeSelectorProps) {
  return (
    <div className="control-group">
      <label className="control-label">
        <span className="control-label__text">Noise Type</span>
      </label>
      <div className="noise-selector" role="radiogroup" aria-label="Noise type">
        {NOISE_TYPES.map((type) => (
          <button
            key={type.value}
            className={`noise-selector__option ${
              value === type.value ? 'noise-selector__option--active' : ''
            }`}
            onClick={() => onChange(type.value)}
            role="radio"
            aria-checked={value === type.value}
            aria-selected={value === type.value}
            data-testid={`noise-type-${type.value}`}
          >
            <span className="noise-selector__label">{type.label}</span>
            <span className="noise-selector__desc">{type.description}</span>
            <div className="noise-selector__indicator" />
          </button>
        ))}
      </div>
    </div>
  );
}
