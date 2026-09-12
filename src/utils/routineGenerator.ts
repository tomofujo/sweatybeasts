import type { Exercise, Equipment, MuscleGroup } from '../types';
import { MUSCLE_BODY_PART } from '../types';

export type Goal = 'muscle' | 'strength' | 'fitness' | 'fatloss' | 'athletic';
export type EquipmentAccess = 'gym' | 'home' | 'bodyweight';
export type Level = 'beginner' | 'intermediate' | 'advanced';
export type SessionLength = 'short' | 'medium' | 'long';
/** What the user picks as a focus area. */
export type FocusArea = 'Chest' | 'Back' | 'Shoulders' | 'Arms' | 'Legs' | 'Glutes' | 'Core' | 'Cardio';
/** Internal slot types — arms are split so pressing days get triceps and pulling days get biceps. */
export type BodyPart = 'Chest' | 'Back' | 'Shoulders' | 'Biceps' | 'Triceps' | 'Legs' | 'Glutes' | 'Core' | 'Cardio';

const FOCUS_TO_PARTS: Record<FocusArea, BodyPart[]> = {
  Chest: ['Chest'],
  Back: ['Back'],
  Shoulders: ['Shoulders'],
  Arms: ['Biceps', 'Triceps'],
  Legs: ['Legs'],
  Glutes: ['Glutes'],
  Core: ['Core'],
  Cardio: ['Cardio'],
};

export interface WizardAnswers {
  goal: Goal;
  daysPerWeek: number;
  focusAreas: FocusArea[];
  equipment: EquipmentAccess;
  level: Level;
  sessionLength: SessionLength;
}

export interface GeneratedExercise {
  exerciseId: string;
  exerciseName: string;
  targetSets: number;
  targetReps: number;
}

export interface GeneratedRoutine {
  name: string;
  exercises: GeneratedExercise[];
}

export const GOAL_LABELS: Record<Goal, { title: string; blurb: string }> = {
  muscle: { title: 'Build Muscle', blurb: 'Moderate weight, higher volume, 8–12 reps' },
  strength: { title: 'Get Stronger', blurb: 'Heavy compounds, low reps, long rests' },
  fitness: { title: 'Get Fitter', blurb: 'Circuits and conditioning, higher reps' },
  fatloss: { title: 'Lean Out', blurb: 'Full-body work plus cardio finishers' },
  athletic: { title: 'Athletic / Hyrox', blurb: 'Power, carries and engine work' },
};

export const LEVEL_LABELS: Record<Level, { title: string; blurb: string }> = {
  beginner: { title: 'Beginner', blurb: 'New or returning — fewer, simpler lifts' },
  intermediate: { title: 'Intermediate', blurb: 'Training consistently for 6+ months' },
  advanced: { title: 'Advanced', blurb: 'Years under the bar — high volume' },
};

export const EQUIPMENT_LABELS: Record<EquipmentAccess, { title: string; blurb: string }> = {
  gym: { title: 'Full Gym', blurb: 'Barbells, machines, cables, the lot' },
  home: { title: 'Home Setup', blurb: 'Dumbbells, kettlebells, bodyweight' },
  bodyweight: { title: 'Bodyweight Only', blurb: 'No kit needed' },
};

export const LENGTH_LABELS: Record<SessionLength, { title: string; blurb: string }> = {
  short: { title: '~30 min', blurb: 'In and out' },
  medium: { title: '~45 min', blurb: 'Balanced session' },
  long: { title: '60+ min', blurb: 'No rush' },
};

