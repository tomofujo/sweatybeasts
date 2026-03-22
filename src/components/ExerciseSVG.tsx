import React from 'react';

interface Props {
  exerciseId: string;
  className?: string;
}

function getMovementType(id: string): string {
  if (['barbell-bench-press', 'incline-dumbbell-press', 'push-up', 'overhead-press', 'arnold-press', 'dips'].includes(id)) return 'push';
  if (['pull-up', 'barbell-row', 'seated-cable-row', 'lat-pulldown', 'single-arm-dumbbell-row', 'face-pull'].includes(id)) return 'pull';
  if (['squat', 'leg-press', 'bulgarian-split-squat', 'leg-extension', 'leg-curl'].includes(id)) return 'squat';
  if (['deadlift', 'romanian-deadlift', 'hip-thrust'].includes(id)) return 'hinge';
  if (['barbell-curl', 'hammer-curl', 'preacher-curl', 'skull-crusher', 'tricep-pushdown', 'overhead-tricep-extension'].includes(id)) return 'curl';
  if (['plank', 'ab-wheel', 'hanging-leg-raise', 'cable-crunch', 'russian-twist'].includes(id)) return 'core';
  if (['power-clean', 'kettlebell-swing', 'turkish-get-up', 'clean-and-jerk'].includes(id)) return 'explosive';
  if (['cable-fly', 'lateral-raise', 'rear-delt-fly', 'calf-raise'].includes(id)) return 'isolation';
  return 'push';
}

const STROKE = '#D4FF00';
const STROKE_WIDTH = 3;
const JOINT_RADIUS = 4;

function Joint({ cx, cy }: { cx: number; cy: number }) {
  return <circle cx={cx} cy={cy} r={JOINT_RADIUS} fill={STROKE} />;
}

