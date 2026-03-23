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
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  return (
    <div className="flex items-center gap-2 text-sm">
      <Clock size={14} className="text-[#888888]" />
      <span className={`font-mono font-bold ${running ? 'text-[#D4FF00]' : 'text-[#888888]'}`}>
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
        onClick={() => { setElapsed(0); setRunning(false); }}
        className="p-1 text-[#888888] hover:text-[#ff4444] transition-colors"
        title="Reset timer"
      >
        <RotateCcw size={14} />
      </button>
    </div>
  );
}
