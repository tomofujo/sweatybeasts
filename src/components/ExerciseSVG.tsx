interface Props {
  exerciseId: string;
  exerciseName?: string;
  className?: string;
}

type MovementType = 'push' | 'pull' | 'squat' | 'hinge' | 'curl' | 'core' | 'explosive' | 'isolation';

function getMovementType(id: string): MovementType {
  if (['barbell-bench-press', 'incline-dumbbell-press', 'push-up', 'overhead-press', 'arnold-press', 'dips'].includes(id)) return 'push';
  if (['pull-up', 'barbell-row', 'seated-cable-row', 'lat-pulldown', 'single-arm-dumbbell-row', 'face-pull'].includes(id)) return 'pull';
  if (['squat', 'leg-press', 'bulgarian-split-squat', 'leg-extension', 'leg-curl', 'back-squat'].includes(id)) return 'squat';
  if (['deadlift', 'romanian-deadlift', 'hip-thrust'].includes(id)) return 'hinge';
  if (['barbell-curl', 'hammer-curl', 'preacher-curl', 'skull-crusher', 'tricep-pushdown', 'overhead-tricep-extension'].includes(id)) return 'curl';
  if (['plank', 'ab-wheel', 'hanging-leg-raise', 'cable-crunch', 'russian-twist'].includes(id)) return 'core';
  if (['power-clean', 'kettlebell-swing', 'turkish-get-up', 'clean-and-jerk'].includes(id)) return 'explosive';
  if (['cable-fly', 'lateral-raise', 'rear-delt-fly', 'calf-raise'].includes(id)) return 'isolation';
  return 'push';
}

const COLORS: Record<MovementType, { bg: string; text: string }> = {
  push:      { bg: '#FF2D6B', text: '#000' },
  pull:      { bg: '#00D4FF', text: '#000' },
  squat:     { bg: '#00FF88', text: '#000' },
  hinge:     { bg: '#FF7A00', text: '#000' },
  curl:      { bg: '#BF5FFF', text: '#000' },
  core:      { bg: '#FFE600', text: '#000' },
  explosive: { bg: '#FF3D00', text: '#000' },
  isolation: { bg: '#D4FF00', text: '#000' },
};

function abbreviate(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return name.slice(0, 4).toUpperCase();
  // Up to 3 words, first 2–3 chars each
  return words
    .slice(0, 3)
    .map((w) => w.slice(0, words.length > 2 ? 2 : 3))
    .join('')
    .toUpperCase();
}

export default function ExerciseSVG({ exerciseId, exerciseName, className = '' }: Props) {
  const type = getMovementType(exerciseId);
  const { bg, text } = COLORS[type];
  const label = exerciseName ? abbreviate(exerciseName) : type.slice(0, 3).toUpperCase();

  return (
    <div
      className={`flex items-center justify-center w-full h-full ${className}`}
      style={{ backgroundColor: bg }}
      aria-label={exerciseName ?? exerciseId}
    >
      <span
        style={{
          color: text,
          fontSize: '9px',
          fontWeight: 900,
          letterSpacing: '0.02em',
          textAlign: 'center',
          lineHeight: 1.1,
          padding: '1px 2px',
          wordBreak: 'break-all',
        }}
      >
        {label}
      </span>
    </div>
  );
}
