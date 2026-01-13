import { useState } from 'react';
import type { NotchFilterConfig } from '../../audio/types';

interface NotchFilterPanelProps {
  filters: NotchFilterConfig[];
  onAdd: (frequency: number, q: number) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<NotchFilterConfig>) => void;
}

const COMMON_FREQUENCIES = [
  { hz: 4000, label: '4kHz' },
  { hz: 6000, label: '6kHz' },
  { hz: 8000, label: '8kHz' },
  { hz: 10000, label: '10kHz' },
];

export function NotchFilterPanel({
  filters,
  onAdd,
  onRemove,
  onUpdate,
}: NotchFilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(filters.length > 0);
  const [customFreq, setCustomFreq] = useState('');

  const handleAddCustom = () => {
    const freq = parseInt(customFreq, 10);
    if (freq >= 100 && freq <= 20000) {
      onAdd(freq, 10);
      setCustomFreq('');
    }
  };

  const formatFrequency = (hz: number) => {
    if (hz >= 1000) {
      return `${(hz / 1000).toFixed(1)}kHz`;
    }
    return `${hz}Hz`;
  };

  return (
    <div className={`panel ${isExpanded ? 'panel--active' : ''}`}>
      <div className="panel__header">
        <button
          className="panel__toggle"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
        >
          <svg
            className={`panel__chevron ${isExpanded ? 'panel__chevron--open' : ''}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
          <span className="panel__title">Notch Filters</span>
        </button>
        {filters.length > 0 && (
          <span className="panel__badge">{filters.length} active</span>
        )}
      </div>

      {isExpanded && (
        <div className="panel__content">
          <p className="panel__hint">
            Remove specific frequencies that match your tinnitus pitch
          </p>

          {/* Quick add buttons */}
          <div className="notch-presets">
            {COMMON_FREQUENCIES.map((freq) => {
              const exists = filters.some((f) => f.frequency === freq.hz);
              return (
                <button
                  key={freq.hz}
                  className={`notch-preset ${exists ? 'notch-preset--active' : ''}`}
                  onClick={() =>
                    exists
                      ? onRemove(filters.find((f) => f.frequency === freq.hz)!.id)
                      : onAdd(freq.hz, 10)
                  }
                >
                  {freq.label}
                  {exists && (
                    <svg viewBox="0 0 24 24" fill="currentColor" className="notch-preset__check">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>

          {/* Custom frequency input */}
          <div className="notch-custom">
            <input
              type="number"
              min="100"
              max="20000"
              placeholder="Custom Hz"
              value={customFreq}
              onChange={(e) => setCustomFreq(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
              className="notch-custom__input"
            />
            <button
              className="notch-custom__add"
              onClick={handleAddCustom}
              disabled={!customFreq || parseInt(customFreq, 10) < 100}
            >
              Add
            </button>
          </div>

          {/* Active filters list */}
          {filters.length > 0 && (
            <div className="notch-list">
              {filters.map((filter) => (
                <div key={filter.id} className="notch-item">
                  <div className="notch-item__info">
                    <span className="notch-item__freq">
                      {formatFrequency(filter.frequency)}
                    </span>
                    <div className="notch-item__q">
                      <label>Width:</label>
                      <input
                        type="range"
                        min="1"
                        max="30"
                        value={filter.q}
                        onChange={(e) =>
                          onUpdate(filter.id, { q: Number(e.target.value) })
                        }
                        className="notch-item__slider"
                      />
                      <span>{filter.q}</span>
                    </div>
                  </div>
                  <button
                    className="notch-item__remove"
                    onClick={() => onRemove(filter.id)}
                    aria-label={`Remove ${formatFrequency(filter.frequency)} filter`}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
