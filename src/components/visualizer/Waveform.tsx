import { useEffect, useRef, useCallback } from 'react';

interface WaveformProps {
  isPlaying: boolean;
  getAnalyserData: () => { frequency: Uint8Array; timeDomain: Uint8Array };
}

export function Waveform({ isPlaying, getAnalyserData }: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { timeDomain } = getAnalyserData();
    const width = canvas.width;
    const height = canvas.height;
    const centerY = height / 2;

    // Clear with transparent background
    ctx.clearRect(0, 0, width, height);

    if (!isPlaying || timeDomain.length === 0) {
      // Draw idle state - subtle breathing line
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 200, 150, 0.3)';
      ctx.lineWidth = 2;

      const time = Date.now() / 1000;
      for (let i = 0; i < width; i++) {
        const x = i;
        const breathe = Math.sin(time * 0.5) * 5;
        const wave = Math.sin((i / width) * Math.PI * 4 + time) * 3;
        const y = centerY + breathe + wave;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    } else {
      // Draw waveform
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, 'rgba(255, 180, 120, 0.6)');
      gradient.addColorStop(0.5, 'rgba(255, 150, 100, 0.9)');
      gradient.addColorStop(1, 'rgba(255, 180, 120, 0.6)');

      ctx.beginPath();
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const sliceWidth = width / timeDomain.length;
      let x = 0;

      for (let i = 0; i < timeDomain.length; i++) {
        const v = timeDomain[i] / 128.0;
        const y = (v * height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.stroke();

      // Add glow effect
      ctx.shadowColor = 'rgba(255, 150, 100, 0.5)';
      ctx.shadowBlur = 15;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    animationRef.current = requestAnimationFrame(draw);
  }, [isPlaying, getAnalyserData]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }

    animationRef.current = requestAnimationFrame(draw);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [draw]);

  return (
    <div className="waveform">
      <canvas
        ref={canvasRef}
        className="waveform__canvas"
        aria-hidden="true"
      />
    </div>
  );
}