// Split plans — which body parts each training day hits, in priority order
const SPLITS: Record<number, { name: string; parts: BodyPart[] }[]> = {
  2: [
    { name: 'Full Body A', parts: ['Legs', 'Chest', 'Back', 'Core'] },
    { name: 'Full Body B', parts: ['Legs', 'Back', 'Shoulders', 'Biceps', 'Triceps'] },
  ],
  3: [
    { name: 'Push', parts: ['Chest', 'Shoulders', 'Triceps'] },
    { name: 'Pull', parts: ['Back', 'Biceps', 'Core'] },
    { name: 'Legs', parts: ['Legs', 'Glutes', 'Core'] },
  ],
  4: [
    { name: 'Upper A', parts: ['Chest', 'Back', 'Shoulders', 'Triceps', 'Biceps'] },
    { name: 'Lower A', parts: ['Legs', 'Glutes', 'Core'] },
    { name: 'Upper B', parts: ['Back', 'Chest', 'Shoulders', 'Biceps', 'Triceps'] },
    { name: 'Lower B', parts: ['Legs', 'Glutes', 'Core'] },
  ],
  5: [
    { name: 'Push', parts: ['Chest', 'Shoulders', 'Triceps'] },
    { name: 'Pull', parts: ['Back', 'Biceps'] },
    { name: 'Legs', parts: ['Legs', 'Glutes', 'Core'] },
    { name: 'Upper', parts: ['Chest', 'Back', 'Shoulders', 'Triceps', 'Biceps'] },
    { name: 'Lower', parts: ['Legs', 'Glutes', 'Core'] },
  ],
  6: [
    { name: 'Push A', parts: ['Chest', 'Shoulders', 'Triceps'] },
    { name: 'Pull A', parts: ['Back', 'Biceps', 'Core'] },
    { name: 'Legs A', parts: ['Legs', 'Glutes', 'Core'] },
    { name: 'Push B', parts: ['Shoulders', 'Chest', 'Triceps'] },
    { name: 'Pull B', parts: ['Back', 'Biceps', 'Core'] },
    { name: 'Legs B', parts: ['Legs', 'Glutes', 'Core'] },
  ],
};

// Preferred exercises per body part, compounds first
const PRIORITY: Record<BodyPart, string[]> = {
  Chest: ['barbell-bench-press', 'incline-dumbbell-press', 'dips-chest', 'push-up', 'weighted-dips', 'pec-deck', 'cable-fly'],
  Back: ['deadlift', 'pull-up', 'barbell-row', 'lat-pulldown', 'seated-cable-row', 'single-arm-dumbbell-row', 'landmine-row', 'muscle-ups', 'shrugs', 'hyperextensions'],
  Shoulders: ['overhead-press', 'arnold-press', 'landmine-press', 'lateral-raise', 'rear-delt-fly', 'face-pull', 'upright-row', 'six-way-lat-raise'],
  Biceps: ['barbell-curl', 'hammer-curl', 'preacher-curl', 'dumbbell-curl'],
  Triceps: ['tricep-pushdown', 'skull-crusher', 'overhead-tricep-extension', 'machine-dips', 'weighted-dips'],
  Legs: ['squat', 'front-squat', 'romanian-deadlift', 'leg-press', 'bulgarian-split-squat', 'walking-lunges', 'pistol-squat', 'leg-curl', 'leg-extension', 'calf-raise'],
  Glutes: ['hip-thrust', 'romanian-deadlift', 'bulgarian-split-squat', 'glute-drive', 'walking-lunges', 'sandbag-lunges'],
  Core: ['hanging-leg-raise', 'ab-wheel', 'plank', 'cable-crunch', 'toes-to-bar', 'russian-twist', 'sit-ups', 'ghd-sit-ups', 'mountain-climbers'],
  Cardio: ['rowing-machine', 'ski-erg', 'kettlebell-swing', 'burpees', 'thrusters', 'wall-balls', 'box-jumps', 'double-unders', 'burpee-broad-jump', 'mountain-climbers', 'jumping-jacks'],
};

// Multi-joint lifts that earn the heavy set/rep scheme. Everything else is an accessory.
const COMPOUNDS = new Set([
  'barbell-bench-press', 'incline-dumbbell-press', 'dips-chest', 'weighted-dips', 'push-up',
  'deadlift', 'pull-up', 'barbell-row', 'lat-pulldown', 'seated-cable-row', 'single-arm-dumbbell-row',
  'landmine-row', 'muscle-ups',
  'overhead-press', 'arnold-press', 'landmine-press',
  'squat', 'front-squat', 'romanian-deadlift', 'leg-press', 'bulgarian-split-squat', 'walking-lunges',
  'hip-thrust', 'pistol-squat',
  'power-clean', 'clean-and-jerk', 'snatch', 'thrusters',
]);

// Slots with no matching library muscleGroup — the priority list is the only source
const PRIORITY_ONLY: BodyPart[] = ['Glutes', 'Cardio', 'Biceps', 'Triceps'];

