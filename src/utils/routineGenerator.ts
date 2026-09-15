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

interface SplitDay {
  name: string;
  parts: BodyPart[];
  /** Relative share of the session. Back counts double on upper days because it
   *  covers both vertical and horizontal pulling, keeping push and pull even. */
  weights?: Partial<Record<BodyPart, number>>;
  /** Exercises that do not belong on this day regardless of body part. */
  exclude?: string[];
}

// A deadlift is a hinge that loads the whole posterior chain and legs. It anchors a
// pull or lower day; it has no place on an upper-body day.
const NO_DEADLIFT = ['deadlift'];

// Split plans — which body parts each training day hits, in priority order
const SPLITS: Record<number, SplitDay[]> = {
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
    { name: 'Upper A', parts: ['Chest', 'Back', 'Shoulders', 'Triceps', 'Biceps'], weights: { Back: 2 }, exclude: NO_DEADLIFT },
    { name: 'Lower A', parts: ['Legs', 'Glutes', 'Core'] },
    { name: 'Upper B', parts: ['Back', 'Chest', 'Shoulders', 'Biceps', 'Triceps'], weights: { Back: 2 }, exclude: NO_DEADLIFT },
    { name: 'Lower B', parts: ['Legs', 'Glutes', 'Core'] },
  ],
  5: [
    { name: 'Push', parts: ['Chest', 'Shoulders', 'Triceps'] },
    { name: 'Pull', parts: ['Back', 'Biceps'] },
    { name: 'Legs', parts: ['Legs', 'Glutes', 'Core'] },
    { name: 'Upper', parts: ['Chest', 'Back', 'Shoulders', 'Triceps', 'Biceps'], weights: { Back: 2 }, exclude: NO_DEADLIFT },
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

/** Movement pattern per exercise. Sessions cap how many of each they will take, so a
 *  day cannot end up as four variations of the same press. Conditioning moves are
 *  tagged as such even when they squat or hinge — they are finishers, not strength work. */
export const PATTERN: Record<string, string> = {
  'barbell-bench-press': 'press-horiz', 'incline-dumbbell-press': 'press-horiz', 'push-up': 'press-horiz',
  'dips-chest': 'press-horiz', 'weighted-dips': 'press-horiz', 'machine-dips': 'press-horiz',
  'cable-fly': 'fly', 'pec-deck': 'fly',
  'overhead-press': 'press-vert', 'arnold-press': 'press-vert', 'landmine-press': 'press-vert',
  'lateral-raise': 'raise', 'rear-delt-fly': 'raise', 'six-way-lat-raise': 'raise',
  'face-pull': 'raise', 'upright-row': 'raise',
  'pull-up': 'pull-vert', 'lat-pulldown': 'pull-vert', 'muscle-ups': 'pull-vert',
  'barbell-row': 'pull-horiz', 'seated-cable-row': 'pull-horiz', 'single-arm-dumbbell-row': 'pull-horiz',
  'landmine-row': 'pull-horiz', 'sled-pull': 'pull-horiz',
  'deadlift': 'hinge', 'romanian-deadlift': 'hinge',
  'hip-thrust': 'hinge', 'glute-drive': 'hinge',
  // Spinal extension rather than a hip hinge — a back accessory, not leg work
  'hyperextensions': 'back-ext',
  'squat': 'squat', 'front-squat': 'squat', 'leg-press': 'squat', 'pistol-squat': 'squat',
  'bulgarian-split-squat': 'lunge', 'walking-lunges': 'lunge', 'sandbag-lunges': 'lunge',
  'leg-curl': 'leg-iso', 'leg-extension': 'leg-iso', 'calf-raise': 'leg-iso',
  'barbell-curl': 'curl', 'hammer-curl': 'curl', 'preacher-curl': 'curl', 'dumbbell-curl': 'curl',
  'skull-crusher': 'tri-ext', 'tricep-pushdown': 'tri-ext', 'overhead-tricep-extension': 'tri-ext',
  'shrugs': 'shrug',
  'plank': 'core', 'ab-wheel': 'core', 'hanging-leg-raise': 'core', 'cable-crunch': 'core',
  'russian-twist': 'core', 'sit-ups': 'core', 'toes-to-bar': 'core', 'ghd-sit-ups': 'core',
  'mountain-climbers': 'core',
  'power-clean': 'olympic', 'clean-and-jerk': 'olympic', 'snatch': 'olympic',
  'farmers-carry': 'carry', 'sled-push': 'carry', 'turkish-get-up': 'carry',
  'rowing-machine': 'conditioning', 'ski-erg': 'conditioning', 'burpees': 'conditioning',
  'burpee-broad-jump': 'conditioning', 'box-jumps': 'conditioning', 'double-unders': 'conditioning',
  'jumping-jacks': 'conditioning', 'wall-walk': 'conditioning', 'kettlebell-swing': 'conditioning',
  'wall-balls': 'conditioning', 'thrusters': 'conditioning',
};

/** Maximum exercises of one pattern per session. */
const PATTERN_CAP = 2;
const LOOSE_PATTERN_CAP = 3; // core and conditioning tolerate more
const LOOSE_PATTERNS = new Set(['core', 'conditioning']);

/** Lifts that load the spine near-maximally. One per session, never two. */
export const AXIAL_HEAVY = new Set(['deadlift', 'squat', 'front-squat', 'clean-and-jerk', 'snatch', 'power-clean']);

/** Technical lifts that are not appropriate below a given experience level. */
export const TOO_ADVANCED: Record<Level, string[]> = {
  beginner: ['muscle-ups', 'pistol-squat', 'snatch', 'clean-and-jerk', 'power-clean', 'turkish-get-up', 'ghd-sit-ups', 'toes-to-bar', 'double-unders', 'wall-walk', 'ab-wheel'],
  intermediate: ['snatch', 'clean-and-jerk', 'muscle-ups'],
  advanced: [],
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

/** High-skill movements where the goal's rep target would be unrealistic. */
const SKILL_REP_CAP: Record<string, number> = {
  'muscle-ups': 6, 'pistol-squat': 8, 'wall-walk': 5, 'turkish-get-up': 5, 'toes-to-bar': 12,
};

/** Strength work first, then core, then conditioning — the order you'd actually train in. */
function sessionRank(id: string): number {
  const pattern = PATTERN[id] ?? 'other';
  if (pattern === 'conditioning') return 2;
  if (pattern === 'core') return 1;
  return 0;
}

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
function allocate(
  parts: BodyPart[],
  total: number,
  focusParts: BodyPart[],
  dayWeights?: Partial<Record<BodyPart, number>>,
): Map<BodyPart, number> {
  // With a small budget we cannot touch every part — keep the highest-priority ones
  const active = parts.slice(0, Math.max(1, Math.min(parts.length, total)));
  // No single part may swallow the session, even when it is a focus area
  const cap = Math.max(1, Math.ceil(total / 2));

  // Take the larger of the day's own emphasis and the focus boost rather than multiplying
  // them. Compounding the two let Back reach four slots on an upper day that already
  // doubles it, leaving the session five-sixths pulling.
  const weightOf = (p: BodyPart) => Math.max(dayWeights?.[p] ?? 1, focusParts.includes(p) ? 2 : 1);
  const totalWeight = active.reduce((sum, p) => sum + weightOf(p), 0);

  const counts = new Map<BodyPart, number>();
  active.forEach((p) => counts.set(p, Math.min(cap, Math.max(1, Math.floor((total * weightOf(p)) / totalWeight)))));

  const sum = () => [...counts.values()].reduce((a, b) => a + b, 0);

  // Spare slots go round-robin across parts, heaviest weight first. Handing them out
  // with a plain find() would pile every spare slot onto the same part, which is how
  // an upper day ended up with four chest movements and a single back movement.
  const order = [...active].sort((a, b) => weightOf(b) - weightOf(a));
  let cursor = 0;
  let guard = 0;
  while (sum() < total && guard++ < 200) {
    let placed = false;
    for (let n = 0; n < order.length; n++) {
      const p = order[(cursor + n) % order.length];
      if (counts.get(p)! < cap) {
        counts.set(p, counts.get(p)! + 1);
        cursor = (cursor + n + 1) % order.length;
        placed = true;
        break;
      }
    }
    if (!placed) break;
  }

  guard = 0;
  while (sum() > total && guard++ < 200) {
    // Trim the largest part, sparing focus areas until there is nothing else to take
    const candidates = active
      .filter((p) => counts.get(p)! > 1)
      .sort((a, b) => {
        const fa = focusParts.includes(a) ? 1 : 0;
        const fb = focusParts.includes(b) ? 1 : 0;
        if (fa !== fb) return fa - fb;
        return counts.get(b)! - counts.get(a)!;
      });
    if (!candidates.length) break;
    counts.set(candidates[0], counts.get(candidates[0])! - 1);
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

  // Drop lifts that are too technical for this experience level before anything else
  const tooAdvanced = new Set(TOO_ADVANCED[level]);
  const usableLibrary = library.filter((ex) => !tooAdvanced.has(ex.id));

  // Focus areas only ever boost the volume of parts a day already trains — they are never
  // grafted onto unrelated days, which is what would put curls in a leg session.
  const focusParts = focusAreas.flatMap((fa) => FOCUS_TO_PARTS[fa]);
  const wantsCardio = focusAreas.includes('Cardio') || goal === 'fitness' || goal === 'fatloss';

  // Tracks how often each exercise has been used so later days pick fresh variations
  const globalUse = new Map<string, number>();

  return split.map((day) => {
    const cardioSlots = wantsCardio ? (focusAreas.includes('Cardio') ? 2 : 1) : 0;
    const strengthBudget = Math.max(2, perSession - cardioSlots);
    const counts = allocate(day.parts, strengthBudget, focusParts, day.weights);

    const excluded = new Set(day.exclude ?? []);
    const usedToday = new Set<string>();
    const patternCount = new Map<string, number>();
    const exercises: GeneratedExercise[] = [];
    let heavyUsed = 0;
    let axialUsed = 0;

    /** Session-level gates: no repeats, no banned lifts, no pattern or spinal overload. */
    const isEligible = (ex: Exercise) => {
      if (usedToday.has(ex.id) || excluded.has(ex.id)) return false;
      if (AXIAL_HEAVY.has(ex.id) && axialUsed >= 1) return false;
      const pattern = PATTERN[ex.id] ?? 'other';
      const cap = LOOSE_PATTERNS.has(pattern) ? LOOSE_PATTERN_CAP : PATTERN_CAP;
      return (patternCount.get(pattern) ?? 0) < cap;
    };

    const take = (ex: Exercise, kind: 'compound' | 'accessory' | 'cardio' | 'core') => {
      const useHeavy = kind === 'compound' && heavyUsed < MAX_HEAVY_PER_SESSION;
      const [sets, reps] = useHeavy ? scheme.compound : scheme[kind === 'compound' ? 'accessory' : kind];
      if (useHeavy) heavyUsed++;
      if (AXIAL_HEAVY.has(ex.id)) axialUsed++;
      const pattern = PATTERN[ex.id] ?? 'other';
      patternCount.set(pattern, (patternCount.get(pattern) ?? 0) + 1);
      globalUse.set(ex.id, (globalUse.get(ex.id) ?? 0) + 1);
      usedToday.add(ex.id);
      const capped = Math.min(reps, SKILL_REP_CAP[ex.id] ?? reps);
      exercises.push({ exerciseId: ex.id, exerciseName: ex.name, targetSets: sets, targetReps: capped });
    };

    const poolFor = (part: BodyPart) =>
      candidatesFor(part, usableLibrary, equipment)
        .sort((a, b) => (globalUse.get(a.id) ?? 0) - (globalUse.get(b.id) ?? 0));

    for (const part of day.parts) {
      const want = counts.get(part) ?? 0;
      const pool = poolFor(part);
      let taken = 0;
      for (const ex of pool) {
        if (taken >= want) break;
        if (!isEligible(ex)) continue;
        take(ex, part === 'Core' ? 'core' : COMPOUNDS.has(ex.id) ? 'compound' : 'accessory');
        taken++;
      }
    }

    // A thin pool (bodyweight-only, say) or a pattern cap can leave the day short. Top up
    // from the day's own parts, then core and conditioning — both of which suit any
    // session. Never from the whole library, which would put rows on a push day.
    if (exercises.length < strengthBudget) {
      const backfill = [...day.parts, 'Core' as BodyPart, 'Cardio' as BodyPart].flatMap(poolFor);
      for (const ex of backfill) {
        if (exercises.length >= strengthBudget) break;
        if (!isEligible(ex)) continue;
        const pattern = PATTERN[ex.id] ?? 'other';
        take(ex, pattern === 'core' ? 'core' : pattern === 'conditioning' ? 'cardio' : COMPOUNDS.has(ex.id) ? 'compound' : 'accessory');
      }
    }

    for (let i = 0; i < cardioSlots; i++) {
      const ex = poolFor('Cardio').find(isEligible);
      if (!ex) break;
      take(ex, 'cardio');
    }

    // Backfill appends after the main pass, which can leave core sitting in the middle
    // of the strength work. Stable-sort so core and conditioning always close the session.
    const ordered = exercises
      .map((e, i) => ({ e, i }))
      .sort((a, b) => sessionRank(a.e.exerciseId) - sessionRank(b.e.exerciseId) || a.i - b.i)
      .map(({ e }) => e);

    return { name: day.name, exercises: ordered };
  });
}

export function suggestPlanName(answers: WizardAnswers): string {
  return `${GOAL_LABELS[answers.goal].title} · ${answers.daysPerWeek} Day`;
}
