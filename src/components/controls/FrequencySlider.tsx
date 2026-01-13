interface FrequencySliderProps {
  value: number;
  onChange: (value: number) => void;
}

export function FrequencySlider({ value, onChange }: FrequencySliderProps) {
  // Convert to log scale for better UX (100Hz - 10000Hz)
  const minLog = Math.log(100);
  const maxLog = Math.log(10000);
  const scale = (Math.log(value) - minLog) / (maxLog - minLog);
  const percentage = Math.round(scale * 100);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pct = Number(e.target.value) / 100;
    const logValue = minLog + pct * (maxLog - minLog);
    onChange(Math.round(Math.exp(logValue)));
  };

  const formatFrequency = (hz: number) => {
    if (hz >= 1000) {
      return `${(hz / 1000).toFixed(1)}kHz`;
    }
    return `${hz}Hz`;
  };

  return (
    <div className="control-group">
      <label className="control-label">
        <span className="control-label__text">Brightness</span>
        <span className="control-label__value">{formatFrequency(value)}</span>
      </label>
      <div className="slider slider--frequency">
        <input
          type="range"
          min="0"
          max="100"
          value={percentage}
          onChange={handleChange}
          className="slider__input"
          aria-label="Frequency brightness"
        />
        <div
          className="slider__track"
          style={{ '--progress': `${percentage}%` } as React.CSSProperties}
        />
        <div
          className="slider__thumb"
          style={{ '--progress': `${percentage}%` } as React.CSSProperties}
        />
        <div className="slider__labels">
          <span>Dark</span>
          <span>Bright</span>
        </div>
      </div>
    </div>
  );
}
