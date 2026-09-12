export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  secondaryMuscles: MuscleGroup[];
  equipment: Equipment;
  description: string;
  instructions: string[];
  isCustom: boolean;
  imageUrl?: string;
}

export type MuscleGroup =
  // Body parts (general — used for filter chips)
  | 'Chest' | 'Back' | 'Shoulders' | 'Legs' | 'Arms' | 'Core' | 'Full Body'
  // Specific muscles
  | 'Pecs' | 'Upper Chest'
  | 'Lats' | 'Upper Back' | 'Lower Back' | 'Traps'
  | 'Front Delts' | 'Side Delts' | 'Rear Delts'
  | 'Biceps' | 'Triceps' | 'Forearms'
  | 'Quads' | 'Hamstrings' | 'Glutes' | 'Calves' | 'Hip Flexors' | 'Adductors' | 'Abductors'
  | 'Abs' | 'Obliques';

// Grouped options for muscle selects in forms
export const MUSCLE_GROUP_OPTIONS: { group: string; muscles: MuscleGroup[] }[] = [
  { group: 'Body Part', muscles: ['Chest', 'Back', 'Shoulders', 'Legs', 'Arms', 'Core', 'Full Body'] },
  { group: 'Chest', muscles: ['Pecs', 'Upper Chest'] },
  { group: 'Back', muscles: ['Lats', 'Upper Back', 'Lower Back', 'Traps'] },
  { group: 'Shoulders', muscles: ['Front Delts', 'Side Delts', 'Rear Delts'] },
  { group: 'Arms', muscles: ['Biceps', 'Triceps', 'Forearms'] },
  { group: 'Legs', muscles: ['Quads', 'Hamstrings', 'Glutes', 'Calves', 'Hip Flexors', 'Adductors', 'Abductors'] },
  { group: 'Core', muscles: ['Abs', 'Obliques'] },
];

// Maps specific muscles to their body-part category for filter matching
export const MUSCLE_BODY_PART: Partial<Record<MuscleGroup, MuscleGroup>> = {
  'Pecs': 'Chest', 'Upper Chest': 'Chest',
  'Lats': 'Back', 'Upper Back': 'Back', 'Lower Back': 'Back', 'Traps': 'Back',
  'Front Delts': 'Shoulders', 'Side Delts': 'Shoulders', 'Rear Delts': 'Shoulders',
  'Biceps': 'Arms', 'Triceps': 'Arms', 'Forearms': 'Arms',
  'Quads': 'Legs', 'Hamstrings': 'Legs', 'Glutes': 'Legs', 'Calves': 'Legs',
  'Hip Flexors': 'Legs', 'Adductors': 'Legs', 'Abductors': 'Legs',
  'Abs': 'Core', 'Obliques': 'Core',
};

export type Equipment =
  | 'Barbell'
  | 'Dumbbell'
  | 'Cable'
  | 'Bodyweight'
  | 'Machine'
  | 'Kettlebell'
  | 'Other';

export interface WorkoutSet {
  id: string;
  reps: number;
  seconds?: number; // used when exercise trackingMode is 'seconds'
  weight: number; // stored in kg
  bodyweight?: boolean; // when true, weight is irrelevant (bodyweight exercise)
  notes: string;
  isPB: boolean;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  exerciseName: string;
  sets: WorkoutSet[];
  supersetGroup?: string; // Exercises sharing the same group ID are a superset
  trackingMode?: 'reps' | 'seconds'; // defaults to 'reps' when absent
  targetReps?: number; // set when loaded from a routine — shown as ghost placeholder
  weightUnit?: 'kg' | 'lbs'; // per-exercise unit override; if absent falls back to session unit
}

export interface Workout {
  id: string;
  date: string; // ISO date string
  name: string;
  notes: string;
  exercises: WorkoutExercise[];
  status: 'draft' | 'complete';
  createdAt: string;
}

export interface Activity {
  id: string;
  type: ActivityType;
  customName?: string;
  date: string;
  time: string;
  duration: number; // minutes
  distance?: number; // stored in km
  averagePace?: string;
  rounds?: number;
  roundDuration?: number;
  partnerNotes?: string;
  workInterval?: number;
  restInterval?: number;
  intensity?: number; // 1-10
  calories?: number;
  notes: string;
  mood?: MoodRating;
  createdAt: string;
}

export type ActivityType =
  | 'Climbing'
  | 'Combat Sports'
  | 'Cycling'
  | 'Football'
  | 'HIIT'
  | 'Hyrox'
  | 'Martial Arts'
  | 'Other Sport'
  | 'Pilates'
  | 'Rowing'
  | 'Rugby'
  | 'Running'
  | 'Swimming'
  | 'Yoga'
  | 'Custom';

export type MoodRating = 1 | 2 | 3 | 4 | 5;

export const MOOD_EMOJIS: Record<MoodRating, string> = {
  1: '😴',
  2: '😐',
  3: '🙂',
  4: '💪',
  5: '🔥',
};

export interface PersonalBest {
  exerciseId: string;
  exerciseName: string;
  heaviestWeight: number; // kg
  heaviestWeightReps: number;
  highestVolumeSet: number; // weight * reps in kg
  highestVolumeWeight: number;
  highestVolumeReps: number;
  bestWeightxReps: number;
  date: string;
}

export interface AppSettings {
  weightUnit: 'kg' | 'lbs';
  distanceUnit: 'km' | 'miles';
  firstDayOfWeek: 'monday' | 'sunday';
}

export const DEFAULT_SETTINGS: AppSettings = {
  weightUnit: 'kg',
  distanceUnit: 'km',
  firstDayOfWeek: 'monday',
};
