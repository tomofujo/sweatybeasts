import type { Exercise, Workout, Activity, AppSettings, PersonalBest } from '../types';
import { DEFAULT_SETTINGS } from '../types';

const KEYS = {
  exercises: 'sb_exercises',
  workouts: 'sb_workouts',
  activities: 'sb_activities',
  settings: 'sb_settings',
  pbs: 'sb_pbs',
} as const;

function get<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}

function set<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// Exercises
export function getExercises(): Exercise[] {
  return get<Exercise[]>(KEYS.exercises, []);
}
export function saveExercises(exercises: Exercise[]): void {
  set(KEYS.exercises, exercises);
}

// Workouts
export function getWorkouts(): Workout[] {
  return get<Workout[]>(KEYS.workouts, []);
}
export function saveWorkouts(workouts: Workout[]): void {
  set(KEYS.workouts, workouts);
}

// Activities
export function getActivities(): Activity[] {
  return get<Activity[]>(KEYS.activities, []);
}
export function saveActivities(activities: Activity[]): void {
  set(KEYS.activities, activities);
}

// Settings
export function getSettings(): AppSettings {
  return get<AppSettings>(KEYS.settings, DEFAULT_SETTINGS);
}
export function saveSettings(settings: AppSettings): void {
  set(KEYS.settings, settings);
}

// Personal Bests
export function getPBs(): PersonalBest[] {
  return get<PersonalBest[]>(KEYS.pbs, []);
}
export function savePBs(pbs: PersonalBest[]): void {
  set(KEYS.pbs, pbs);
}

// Clear all
export function clearAllData(): void {
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
}
