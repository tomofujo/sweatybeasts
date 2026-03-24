import { useState, useEffect, useRef } from 'react';
import { Clock, Play, Pause, RotateCcw } from 'lucide-react';

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function SessionTimer() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  // Anchor to wall-clock so background throttling can't lose time
  const anchorRef = useRef<number | null>(null); // Date.now() when running started, adjusted for prior elapsed
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      anchorRef.current = Date.now() - elapsed * 1000;
      intervalRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - anchorRef.current!) / 1000));
      }, 500);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]); // intentionally exclude elapsed – only re-anchor when running toggles

  function handleReset() {
    setElapsed(0);
    setRunning(false);
    anchorRef.current = null;
  }

  const canReset = elapsed > 0 || running;

  return (
    <div className="flex items-center gap-2 text-sm">
      <Clock size={14} className="text-[#888888]" />
      <span className={`font-mono font-bold tabular-nums ${running ? 'text-[#D4FF00]' : 'text-[#888888]'}`}>
        {formatElapsed(elapsed)}
      </span>
      <button
        onClick={() => setRunning((r) => !r)}
        className="p-1 text-[#888888] hover:text-[#D4FF00] transition-colors"
        title={running ? 'Pause session timer' : 'Start session timer'}
      >
        {running ? <Pause size={14} /> : <Play size={14} />}
      </button>
      <button
        onClick={handleReset}
        disabled={!canReset}
        className={`p-1 transition-colors ${
          canReset
            ? 'text-[#aaaaaa] hover:text-[#ff4444] cursor-pointer'
            : 'text-[#2e2e2e] cursor-default'
        }`}
        title="Reset timer"
      >
        <RotateCcw size={14} />
      </button>
    </div>
  );
}
