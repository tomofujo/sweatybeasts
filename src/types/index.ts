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
  | 'Chest'
  | 'Back'
  | 'Shoulders'
  | 'Legs'
  | 'Arms'
  | 'Core'
  | 'Full Body';

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