function Limb({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={STROKE} strokeWidth={STROKE_WIDTH} strokeLinecap="round" />;
}

function Head({ cx, cy }: { cx: number; cy: number }) {
  return <circle cx={cx} cy={cy} r={8} fill="none" stroke={STROKE} strokeWidth={STROKE_WIDTH} />;
}

/** Barbell rendered as a horizontal bar with end caps */
function Barbell({ x, y, width }: { x: number; y: number; width: number }) {
  return (
    <g>
      <line x1={x} y1={y} x2={x + width} y2={y} stroke={STROKE} strokeWidth={2} strokeLinecap="round" />
      <line x1={x} y1={y - 6} x2={x} y2={y + 6} stroke={STROKE} strokeWidth={4} strokeLinecap="round" />
      <line x1={x + width} y1={y - 6} x2={x + width} y2={y + 6} stroke={STROKE} strokeWidth={4} strokeLinecap="round" />
    </g>
  );
}

function PushFigure() {
  // Figure lying on bench, pressing barbell up
  return (
    <g>
      {/* Bench */}
      <rect x={55} y={95} width={80} height={6} fill="none" stroke={STROKE} strokeWidth={2} rx={1} />
      <line x1={65} y1={101} x2={65} y2={130} stroke={STROKE} strokeWidth={2} />
      <line x1={125} y1={101} x2={125} y2={130} stroke={STROKE} strokeWidth={2} />
      {/* Head */}
      <Head cx={55} cy={82} />
      {/* Torso (lying flat) */}
      <Limb x1={55} y1={90} x2={115} y2={90} />
      {/* Upper arms (going up) */}
      <Limb x1={75} y1={90} x2={75} y2={60} />
      <Limb x1={95} y1={90} x2={95} y2={60} />
      {/* Forearms */}
      <Limb x1={75} y1={60} x2={75} y2={42} />
      <Limb x1={95} y1={60} x2={95} y2={42} />
      {/* Joints */}
      <Joint cx={75} cy={90} />
      <Joint cx={95} cy={90} />
      <Joint cx={75} cy={60} />
      <Joint cx={95} cy={60} />
      {/* Barbell */}
      <Barbell x={45} y={42} width={80} />
      {/* Legs */}
      <Limb x1={115} y1={90} x2={130} y2={110} />
      <Limb x1={130} y1={110} x2={135} y2={130} />
      <Joint cx={115} cy={90} />
      <Joint cx={130} cy={110} />
    </g>
  );
}

function PullFigure() {
  // Figure hanging from a bar, doing a pull-up
  return (
    <g>
      {/* Pull-up bar */}
      <line x1={50} y1={20} x2={150} y2={20} stroke={STROKE} strokeWidth={3} strokeLinecap="round" />
      {/* Hands on bar */}
      <Joint cx={80} cy={20} />
      <Joint cx={120} cy={20} />
      {/* Upper arms */}
      <Limb x1={80} y1={20} x2={85} y2={42} />
      <Limb x1={120} y1={20} x2={115} y2={42} />
      {/* Elbows */}
      <Joint cx={85} cy={42} />
      <Joint cx={115} cy={42} />
      {/* Forearms to shoulders */}
      <Limb x1={85} y1={42} x2={90} y2={55} />
      <Limb x1={115} y1={42} x2={110} y2={55} />
      {/* Shoulders */}
      <Joint cx={90} cy={55} />
      <Joint cx={110} cy={55} />
      {/* Head */}
      <Head cx={100} cy={45} />
      {/* Torso */}
      <Limb x1={100} y1={55} x2={100} y2={90} />
      {/* Hips */}
      <Joint cx={100} cy={90} />
      {/* Legs (slightly bent) */}
      <Limb x1={100} y1={90} x2={90} y2={115} />
      <Limb x1={100} y1={90} x2={110} y2={115} />
      <Joint cx={90} cy={115} />
      <Joint cx={110} cy={115} />
      <Limb x1={90} y1={115} x2={88} y2={135} />
      <Limb x1={110} y1={115} x2={112} y2={135} />
    </g>
  );
}

function SquatFigure() {
  // Figure in squat position with barbell on shoulders
  return (
    <g>
      {/* Head */}
      <Head cx={100} cy={30} />
      {/* Torso (slightly angled forward) */}
      <Limb x1={100} y1={38} x2={95} y2={72} />
      {/* Shoulders */}
      <Joint cx={85} cy={42} />
      <Joint cx={115} cy={42} />
      {/* Barbell across shoulders */}
      <Barbell x={55} y={42} width={90} />
      {/* Arms holding bar */}
      <Limb x1={85} y1={42} x2={70} y2={42} />
      <Limb x1={115} y1={42} x2={130} y2={42} />
      {/* Hips */}
      <Joint cx={95} cy={72} />
      {/* Upper legs (bent at ~90 degrees) */}
      <Limb x1={95} y1={72} x2={75} y2={100} />
      <Limb x1={95} y1={72} x2={115} y2={100} />
      {/* Knees */}
      <Joint cx={75} cy={100} />
      <Joint cx={115} cy={100} />
      {/* Lower legs */}
      <Limb x1={75} y1={100} x2={80} y2={135} />
      <Limb x1={115} y1={100} x2={110} y2={135} />
      {/* Feet */}
      <line x1={72} y1={135} x2={88} y2={135} stroke={STROKE} strokeWidth={STROKE_WIDTH} strokeLinecap="round" />
      <line x1={102} y1={135} x2={118} y2={135} stroke={STROKE} strokeWidth={STROKE_WIDTH} strokeLinecap="round" />
    </g>
  );
}

function HingeFigure() {
  // Figure in deadlift/hip-hinge position
  return (
    <g>
      {/* Head (forward, looking down) */}
      <Head cx={70} cy={42} />
      {/* Torso (bent forward at ~45 degrees) */}
      <Limb x1={75} y1={50} x2={105} y2={72} />
      {/* Shoulders */}
      <Joint cx={78} cy={52} />
      {/* Arms hanging down to bar */}
      <Limb x1={78} y1={52} x2={78} y2={80} />
      <Limb x1={82} y1={55} x2={82} y2={80} />
      <Limb x1={78} y1={80} x2={80} y2={110} />
      <Limb x1={82} y1={80} x2={84} y2={110} />
      {/* Elbows */}
      <Joint cx={78} cy={80} />
      <Joint cx={82} cy={80} />
      {/* Barbell on ground */}
      <Barbell x={50} y={115} width={80} />
      {/* Hips */}
      <Joint cx={105} cy={72} />
      {/* Upper legs */}
      <Limb x1={105} y1={72} x2={100} y2={100} />
      <Limb x1={105} y1={72} x2={115} y2={100} />
      {/* Knees */}
      <Joint cx={100} cy={100} />
      <Joint cx={115} cy={100} />
      {/* Lower legs */}
      <Limb x1={100} y1={100} x2={95} y2={135} />
      <Limb x1={115} y1={100} x2={115} y2={135} />
      {/* Feet */}
      <line x1={87} y1={135} x2={103} y2={135} stroke={STROKE} strokeWidth={STROKE_WIDTH} strokeLinecap="round" />
      <line x1={107} y1={135} x2={123} y2={135} stroke={STROKE} strokeWidth={STROKE_WIDTH} strokeLinecap="round" />
    </g>
  );
}

function CurlFigure() {
  // Standing figure doing a bicep curl
  return (
    <g>
      {/* Head */}
      <Head cx={100} cy={22} />
      {/* Torso */}
      <Limb x1={100} y1={30} x2={100} y2={72} />
      {/* Left shoulder */}
      <Joint cx={88} cy={35} />
      {/* Right shoulder */}
      <Joint cx={112} cy={35} />
      {/* Left arm (at side) */}
      <Limb x1={88} y1={35} x2={84} y2={55} />
      <Joint cx={84} cy={55} />
      <Limb x1={84} y1={55} x2={82} y2={72} />
      {/* Right arm (curling up) */}
      <Limb x1={112} y1={35} x2={118} y2={55} />
      <Joint cx={118} cy={55} />
      <Limb x1={118} y1={55} x2={115} y2={38} />
      {/* Dumbbell in right hand */}
      <rect x={110} y={33} width={10} height={6} fill="none" stroke={STROKE} strokeWidth={2} rx={1} />
      {/* Hips */}
      <Joint cx={100} cy={72} />
      {/* Legs */}
      <Limb x1={100} y1={72} x2={90} y2={105} />
      <Limb x1={100} y1={72} x2={110} y2={105} />
      <Joint cx={90} cy={105} />
      <Joint cx={110} cy={105} />
      <Limb x1={90} y1={105} x2={88} y2={135} />
      <Limb x1={110} y1={105} x2={112} y2={135} />
      {/* Feet */}
      <line x1={80} y1={135} x2={96} y2={135} stroke={STROKE} strokeWidth={STROKE_WIDTH} strokeLinecap="round" />
      <line x1={104} y1={135} x2={120} y2={135} stroke={STROKE} strokeWidth={STROKE_WIDTH} strokeLinecap="round" />
    </g>
  );
}

function CoreFigure() {
  // Figure in plank position
  return (
    <g>
      {/* Head */}
      <Head cx={50} cy={62} />
      {/* Torso (horizontal plank) */}
      <Limb x1={58} y1={68} x2={130} y2={72} />
      {/* Front shoulder */}
      <Joint cx={60} cy={68} />
      {/* Upper arm (vertical to ground) */}
      <Limb x1={60} y1={68} x2={58} y2={95} />
      <Joint cx={58} cy={95} />
      {/* Forearm on ground */}
      <Limb x1={58} y1={95} x2={45} y2={105} />
      {/* Second arm */}
      <Limb x1={75} y1={70} x2={73} y2={95} />
      <Joint cx={75} cy={70} />
      <Joint cx={73} cy={95} />
      <Limb x1={73} y1={95} x2={60} y2={105} />
      {/* Ground line for forearms */}
      <line x1={40} y1={105} x2={65} y2={105} stroke={STROKE} strokeWidth={1} strokeDasharray="4,3" />
      {/* Hips */}
      <Joint cx={130} cy={72} />
      {/* Upper legs */}
      <Limb x1={130} y1={72} x2={148} y2={85} />
      <Joint cx={148} cy={85} />
      {/* Lower legs */}
      <Limb x1={148} y1={85} x2={158} y2={105} />
      {/* Toes on ground */}
      <Joint cx={158} cy={105} />
      {/* Ground */}
      <line x1={150} y1={105} x2={165} y2={105} stroke={STROKE} strokeWidth={1} strokeDasharray="4,3" />
    </g>
  );
}

function ExplosiveFigure() {
  // Figure in power clean / explosive position - athletic stance with barbell at chest height
  return (
    <g>
      {/* Head */}
      <Head cx={100} cy={18} />
      {/* Torso (upright, powerful) */}
      <Limb x1={100} y1={26} x2={100} y2={65} />
      {/* Shoulders */}
      <Joint cx={88} cy={32} />
      <Joint cx={112} cy={32} />
      {/* Arms catching barbell at chest/shoulder height */}
      <Limb x1={88} y1={32} x2={80} y2={48} />
      <Limb x1={112} y1={32} x2={120} y2={48} />
      <Joint cx={80} cy={48} />
      <Joint cx={120} cy={48} />
      <Limb x1={80} y1={48} x2={78} y2={35} />
      <Limb x1={120} y1={48} x2={122} y2={35} />
      {/* Barbell at shoulder height */}
      <Barbell x={48} y={35} width={104} />
      {/* Hips */}
      <Joint cx={100} cy={65} />
      {/* Legs (athletic quarter-squat) */}
      <Limb x1={100} y1={65} x2={85} y2={95} />
      <Limb x1={100} y1={65} x2={115} y2={95} />
      <Joint cx={85} cy={95} />
      <Joint cx={115} cy={95} />
      <Limb x1={85} y1={95} x2={82} y2={130} />
      <Limb x1={115} y1={95} x2={118} y2={130} />
      {/* Feet (wide stance) */}
      <line x1={74} y1={130} x2={90} y2={130} stroke={STROKE} strokeWidth={STROKE_WIDTH} strokeLinecap="round" />
      <line x1={110} y1={130} x2={126} y2={130} stroke={STROKE} strokeWidth={STROKE_WIDTH} strokeLinecap="round" />
      {/* Motion lines */}
      <line x1={65} y1={55} x2={65} y2={70} stroke={STROKE} strokeWidth={1} opacity={0.5} />
      <line x1={60} y1={58} x2={60} y2={68} stroke={STROKE} strokeWidth={1} opacity={0.3} />
      <line x1={135} y1={55} x2={135} y2={70} stroke={STROKE} strokeWidth={1} opacity={0.5} />
      <line x1={140} y1={58} x2={140} y2={68} stroke={STROKE} strokeWidth={1} opacity={0.3} />
    </g>
  );
}

function IsolationFigure() {
  // Standing figure doing lateral raise
  return (
    <g>
      {/* Head */}
      <Head cx={100} cy={22} />
      {/* Torso */}
      <Limb x1={100} y1={30} x2={100} y2={72} />
      {/* Shoulders */}
      <Joint cx={88} cy={35} />
      <Joint cx={112} cy={35} />
      {/* Arms raised out to sides (lateral raise) */}
      <Limb x1={88} y1={35} x2={60} y2={42} />
      <Limb x1={112} y1={35} x2={140} y2={42} />
      <Joint cx={60} cy={42} />
      <Joint cx={140} cy={42} />
      <Limb x1={60} y1={42} x2={42} y2={48} />
      <Limb x1={140} y1={42} x2={158} y2={48} />
      {/* Dumbbells */}
      <rect x={35} y={44} width={10} height={6} fill="none" stroke={STROKE} strokeWidth={2} rx={1} />
      <rect x={155} y={44} width={10} height={6} fill="none" stroke={STROKE} strokeWidth={2} rx={1} />
      {/* Hips */}
      <Joint cx={100} cy={72} />
      {/* Legs */}
      <Limb x1={100} y1={72} x2={90} y2={105} />
      <Limb x1={100} y1={72} x2={110} y2={105} />
      <Joint cx={90} cy={105} />
      <Joint cx={110} cy={105} />
      <Limb x1={90} y1={105} x2={88} y2={135} />
      <Limb x1={110} y1={105} x2={112} y2={135} />
      {/* Feet */}
      <line x1={80} y1={135} x2={96} y2={135} stroke={STROKE} strokeWidth={STROKE_WIDTH} strokeLinecap="round" />
      <line x1={104} y1={135} x2={120} y2={135} stroke={STROKE} strokeWidth={STROKE_WIDTH} strokeLinecap="round" />
    </g>
  );
}

const figures: Record<string, () => React.JSX.Element> = {
  push: PushFigure,
  pull: PullFigure,
  squat: SquatFigure,
  hinge: HingeFigure,
  curl: CurlFigure,
  core: CoreFigure,
  explosive: ExplosiveFigure,
  isolation: IsolationFigure,
};

export default function ExerciseSVG({ exerciseId, className = '' }: Props) {
  const type = getMovementType(exerciseId);
  const Figure = figures[type] ?? figures.push;

  return (
    <svg
      viewBox="0 0 200 150"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label={`${exerciseId} illustration`}
    >
      <Figure />
    </svg>
  );
}
