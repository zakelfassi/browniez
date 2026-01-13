interface PlayButtonProps {
  isPlaying: boolean;
  isLoading: boolean;
  onToggle: () => void;
}

export function PlayButton({ isPlaying, isLoading, onToggle }: PlayButtonProps) {
  return (
    <button
      className="play-button"
      onClick={onToggle}
      disabled={isLoading}
      aria-label={isPlaying ? 'Pause' : 'Play'}
      aria-pressed={isPlaying}
      data-testid="play-button"
    >
      <div className="play-button__ring play-button__ring--outer" />
      <div className="play-button__ring play-button__ring--inner" />
      <div className="play-button__core">
        {isLoading ? (
          <svg className="play-button__spinner" viewBox="0 0 24 24" fill="none">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="32"
              strokeDashoffset="32"
            />
          </svg>
        ) : isPlaying ? (
          <svg className="play-button__icon" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          <svg className="play-button__icon play-button__icon--play" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5.14v13.72a1 1 0 001.5.86l11-6.86a1 1 0 000-1.72l-11-6.86a1 1 0 00-1.5.86z" />
          </svg>
        )}
      </div>
      <div className="play-button__glow" />
    </button>
  );
}