const EQUIPMENT_ALLOWED: Record<EquipmentAccess, Equipment[]> = {
  gym: ['Barbell', 'Dumbbell', 'Cable', 'Machine', 'Bodyweight', 'Kettlebell', 'Other'],
  home: ['Dumbbell', 'Kettlebell', 'Bodyweight', 'Other'],
  bodyweight: ['Bodyweight'],
};

// [sets, reps] by goal and exercise role
const SCHEME: Record<Goal, {
  compound: [number, number];
  accessory: [number, number];
  cardio: [number, number];
  core: [number, number];
}> = {
  strength: { compound: [5, 5], accessory: [3, 8], cardio: [3, 15], core: [3, 12] },
  muscle: { compound: [4, 8], accessory: [3, 12], cardio: [3, 15], core: [3, 15] },
  fitness: { compound: [3, 12], accessory: [3, 15], cardio: [4, 20], core: [3, 20] },
  fatloss: { compound: [3, 10], accessory: [3, 15], cardio: [4, 20], core: [3, 20] },
  athletic: { compound: [4, 6], accessory: [3, 10], cardio: [4, 15], core: [3, 15] },
};

// Only the first couple of heavy lifts in a session get the top-end scheme
const MAX_HEAVY_PER_SESSION = 2;
const MAX_EXERCISES_PER_SESSION = 8;

const BASE_COUNT: Record<Level, number> = { beginner: 4, intermediate: 5, advanced: 6 };
const LENGTH_ADJUST: Record<SessionLength, number> = { short: -1, medium: 0, long: 2 };

function normalisePart(mg: MuscleGroup): string {
  return MUSCLE_BODY_PART[mg] ?? mg;
}

/** Candidate exercises for a body part, ordered by preference then library order. */
function candidatesFor(part: BodyPart, library: Exercise[], access: EquipmentAccess): Exercise[] {
  const allowed = EQUIPMENT_ALLOWED[access];
  const usable = library.filter((ex) => allowed.includes(ex.equipment));
  const priority = PRIORITY[part];
  const byId = new Map(usable.map((ex) => [ex.id, ex]));

  const preferred = priority.map((id) => byId.get(id)).filter((ex): ex is Exercise => !!ex);
  const preferredIds = new Set(preferred.map((ex) => ex.id));

  const partMatches = PRIORITY_ONLY.includes(part)
    ? []
    : usable.filter((ex) => normalisePart(ex.muscleGroup) === part && !preferredIds.has(ex.id));

  return [...preferred, ...partMatches];
}

/** Distribute a total exercise count across the day's body parts, weighting focus areas. */
function allocate(parts: BodyPart[], total: number, focusParts: BodyPart[]): Map<BodyPart, number> {
  // With a small budget we cannot touch every part — keep the highest-priority ones
  const active = parts.slice(0, Math.max(1, Math.min(parts.length, total)));
  // No single part may swallow the session, even when it is a focus area
  const cap = Math.max(1, Math.ceil(total / 2));

  const weights = active.map((p) => (focusParts.includes(p) ? 2 : 1));
  const totalWeight = weights.reduce((a, b) => a + b, 0);

  const counts = new Map<BodyPart, number>();
  active.forEach((p, i) =>
    counts.set(p, Math.min(cap, Math.max(1, Math.floor((total * weights[i]) / totalWeight))))
  );

  // The day is named after its first part, so give that one real volume
  if (total >= 4) counts.set(active[0], Math.min(cap, Math.max(counts.get(active[0])!, 2)));

  // Focus areas get first refusal on any spare slots
  const order = [...active].sort((a, b) => {
    const fa = focusParts.includes(a) ? 0 : 1;
    const fb = focusParts.includes(b) ? 0 : 1;
    return fa - fb;
  });

  const sum = () => [...counts.values()].reduce((a, b) => a + b, 0);

  let guard = 0;
  while (sum() < total && guard++ < 100) {
    const p = order.find((x) => counts.get(x)! < cap);
    if (!p) break;
    counts.set(p, counts.get(p)! + 1);
  }
  guard = 0;
  while (sum() > total && guard++ < 100) {
    // Trim the largest non-focus part first, never below one exercise
    const p = [...order].reverse().find((x) => counts.get(x)! > 1);
    if (!p) break;
    counts.set(p, counts.get(p)! - 1);
  }
  return counts;
}

