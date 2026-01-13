import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PlayButton } from '../controls/PlayButton';
import { VolumeSlider } from '../controls/VolumeSlider';
import { NoiseTypeSelector } from '../controls/NoiseTypeSelector';
import { FrequencySlider } from '../controls/FrequencySlider';

describe('PlayButton', () => {
  it('should render play icon when not playing', () => {
    render(<PlayButton isPlaying={false} isLoading={false} onToggle={() => {}} />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-pressed', 'false');
    expect(button).toHaveAttribute('aria-label', 'Play');
  });

  it('should render pause icon when playing', () => {
    render(<PlayButton isPlaying={true} isLoading={false} onToggle={() => {}} />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(button).toHaveAttribute('aria-label', 'Pause');
  });

  it('should be disabled when loading', () => {
    render(<PlayButton isPlaying={false} isLoading={true} onToggle={() => {}} />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should call onToggle when clicked', () => {
    const handleToggle = vi.fn();
    render(<PlayButton isPlaying={false} isLoading={false} onToggle={handleToggle} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleToggle).toHaveBeenCalledTimes(1);
  });
});

describe('VolumeSlider', () => {
  it('should display current volume percentage', () => {
    render(<VolumeSlider value={0.5} onChange={() => {}} />);
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('should call onChange when slider value changes', () => {
    const handleChange = vi.fn();
    render(<VolumeSlider value={0.5} onChange={handleChange} />);
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '75' } });
    expect(handleChange).toHaveBeenCalledWith(0.75);
  });

  it('should have correct aria-label', () => {
    render(<VolumeSlider value={0.5} onChange={() => {}} />);
    expect(screen.getByRole('slider')).toHaveAttribute('aria-label', 'Volume');
  });
});

describe('NoiseTypeSelector', () => {
  it('should render all noise type options', () => {
    render(<NoiseTypeSelector value="brown" onChange={() => {}} />);
    expect(screen.getByText('White')).toBeInTheDocument();
    expect(screen.getByText('Pink')).toBeInTheDocument();
    expect(screen.getByText('Brown')).toBeInTheDocument();
  });

  it('should mark selected type as active', () => {
    render(<NoiseTypeSelector value="pink" onChange={() => {}} />);
    const pinkOption = screen.getByTestId('noise-type-pink');
    expect(pinkOption).toHaveAttribute('aria-checked', 'true');
  });

  it('should call onChange when option is clicked', () => {
    const handleChange = vi.fn();
    render(<NoiseTypeSelector value="brown" onChange={handleChange} />);
    fireEvent.click(screen.getByTestId('noise-type-white'));
    expect(handleChange).toHaveBeenCalledWith('white');
  });
});

describe('FrequencySlider', () => {
  it('should display formatted frequency value', () => {
    render(<FrequencySlider value={1000} onChange={() => {}} />);
    expect(screen.getByText('1.0kHz')).toBeInTheDocument();
  });

  it('should display Hz for values under 1000', () => {
    render(<FrequencySlider value={500} onChange={() => {}} />);
    expect(screen.getByText('500Hz')).toBeInTheDocument();
  });

  it('should call onChange with frequency value', () => {
    const handleChange = vi.fn();
    render(<FrequencySlider value={1000} onChange={handleChange} />);
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '75' } }); // 75% on log scale
    expect(handleChange).toHaveBeenCalled();
    // The actual frequency will be on log scale
    expect(handleChange.mock.calls[0][0]).toBeGreaterThan(100);
  });

  it('should have Dark and Bright labels', () => {
    render(<FrequencySlider value={1000} onChange={() => {}} />);
    expect(screen.getByText('Dark')).toBeInTheDocument();
    expect(screen.getByText('Bright')).toBeInTheDocument();
  });
});
