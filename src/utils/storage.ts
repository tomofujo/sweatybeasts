import type { Exercise, Workout, Activity, AppSettings, PersonalBest, WorkoutExercise } from '../types';
import { DEFAULT_SETTINGS } from '../types';

const KEYS = {
  exercises: 'sb_exercises',
  workouts: 'sb_workouts',
  activities: 'sb_activities',
  settings: 'sb_settings',
  pbs: 'sb_pbs',
  activeSession: 'sb_active_session',
} as const;

export interface ActiveSession {
  date: string;
  sessionName: string;
  exercises: WorkoutExercise[];
  savedAt: string;
}

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

// Active Session
export function getActiveSession(): ActiveSession | null {
  return get<ActiveSession | null>(KEYS.activeSession, null);
}
export function saveActiveSession(session: ActiveSession): void {
  set(KEYS.activeSession, session);
}
export function clearActiveSession(): void {
  localStorage.removeItem(KEYS.activeSession);
}

// Clear all
export function clearAllData(): void {
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
}