export function generateRoutines(answers: WizardAnswers, library: Exercise[]): GeneratedRoutine[] {
  const { goal, daysPerWeek, focusAreas, equipment, level, sessionLength } = answers;
  const split = SPLITS[daysPerWeek] ?? SPLITS[3];
  const scheme = SCHEME[goal];
  const perSession = Math.min(
    MAX_EXERCISES_PER_SESSION,
    Math.max(3, BASE_COUNT[level] + LENGTH_ADJUST[sessionLength])
  );

  // Focus areas only ever boost the volume of parts a day already trains — they are never
  // grafted onto unrelated days, which is what would put curls in a leg session.
  const focusParts = focusAreas.flatMap((fa) => FOCUS_TO_PARTS[fa]);
  const wantsCardio = focusAreas.includes('Cardio') || goal === 'fitness' || goal === 'fatloss';

  // Tracks how often each exercise has been used so later days pick fresh variations
  const globalUse = new Map<string, number>();

  const take = (ex: Exercise, kind: 'compound' | 'accessory' | 'cardio' | 'core', heavyUsed: number) => {
    const useHeavy = kind === 'compound' && heavyUsed < MAX_HEAVY_PER_SESSION;
    const [sets, reps] = useHeavy ? scheme.compound : scheme[kind === 'compound' ? 'accessory' : kind];
    globalUse.set(ex.id, (globalUse.get(ex.id) ?? 0) + 1);
    return {
      entry: { exerciseId: ex.id, exerciseName: ex.name, targetSets: sets, targetReps: reps },
      wasHeavy: useHeavy,
    };
  };

  return split.map((day) => {
    const cardioSlots = wantsCardio ? (focusAreas.includes('Cardio') ? 2 : 1) : 0;
    const strengthBudget = Math.max(2, perSession - cardioSlots);
    const counts = allocate(day.parts, strengthBudget, focusParts);

    const usedToday = new Set<string>();
    const exercises: GeneratedExercise[] = [];
    let heavyUsed = 0;

    for (const part of day.parts) {
      const want = counts.get(part) ?? 0;
      const pool = candidatesFor(part, library, equipment)
        .filter((ex) => !usedToday.has(ex.id))
        .sort((a, b) => (globalUse.get(a.id) ?? 0) - (globalUse.get(b.id) ?? 0));

      for (let i = 0; i < want && i < pool.length; i++) {
        const ex = pool[i];
        const kind = part === 'Core' ? 'core' : COMPOUNDS.has(ex.id) ? 'compound' : 'accessory';
        const { entry, wasHeavy } = take(ex, kind, heavyUsed);
        if (wasHeavy) heavyUsed++;
        exercises.push(entry);
        usedToday.add(ex.id);
      }
    }

    // A thin pool (bodyweight-only, say) can leave the day short — top it up from the
    // same body parts before falling back to anything else that fits the equipment.
    if (exercises.length < strengthBudget) {
      const allowed = EQUIPMENT_ALLOWED[equipment];
      const backfill = [
        ...day.parts.flatMap((p) => candidatesFor(p, library, equipment)),
        ...library.filter((ex) => allowed.includes(ex.equipment)),
      ].filter((ex) => !usedToday.has(ex.id));

      for (const ex of backfill) {
        if (exercises.length >= strengthBudget) break;
        if (usedToday.has(ex.id)) continue;
        const kind = COMPOUNDS.has(ex.id) ? 'compound' : 'accessory';
        const { entry, wasHeavy } = take(ex, kind, heavyUsed);
        if (wasHeavy) heavyUsed++;
        exercises.push(entry);
        usedToday.add(ex.id);
      }
    }

    for (let i = 0; i < cardioSlots; i++) {
      const pool = candidatesFor('Cardio', library, equipment)
        .filter((ex) => !usedToday.has(ex.id))
        .sort((a, b) => (globalUse.get(a.id) ?? 0) - (globalUse.get(b.id) ?? 0));
      if (pool.length === 0) break;
      const ex = pool[0];
      exercises.push(take(ex, 'cardio', heavyUsed).entry);
      usedToday.add(ex.id);
    }

    return { name: day.name, exercises };
  });
}

export function suggestPlanName(answers: WizardAnswers): string {
  return `${GOAL_LABELS[answers.goal].title} · ${answers.daysPerWeek} Day`;
}
