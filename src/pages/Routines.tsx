import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Trash2, Play, Edit3, X, Save, Dumbbell } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import ExerciseSVG from '../components/ExerciseSVG';
import type { WorkoutExercise, Exercise } from '../types';
import { getExercises, saveExercises } from '../utils/storage';
import { builtInExercises } from '../data/exercises';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Routine {
  id: string;
  name: string;
  exercises: RoutineExercise[];
  createdAt: string;
}

interface RoutineExercise {
  exerciseId: string;
  exerciseName: string;
  targetSets: number;
  targetReps: number;
}

const STORAGE_KEY = 'sb_routines';

function getRoutines(): Routine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRoutines(routines: Routine[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(routines));
}

const MUSCLE_GROUPS = ['All', 'Chest', 'Back', 'Shoulders', 'Legs', 'Arms', 'Core', 'Full Body'] as const;

// ── Pre-built weekly templates ────────────────────────────────────────────────

interface RoutineTemplate {
  name: string;
  description: string;
  exercises: { exerciseId: string; exerciseName: string; targetSets: number; targetReps: number }[];
}

const WEEKLY_TEMPLATES: RoutineTemplate[] = [
  {
    name: 'Strength — Push',
    description: 'Compound pressing focus',
    exercises: [
      { exerciseId: 'barbell-bench-press', exerciseName: 'Bench Press', targetSets: 5, targetReps: 5 },
      { exerciseId: 'overhead-press', exerciseName: 'Overhead Press', targetSets: 4, targetReps: 5 },
      { exerciseId: 'incline-dumbbell-press', exerciseName: 'Incline Dumbbell Press', targetSets: 3, targetReps: 8 },
      { exerciseId: 'tricep-pushdown', exerciseName: 'Tricep Pushdown', targetSets: 3, targetReps: 12 },
      { exerciseId: 'lateral-raise', exerciseName: 'Lateral Raise', targetSets: 3, targetReps: 15 },
    ],
  },
  {
    name: 'Strength — Pull',
    description: 'Compound pulling focus',
    exercises: [
      { exerciseId: 'deadlift', exerciseName: 'Deadlift', targetSets: 5, targetReps: 5 },
      { exerciseId: 'barbell-row', exerciseName: 'Barbell Row', targetSets: 4, targetReps: 6 },
      { exerciseId: 'pull-up', exerciseName: 'Pull-ups', targetSets: 4, targetReps: 8 },
      { exerciseId: 'barbell-curl', exerciseName: 'Barbell Curl', targetSets: 3, targetReps: 10 },
      { exerciseId: 'face-pull', exerciseName: 'Face Pull', targetSets: 3, targetReps: 15 },
    ],
  },
  {
    name: 'Strength — Legs',
    description: 'Lower body compound focus',
    exercises: [
      { exerciseId: 'squat', exerciseName: 'Squat', targetSets: 5, targetReps: 5 },
      { exerciseId: 'romanian-deadlift', exerciseName: 'Romanian Deadlift', targetSets: 4, targetReps: 8 },
      { exerciseId: 'leg-press', exerciseName: 'Leg Press', targetSets: 3, targetReps: 10 },
      { exerciseId: 'walking-lunges', exerciseName: 'Walking Lunges', targetSets: 3, targetReps: 12 },
      { exerciseId: 'calf-raise', exerciseName: 'Calf Raise', targetSets: 4, targetReps: 15 },
    ],
  },
  {
    name: 'Hypertrophy — Chest & Tris',
    description: 'High volume size focus',
    exercises: [
      { exerciseId: 'barbell-bench-press', exerciseName: 'Bench Press', targetSets: 4, targetReps: 10 },
      { exerciseId: 'incline-dumbbell-press', exerciseName: 'Incline Dumbbell Press', targetSets: 3, targetReps: 12 },
      { exerciseId: 'pec-deck', exerciseName: 'Pec Deck', targetSets: 3, targetReps: 15 },
      { exerciseId: 'cable-fly', exerciseName: 'Cable Fly', targetSets: 3, targetReps: 15 },
      { exerciseId: 'skull-crusher', exerciseName: 'Skull Crusher', targetSets: 3, targetReps: 12 },
      { exerciseId: 'overhead-tricep-extension', exerciseName: 'Overhead Tricep Extension', targetSets: 3, targetReps: 12 },
    ],
  },
  {
    name: 'Hypertrophy — Back & Bis',
    description: 'High volume pulling',
    exercises: [
      { exerciseId: 'pull-up', exerciseName: 'Pull-ups', targetSets: 4, targetReps: 10 },
      { exerciseId: 'barbell-row', exerciseName: 'Barbell Row', targetSets: 4, targetReps: 10 },
      { exerciseId: 'lat-pulldown', exerciseName: 'Lat Pulldown', targetSets: 3, targetReps: 12 },
      { exerciseId: 'seated-cable-row', exerciseName: 'Seated Cable Row', targetSets: 3, targetReps: 12 },
      { exerciseId: 'barbell-curl', exerciseName: 'Barbell Curl', targetSets: 3, targetReps: 12 },
      { exerciseId: 'hammer-curl', exerciseName: 'Hammer Curl', targetSets: 3, targetReps: 12 },
    ],
  },
  {
    name: 'Hyrox Race Prep',
    description: '8 Hyrox events in order',
    exercises: [
      { exerciseId: 'rowing-machine', exerciseName: 'Rowing Machine', targetSets: 1, targetReps: 1 },
      { exerciseId: 'ski-erg', exerciseName: 'Ski Erg', targetSets: 1, targetReps: 1 },
      { exerciseId: 'sled-push', exerciseName: 'Sled Push', targetSets: 1, targetReps: 1 },
      { exerciseId: 'sled-pull', exerciseName: 'Sled Pull', targetSets: 1, targetReps: 1 },
      { exerciseId: 'burpee-broad-jump', exerciseName: 'Burpee Broad Jump', targetSets: 1, targetReps: 20 },
      { exerciseId: 'rowing-machine', exerciseName: 'Rowing Machine', targetSets: 1, targetReps: 1 },
      { exerciseId: 'farmers-carry', exerciseName: "Farmer's Carry", targetSets: 1, targetReps: 1 },
      { exerciseId: 'sandbag-lunges', exerciseName: 'Sandbag Lunges', targetSets: 1, targetReps: 100 },
      { exerciseId: 'wall-balls', exerciseName: 'Wall Balls', targetSets: 1, targetReps: 75 },
    ],
  },
  {
    name: 'Full Body — Cardio',
    description: 'Metabolic conditioning',
    exercises: [
      { exerciseId: 'rowing-machine', exerciseName: 'Rowing Machine', targetSets: 3, targetReps: 1 },
      { exerciseId: 'thrusters', exerciseName: 'Thrusters', targetSets: 3, targetReps: 15 },
      { exerciseId: 'burpees', exerciseName: 'Burpees', targetSets: 3, targetReps: 10 },
      { exerciseId: 'kettlebell-swing', exerciseName: 'Kettlebell Swing', targetSets: 3, targetReps: 20 },
      { exerciseId: 'box-jumps', exerciseName: 'Box Jumps', targetSets: 3, targetReps: 10 },
    ],
  },
];

