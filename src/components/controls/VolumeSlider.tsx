interface VolumeSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export function VolumeSlider({ value, onChange }: VolumeSliderProps) {
  const percentage = Math.round(value * 100);

  return (
    <div className="control-group">
      <label className="control-label">
        <span className="control-label__text">Volume</span>
        <span className="control-label__value">{percentage}%</span>
      </label>
      <div className="slider">
        <input
          type="range"
          min="0"
          max="100"
          value={percentage}
          onChange={(e) => onChange(Number(e.target.value) / 100)}
          className="slider__input"
          aria-label="Volume"
          data-testid="volume-slider"
        />
        <div
          className="slider__track"
          style={{ '--progress': `${percentage}%` } as React.CSSProperties}
        />
        <div
          className="slider__thumb"
          style={{ '--progress': `${percentage}%` } as React.CSSProperties}
        />
      </div>
    </div>
  );
}
