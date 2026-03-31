import { useState, useEffect, useRef, useCallback } from 'react';
import { Timer, Play, Pause, RotateCcw, X } from 'lucide-react';

const REST_PRESETS = [30, 60, 90, 120, 180]; // seconds

function playBeep() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = 880;
    oscillator.type = 'square';
    gainNode.gain.value = 0.3;

    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    oscillator.stop(ctx.currentTime + 0.3);

    // Double beep
    setTimeout(() => {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.frequency.value = 1100;
      osc2.type = 'square';
      gain2.gain.value = 0.3;
      osc2.start();
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc2.stop(ctx.currentTime + 0.3);
    }, 350);
  } catch {
    // Web Audio not available
  }
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

interface RestTimerProps {
  onClose: () => void;
}

export default function RestTimer({ onClose }: RestTimerProps) {
  const [duration, setDuration] = useState(90);
  const [remaining, setRemaining] = useState(90);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  // Anchor to wall-clock deadline so background throttling doesn't drift the countdown
  const deadlineRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      // Set deadline if not already set (first start; after pause it was cleared)
      if (!deadlineRef.current) {
        deadlineRef.current = Date.now() + remaining * 1000;
      }
      intervalRef.current = setInterval(() => {
        const timeLeft = Math.max(0, Math.round((deadlineRef.current! - Date.now()) / 1000));
        setRemaining(timeLeft);
        if (timeLeft <= 0) {
          clearInterval(intervalRef.current!);
          deadlineRef.current = null;
          setRunning(false);
          setFinished(true);
          playBeep();
          // Auto-reset after 3 s so it's ready for the next set
          setTimeout(() => {
            setFinished(false);
            setRemaining(duration);
          }, 3000);
        }
      }, 200);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]); // intentionally exclude remaining – deadline ref handles accuracy

  const start = useCallback(() => {
    setFinished(false);
    deadlineRef.current = null; // will be set fresh in the effect
    setRunning(true);
  }, []);

  const pause = useCallback(() => {
    setRunning(false);
    deadlineRef.current = null; // clear so next start re-anchors from current remaining
  }, []);

  const reset = useCallback((dur?: number) => {
    setRunning(false);
    setFinished(false);
    deadlineRef.current = null;
    const d = dur ?? duration;
    setRemaining(d);
  }, [duration]);

  const selectPreset = useCallback((seconds: number) => {
    setDuration(seconds);
    reset(seconds);
  }, [reset]);

  const progress = duration > 0 ? ((duration - remaining) / duration) * 100 : 0;

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[2px] p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#ffffff]">
          <Timer size={16} className="text-[#D4FF00]" />
          Rest Timer
        </div>
        <button
          onClick={onClose}
          className="text-[#888888] hover:text-[#ffffff] transition-colors p-1"
        >
          <X size={16} />
        </button>
      </div>

      {/* Presets */}
      <div className="flex gap-2 mb-3 flex-wrap">
        {REST_PRESETS.map((s) => (
          <button
            key={s}
            onClick={() => selectPreset(s)}
            className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-[2px] transition-colors ${
              duration === s
                ? 'bg-[#D4FF00] text-[#0a0a0a]'
                : 'bg-[#1f1f1f] text-[#888888] border border-[#2a2a2a] hover:text-[#ffffff]'
            }`}
          >
            {formatTime(s)}
          </button>
        ))}
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-[#2a2a2a] rounded-full mb-3 overflow-hidden">
        <div
          className="h-full transition-all duration-200 ease-linear rounded-full"
          style={{
            width: `${progress}%`,
            backgroundColor: finished ? '#00cc66' : '#D4FF00',
          }}
        />
      </div>

      {/* Time display */}
      <div className={`text-center text-4xl font-bold font-mono tabular-nums mb-3 ${finished ? 'text-[#00cc66] animate-pulse' : 'text-[#ffffff]'}`}>
        {formatTime(remaining)}
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-3">
        {!running ? (
          <button
            onClick={start}
            disabled={remaining === 0 && finished}
            className="flex items-center gap-2 px-4 py-2 bg-[#D4FF00] text-[#0a0a0a] font-bold uppercase tracking-wider text-xs rounded-[2px] hover:bg-[#a3c700] transition-colors disabled:opacity-40"
          >
            <Play size={14} />
            {remaining < duration && remaining > 0 ? 'Resume' : 'Start'}
          </button>
        ) : (
          <button
            onClick={pause}
            className="flex items-center gap-2 px-4 py-2 bg-[#1f1f1f] border border-[#2a2a2a] text-[#ffffff] font-bold uppercase tracking-wider text-xs rounded-[2px] hover:border-[#D4FF00] transition-colors"
          >
            <Pause size={14} />
            Pause
          </button>
        )}
        <button
          onClick={() => reset()}
          className="flex items-center gap-2 px-4 py-2 bg-[#1f1f1f] border border-[#2a2a2a] text-[#888888] font-bold uppercase tracking-wider text-xs rounded-[2px] hover:text-[#ffffff] hover:border-[#888888] transition-colors"
        >
          <RotateCcw size={14} />
          Reset
        </button>
      </div>
    </div>
  );
}