// ── Number input that allows clearing before typing a new value ───────────────

function NumericInput({
  value,
  min = 1,
  max = 99,
  onChange,
  className,
}: {
  value: number;
  min?: number;
  max?: number;
  onChange: (n: number) => void;
  className?: string;
}) {
  const [raw, setRaw] = useState(String(value));

  // Keep raw in sync if parent changes the value (e.g. on mount / edit load)
  useEffect(() => {
    setRaw(String(value));
  }, [value]);

  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      value={raw}
      className={className}
      onChange={(e) => {
        const v = e.target.value.replace(/[^0-9]/g, '');
        setRaw(v);
        const n = parseInt(v, 10);
        if (!isNaN(n) && n >= min && n <= max) onChange(n);
      }}
      onBlur={() => {
        const n = parseInt(raw, 10);
        const clamped = isNaN(n) ? min : Math.min(Math.max(n, min), max);
        setRaw(String(clamped));
        onChange(clamped);
      }}
    />
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Routines() {
  const navigate = useNavigate();
  const location = useLocation();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [routineName, setRoutineName] = useState('');
  const [routineExercises, setRoutineExercises] = useState<RoutineExercise[]>([]);

  const [showTemplates, setShowTemplates] = useState(false);

  // Exercise search
  const [showExerciseSearch, setShowExerciseSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [muscleFilter, setMuscleFilter] = useState<string>('All');
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);

  // Initial load
  useEffect(() => {
    setRoutines(getRoutines());
    let exercises = getExercises();
    if (exercises.length === 0) {
      saveExercises(builtInExercises);
      exercises = builtInExercises;
    }
    setAvailableExercises(exercises);
  }, []);

  // Refresh exercise list whenever the /routines tab becomes active
  // (so newly created exercises show up without a page refresh)
  useEffect(() => {
    if (location.pathname === '/routines') {
      const exercises = getExercises();
      setAvailableExercises(exercises.length > 0 ? exercises : builtInExercises);
    }
  }, [location.pathname]);

  const filteredExercises = availableExercises.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMuscle = muscleFilter === 'All' || ex.muscleGroup === muscleFilter;
    return matchesSearch && matchesMuscle;
  });

  function resetForm() {
    setRoutineName('');
    setRoutineExercises([]);
    setEditingId(null);
    setShowForm(false);
  }

  function openCreate() {
    resetForm();
    setShowForm(true);
  }

  function openEdit(routine: Routine) {
    setRoutineName(routine.name);
    // Back-compat: routines saved before targetReps was added default to 10
    setRoutineExercises(
      routine.exercises.map((re) => ({ ...re, targetReps: re.targetReps ?? 10 }))
    );
    setEditingId(routine.id);
    setShowForm(true);
  }

  function handleSave() {
    if (!routineName.trim() || routineExercises.length === 0) return;

    const routine: Routine = {
      id: editingId ?? crypto.randomUUID(),
      name: routineName.trim(),
      exercises: routineExercises,
      createdAt: editingId
        ? (routines.find((r) => r.id === editingId)?.createdAt ?? new Date().toISOString())
        : new Date().toISOString(),
    };

    let updated: Routine[];
    if (editingId) {
      updated = routines.map((r) => (r.id === editingId ? routine : r));
    } else {
      updated = [...routines, routine];
    }

    saveRoutines(updated);
    setRoutines(updated);
    resetForm();
  }

  function handleDelete(id: string) {
    const updated = routines.filter((r) => r.id !== id);
    saveRoutines(updated);
    setRoutines(updated);
    setDeleteConfirm(null);
  }

  function addExerciseToRoutine(exercise: Exercise) {
    setRoutineExercises((prev) => [
      ...prev,
      { exerciseId: exercise.id, exerciseName: exercise.name, targetSets: 3, targetReps: 10 },
    ]);
    setShowExerciseSearch(false);
  }

  function removeExerciseFromRoutine(index: number) {
    setRoutineExercises((prev) => prev.filter((_, i) => i !== index));
  }

  function updateField(index: number, field: 'targetSets' | 'targetReps', value: number) {
    setRoutineExercises((prev) =>
      prev.map((ex, i) => (i === index ? { ...ex, [field]: value } : ex))
    );
  }

  function startRoutine(routine: Routine) {
    const workoutExercises: WorkoutExercise[] = routine.exercises.map((re) => ({
      id: crypto.randomUUID(),
      exerciseId: re.exerciseId,
      exerciseName: re.exerciseName,
      sets: Array.from({ length: re.targetSets }, () => ({
        id: crypto.randomUUID(),
        reps: re.targetReps ?? 10,
        weight: 0,
        notes: '',
        isPB: false,
      })),
    }));

    navigate('/workout', {
      state: {
        template: {
          name: routine.name,
          exercises: workoutExercises,
        },
      },
    });
  }

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold uppercase tracking-wider text-[#ffffff]">
            Routines
          </h1>
          <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTemplates(true)}
            className="flex items-center gap-2 bg-[#1a1a1a] border border-[#2a2a2a] text-[#D4FF00] px-4 py-2 rounded-[2px] font-bold uppercase tracking-wider text-sm hover:border-[#D4FF00] transition-colors"
          >
            Templates
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-[#D4FF00] text-[#0a0a0a] px-4 py-2 rounded-[2px] font-bold uppercase tracking-wider text-sm hover:brightness-110 transition-all"
          >
            <Plus size={18} />
            New Routine
          </button>
          </div>
        </div>

        {/* Routine form */}
        {showForm && (
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[2px] p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold uppercase tracking-wider text-[#ffffff]">
                {editingId ? 'Edit Routine' : 'Create Routine'}
              </h2>
              <button onClick={resetForm} className="text-[#888888] hover:text-[#ffffff] transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#888888] mb-1.5">
                Routine Name <span className="text-[#ff4444]">*</span>
              </label>
              <input
                type="text"
                value={routineName}
                onChange={(e) => setRoutineName(e.target.value)}
                placeholder="e.g. Push Day, Upper Body"
                className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-[#ffffff] placeholder-[#888888] px-4 py-2.5 rounded-[2px] text-sm focus:outline-none focus:border-[#D4FF00] transition-colors"
              />
            </div>

            {/* Exercise list */}
            <div>
              <div className="flex items-center gap-4 mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#888888]">
                  Exercises
                </label>
                {routineExercises.length > 0 && (
                  <div className="flex items-center gap-3 ml-auto mr-8 text-[10px] font-bold uppercase tracking-wider text-[#555555]">
                    <span className="w-10 text-center">Sets</span>
                    <span className="w-10 text-center">Reps</span>
                  </div>
                )}
              </div>

              {routineExercises.length === 0 ? (
                <p className="text-sm text-[#888888] py-4 text-center">No exercises added yet.</p>
              ) : (
                <div className="space-y-2 mb-3">
                  {routineExercises.map((re, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-[2px] p-3">
                      <div className="w-8 h-8 bg-[#1f1f1f] border border-[#2a2a2a] rounded-[2px] overflow-hidden shrink-0">
                        <ExerciseSVG exerciseId={re.exerciseId} className="w-full h-full" />
                      </div>
                      <span className="flex-1 text-sm font-bold text-[#ffffff] truncate">{re.exerciseName}</span>

                      {/* Sets */}
                      <div className="flex items-center gap-1 shrink-0">
                        <NumericInput
                          value={re.targetSets}
                          min={1}
                          max={20}
                          onChange={(n) => updateField(idx, 'targetSets', n)}
                          className="w-10 bg-[#1f1f1f] border border-[#2a2a2a] rounded-[2px] px-1 py-1 text-[#ffffff] text-sm text-center focus:outline-none focus:border-[#D4FF00]"
                        />
                        <span className="text-[10px] text-[#888888] uppercase w-5">s</span>
                      </div>

                      {/* Reps */}
                      <div className="flex items-center gap-1 shrink-0">
                        <NumericInput
                          value={re.targetReps}
                          min={1}
                          max={999}
                          onChange={(n) => updateField(idx, 'targetReps', n)}
                          className="w-10 bg-[#1f1f1f] border border-[#2a2a2a] rounded-[2px] px-1 py-1 text-[#ffffff] text-sm text-center focus:outline-none focus:border-[#D4FF00]"
                        />
                        <span className="text-[10px] text-[#888888] uppercase w-5">r</span>
                      </div>

                      <button
                        onClick={() => removeExerciseFromRoutine(idx)}
                        className="text-[#888888] hover:text-[#ff4444] transition-colors p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => {
                  setSearchQuery('');
                  setMuscleFilter('All');
                  setShowExerciseSearch(true);
                }}
                className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#D4FF00] hover:brightness-110 transition-all"
              >
                <Plus size={14} />
                Add Exercise
              </button>
            </div>

            {/* Save */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={!routineName.trim() || routineExercises.length === 0}
                className="flex items-center gap-2 bg-[#D4FF00] text-[#0a0a0a] px-5 py-2.5 rounded-[2px] font-bold uppercase tracking-wider text-sm hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Save size={16} />
                {editingId ? 'Update Routine' : 'Save Routine'}
              </button>
              <button
                onClick={resetForm}
                className="px-5 py-2.5 rounded-[2px] font-bold uppercase tracking-wider text-sm text-[#888888] border border-[#2a2a2a] hover:text-[#ffffff] hover:border-[#888888] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Routine list */}
        {routines.length === 0 && !showForm ? (
          <div className="text-center py-16">
            <Dumbbell size={32} className="mx-auto mb-3 text-[#888888]" />
            <p className="text-[#888888] font-bold uppercase tracking-wider text-sm">
              No routines yet. Create your first template.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {routines.map((routine) => (
              <div
                key={routine.id}
                className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[2px] p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#ffffff]">
                    {routine.name}
                  </h3>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startRoutine(routine)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-[#D4FF00] text-[#0a0a0a] rounded-[2px] text-[10px] font-bold uppercase tracking-wider hover:brightness-110 transition-all"
                    >
                      <Play size={12} />
                      Start
                    </button>
                    <button
                      onClick={() => openEdit(routine)}
                      className="p-1.5 text-[#888888] hover:text-[#D4FF00] transition-colors"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(routine.id)}
                      className="p-1.5 text-[#888888] hover:text-[#ff4444] transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {routine.exercises.map((re, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-bold uppercase tracking-wider text-[#888888] bg-[#1f1f1f] border border-[#2a2a2a] px-2 py-1 rounded-[2px]"
                    >
                      {re.exerciseName} · {re.targetSets}×{re.targetReps ?? 10}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete confirmation */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[2px] p-6 max-w-sm w-full mx-4 space-y-4">
              <h3 className="text-base font-bold uppercase tracking-wider text-[#ffffff]">
                Delete Routine?
              </h3>
              <p className="text-sm text-[#888888]">
                Are you sure? This cannot be undone.
              </p>
              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex items-center gap-2 bg-[#ff4444] text-[#ffffff] px-4 py-2 rounded-[2px] font-bold uppercase tracking-wider text-sm"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 rounded-[2px] font-bold uppercase tracking-wider text-sm text-[#888888] border border-[#2a2a2a] hover:text-[#ffffff]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Weekly templates modal */}
        {showTemplates && (
          <div className="fixed inset-0 z-50 flex items-start justify-center">
            <div className="absolute inset-0 bg-black/70" onClick={() => setShowTemplates(false)} />
            <div className="relative w-full max-w-lg mx-4 mt-8 sm:mt-16 bg-[#1a1a1a] border border-[#2a2a2a] rounded-[2px] max-h-[80vh] flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a2a]">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#ffffff]">Weekly Templates</h2>
                <button onClick={() => setShowTemplates(false)} className="text-[#888888] hover:text-[#ffffff] p-1">
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {WEEKLY_TEMPLATES.map((template) => (
                  <button
                    key={template.name}
                    onClick={() => {
                      setRoutineName(template.name);
                      setRoutineExercises(template.exercises.map((ex) => ({
                        ...ex,
                        targetReps: ex.targetReps,
                      })));
                      setEditingId(null);
                      setShowTemplates(false);
                      setShowForm(true);
                    }}
                    className="w-full text-left px-4 py-4 border-b border-[#2a2a2a] hover:bg-[#1f1f1f] transition-colors"
                  >
                    <p className="text-sm font-bold uppercase tracking-wider text-[#ffffff]">{template.name}</p>
                    <p className="text-xs text-[#888888] mt-0.5">{template.description} · {template.exercises.length} exercises</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Exercise search modal */}
        {showExerciseSearch && (
          <div className="fixed inset-0 z-50 flex items-start justify-center">
            <div className="absolute inset-0 bg-black/70" onClick={() => setShowExerciseSearch(false)} />
            <div className="relative w-full max-w-lg mx-4 mt-8 sm:mt-24 bg-[#1a1a1a] border border-[#2a2a2a] rounded-[2px] max-h-[80vh] flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a2a]">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#ffffff]">Select Exercise</h2>
                <button onClick={() => setShowExerciseSearch(false)} className="text-[#888888] hover:text-[#ffffff] p-1">
                  <X size={18} />
                </button>
              </div>
              <div className="px-4 py-3 border-b border-[#2a2a2a]">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search exercises..."
                  autoFocus
                  className="w-full bg-[#1f1f1f] border border-[#2a2a2a] rounded-[2px] px-3 py-2 text-[#ffffff] text-sm placeholder:text-[#888888]/50 focus:outline-none focus:border-[#D4FF00]"
                />
              </div>
              <div className="px-4 py-2 border-b border-[#2a2a2a] flex flex-wrap gap-2">
                {MUSCLE_GROUPS.map((group) => (
                  <button
                    key={group}
                    onClick={() => setMuscleFilter(group)}
                    className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-[2px] transition-colors ${
                      muscleFilter === group
                        ? 'bg-[#D4FF00] text-[#0a0a0a]'
                        : 'bg-[#1f1f1f] text-[#888888] border border-[#2a2a2a]'
                    }`}
                  >
                    {group}
                  </button>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto">
                {filteredExercises.length === 0 ? (
                  <div className="px-4 py-8 text-center text-[#888888] text-sm">No exercises found.</div>
                ) : (
                  filteredExercises.map((exercise) => (
                    <button
                      key={exercise.id}
                      onClick={() => addExerciseToRoutine(exercise)}
                      className="w-full text-left px-4 py-3 border-b border-[#2a2a2a] hover:bg-[#1f1f1f] transition-colors flex items-center gap-3"
                    >
                      <div className="w-10 h-10 bg-[#1f1f1f] border border-[#2a2a2a] rounded-[2px] overflow-hidden shrink-0">
                        <ExerciseSVG exerciseId={exercise.id} className="w-full h-full" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[#ffffff] truncate">{exercise.name}</p>
                        <p className="text-[10px] text-[#888888] uppercase tracking-wider">{exercise.muscleGroup}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
