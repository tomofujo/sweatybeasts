import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Trash2, Play, Edit3, X, Save, Dumbbell, ChevronDown, ChevronUp, FolderPlus } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import ExerciseSVG from '../components/ExerciseSVG';
import type { WorkoutExercise, Exercise } from '../types';
import { getExercises, saveExercises } from '../utils/storage';
import { builtInExercises } from '../data/exercises';

// ── Types ─────────────────────────────────────────────────────────────────────

interface RoutineGroup {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

interface Routine {
  id: string;
  name: string;
  exercises: RoutineExercise[];
  createdAt: string;
  groupId?: string;
}

interface RoutineExercise {
  exerciseId: string;
  exerciseName: string;
  targetSets: number;
  targetReps: number;
}

const ROUTINES_KEY = 'sb_routines';
const GROUPS_KEY = 'sb_routine_groups';

function getRoutines(): Routine[] {
  try { return JSON.parse(localStorage.getItem(ROUTINES_KEY) ?? '[]'); } catch { return []; }
}
function saveRoutines(r: Routine[]): void { localStorage.setItem(ROUTINES_KEY, JSON.stringify(r)); }

function getGroups(): RoutineGroup[] {
  try { return JSON.parse(localStorage.getItem(GROUPS_KEY) ?? '[]'); } catch { return []; }
}
function saveGroups(g: RoutineGroup[]): void { localStorage.setItem(GROUPS_KEY, JSON.stringify(g)); }

const GROUP_COLORS = [
  '#D4FF00', // lime
  '#00D4FF', // cyan
  '#FF2D6B', // pink
  '#00FF88', // green
  '#FF7A00', // orange
  '#BF5FFF', // purple
  '#FFE600', // yellow
  '#FF3D00', // red
];

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

// ── Numeric input ─────────────────────────────────────────────────────────────

function NumericInput({ value, min = 1, max = 99, onChange, className }: {
  value: number; min?: number; max?: number; onChange: (n: number) => void; className?: string;
}) {
  const [raw, setRaw] = useState(String(value));
  useEffect(() => { setRaw(String(value)); }, [value]);
  return (
    <input
      type="text" inputMode="numeric" pattern="[0-9]*" value={raw} className={className}
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

// ── Routine card ──────────────────────────────────────────────────────────────

function RoutineCard({ routine, onStart, onEdit, onDelete }: {
  routine: Routine;
  onStart: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[2px] p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#ffffff]">{routine.name}</h3>
        <div className="flex items-center gap-1">
          <button onClick={onStart} className="flex items-center gap-1 px-3 py-1.5 bg-[#D4FF00] text-[#0a0a0a] rounded-[2px] text-[10px] font-bold uppercase tracking-wider hover:brightness-110 transition-all">
            <Play size={12} /> Start
          </button>
          <button onClick={onEdit} className="p-1.5 text-[#888888] hover:text-[#D4FF00] transition-colors"><Edit3 size={14} /></button>
          <button onClick={onDelete} className="p-1.5 text-[#888888] hover:text-[#ff4444] transition-colors"><Trash2 size={14} /></button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {routine.exercises.map((re, idx) => (
          <span key={idx} className="text-[10px] font-bold uppercase tracking-wider text-[#888888] bg-[#1f1f1f] border border-[#2a2a2a] px-2 py-1 rounded-[2px]">
            {re.exerciseName} · {re.targetSets}×{re.targetReps ?? 10}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Routines() {
  const navigate = useNavigate();
  const location = useLocation();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [groups, setGroups] = useState<RoutineGroup[]>([]);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Group form
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [groupName, setGroupName] = useState('');
  const [groupColor, setGroupColor] = useState(GROUP_COLORS[0]);
  const [deleteGroupConfirm, setDeleteGroupConfirm] = useState<string | null>(null);

  // Routine form state
  const [routineName, setRoutineName] = useState('');
  const [routineGroupId, setRoutineGroupId] = useState<string | undefined>(undefined);
  const [routineExercises, setRoutineExercises] = useState<RoutineExercise[]>([]);

  const [showTemplates, setShowTemplates] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  // Exercise search
  const [showExerciseSearch, setShowExerciseSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [muscleFilter, setMuscleFilter] = useState<string>('All');
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    setRoutines(getRoutines());
    setGroups(getGroups());
    let exercises = getExercises();
    if (exercises.length === 0) { saveExercises(builtInExercises); exercises = builtInExercises; }
    setAvailableExercises(exercises);
  }, []);

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

  function toggleGroup(id: string) {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  // ── Group CRUD ──────────────────────────────────────────────────────────────

  function openCreateGroup() {
    setEditingGroupId(null);
    setGroupName('');
    setGroupColor(GROUP_COLORS[groups.length % GROUP_COLORS.length]);
    setShowGroupForm(true);
  }

  function openEditGroup(group: RoutineGroup) {
    setEditingGroupId(group.id);
    setGroupName(group.name);
    setGroupColor(group.color);
    setShowGroupForm(true);
  }

  function handleSaveGroup() {
    if (!groupName.trim()) return;
    let updated: RoutineGroup[];
    if (editingGroupId) {
      updated = groups.map((g) => g.id === editingGroupId ? { ...g, name: groupName.trim(), color: groupColor } : g);
    } else {
      updated = [...groups, { id: crypto.randomUUID(), name: groupName.trim(), color: groupColor, createdAt: new Date().toISOString() }];
    }
    saveGroups(updated);
    setGroups(updated);
    setShowGroupForm(false);
  }

  function handleDeleteGroup(id: string) {
    const updatedGroups = groups.filter((g) => g.id !== id);
    const updatedRoutines = routines.map((r) => r.groupId === id ? { ...r, groupId: undefined } : r);
    saveGroups(updatedGroups);
    saveRoutines(updatedRoutines);
    setGroups(updatedGroups);
    setRoutines(updatedRoutines);
    setDeleteGroupConfirm(null);
  }

  // ── Routine CRUD ────────────────────────────────────────────────────────────

  function resetForm() {
    setRoutineName('');
    setRoutineGroupId(undefined);
    setRoutineExercises([]);
    setEditingId(null);
    setShowForm(false);
  }

  function openCreate() { resetForm(); setShowForm(true); }

  function openEdit(routine: Routine) {
    setRoutineName(routine.name);
    setRoutineGroupId(routine.groupId);
    setRoutineExercises(routine.exercises.map((re) => ({ ...re, targetReps: re.targetReps ?? 10 })));
    setEditingId(routine.id);
    setShowForm(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }

  function handleSave() {
    if (!routineName.trim() || routineExercises.length === 0) return;
    const routine: Routine = {
      id: editingId ?? crypto.randomUUID(),
      name: routineName.trim(),
      exercises: routineExercises,
      groupId: routineGroupId,
      createdAt: editingId ? (routines.find((r) => r.id === editingId)?.createdAt ?? new Date().toISOString()) : new Date().toISOString(),
    };
    const updated = editingId ? routines.map((r) => r.id === editingId ? routine : r) : [...routines, routine];
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
    setRoutineExercises((prev) => [...prev, { exerciseId: exercise.id, exerciseName: exercise.name, targetSets: 3, targetReps: 10 }]);
    setShowExerciseSearch(false);
  }

  function startRoutine(routine: Routine) {
    const workoutExercises: WorkoutExercise[] = routine.exercises.map((re) => ({
      id: crypto.randomUUID(),
      exerciseId: re.exerciseId,
      exerciseName: re.exerciseName,
      targetReps: re.targetReps ?? 10,
      sets: Array.from({ length: re.targetSets }, () => ({ id: crypto.randomUUID(), reps: 0, weight: 0, notes: '', isPB: false })),
    }));
    navigate('/workout', { state: { template: { name: routine.name, exercises: workoutExercises } } });
  }

  // ── Render helpers ──────────────────────────────────────────────────────────

  const ungrouped = routines.filter((r) => !r.groupId);

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold uppercase tracking-wider text-[#ffffff]">Routines</h1>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowTemplates(true)} className="flex items-center gap-2 bg-[#1a1a1a] border border-[#2a2a2a] text-[#D4FF00] px-3 py-2 rounded-[2px] font-bold uppercase tracking-wider text-sm hover:border-[#D4FF00] transition-colors">
              Templates
            </button>
            <button onClick={openCreateGroup} className="flex items-center gap-2 bg-[#1a1a1a] border border-[#2a2a2a] text-[#888888] px-3 py-2 rounded-[2px] font-bold uppercase tracking-wider text-sm hover:border-[#888888] hover:text-[#ffffff] transition-colors">
              <FolderPlus size={16} /> Group
            </button>
            <button onClick={openCreate} className="flex items-center gap-2 bg-[#D4FF00] text-[#0a0a0a] px-3 py-2 rounded-[2px] font-bold uppercase tracking-wider text-sm hover:brightness-110 transition-all">
              <Plus size={18} /> New Routine
            </button>
          </div>
        </div>

        {/* Routine form */}
        {showForm && (
          <div ref={formRef} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[2px] p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold uppercase tracking-wider text-[#ffffff]">{editingId ? 'Edit Routine' : 'Create Routine'}</h2>
              <button onClick={resetForm} className="text-[#888888] hover:text-[#ffffff] transition-colors"><X size={20} /></button>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#888888] mb-1.5">
                Routine Name <span className="text-[#ff4444]">*</span>
              </label>
              <input
                type="text" value={routineName} onChange={(e) => setRoutineName(e.target.value)}
                placeholder="e.g. Push Day, Upper Body"
                className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-[#ffffff] placeholder-[#888888] px-4 py-2.5 rounded-[2px] text-sm focus:outline-none focus:border-[#D4FF00] transition-colors"
              />
            </div>

            {/* Group picker */}
            {groups.length > 0 && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#888888] mb-1.5">Group</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setRoutineGroupId(undefined)}
                    className={`px-3 py-1.5 rounded-[2px] text-[11px] font-bold uppercase tracking-wider border transition-colors ${!routineGroupId ? 'bg-[#2a2a2a] text-[#ffffff] border-[#888888]' : 'bg-[#1f1f1f] text-[#888888] border-[#2a2a2a] hover:border-[#555555]'}`}
                  >
                    No group
                  </button>
                  {groups.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setRoutineGroupId(g.id)}
                      className={`px-3 py-1.5 rounded-[2px] text-[11px] font-bold uppercase tracking-wider border transition-colors ${routineGroupId === g.id ? 'text-[#000000]' : 'text-[#888888] bg-[#1f1f1f] border-[#2a2a2a] hover:border-[#555555]'}`}
                      style={routineGroupId === g.id ? { backgroundColor: g.color, borderColor: g.color } : {}}
                    >
                      {g.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Exercise list */}
            <div>
              <div className="flex items-center gap-4 mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#888888]">Exercises</label>
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
                        <ExerciseSVG exerciseId={re.exerciseId} exerciseName={re.exerciseName} className="w-full h-full" />
                      </div>
                      <span className="flex-1 text-sm font-bold text-[#ffffff] truncate">{re.exerciseName}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        <NumericInput value={re.targetSets} min={1} max={20} onChange={(n) => setRoutineExercises((prev) => prev.map((e, i) => i === idx ? { ...e, targetSets: n } : e))} className="w-10 bg-[#1f1f1f] border border-[#2a2a2a] rounded-[2px] px-1 py-1 text-[#ffffff] text-sm text-center focus:outline-none focus:border-[#D4FF00]" />
                        <span className="text-[10px] text-[#888888] uppercase w-5">s</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <NumericInput value={re.targetReps} min={1} max={999} onChange={(n) => setRoutineExercises((prev) => prev.map((e, i) => i === idx ? { ...e, targetReps: n } : e))} className="w-10 bg-[#1f1f1f] border border-[#2a2a2a] rounded-[2px] px-1 py-1 text-[#ffffff] text-sm text-center focus:outline-none focus:border-[#D4FF00]" />
                        <span className="text-[10px] text-[#888888] uppercase w-5">r</span>
                      </div>
                      <button onClick={() => setRoutineExercises((prev) => prev.filter((_, i) => i !== idx))} className="text-[#888888] hover:text-[#ff4444] transition-colors p-1"><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={() => { setSearchQuery(''); setMuscleFilter('All'); setShowExerciseSearch(true); }} className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#D4FF00] hover:brightness-110 transition-all">
                <Plus size={14} /> Add Exercise
              </button>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button onClick={handleSave} disabled={!routineName.trim() || routineExercises.length === 0} className="flex items-center gap-2 bg-[#D4FF00] text-[#0a0a0a] px-5 py-2.5 rounded-[2px] font-bold uppercase tracking-wider text-sm hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                <Save size={16} /> {editingId ? 'Update Routine' : 'Save Routine'}
              </button>
              <button onClick={resetForm} className="px-5 py-2.5 rounded-[2px] font-bold uppercase tracking-wider text-sm text-[#888888] border border-[#2a2a2a] hover:text-[#ffffff] hover:border-[#888888] transition-colors">Cancel</button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {routines.length === 0 && groups.length === 0 && !showForm && (
          <div className="text-center py-16">
            <Dumbbell size={32} className="mx-auto mb-3 text-[#888888]" />
            <p className="text-[#888888] font-bold uppercase tracking-wider text-sm">No routines yet. Create your first template.</p>
          </div>
        )}

        {/* Grouped routines */}
        {groups.map((group) => {
          const groupRoutines = routines.filter((r) => r.groupId === group.id);
          const isCollapsed = collapsedGroups.has(group.id);
          return (
            <div key={group.id} className="rounded-[2px] border border-[#2a2a2a] overflow-hidden">
              {/* Group header */}
              <div className="flex items-center justify-between px-4 py-3" style={{ borderLeft: `4px solid ${group.color}` }}>
                <button className="flex items-center gap-3 flex-1 text-left" onClick={() => toggleGroup(group.id)}>
                  <span className="text-sm font-bold uppercase tracking-wider text-[#ffffff]">{group.name}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[2px]" style={{ backgroundColor: `${group.color}22`, color: group.color }}>
                    {groupRoutines.length} {groupRoutines.length === 1 ? 'routine' : 'routines'}
                  </span>
                  {isCollapsed ? <ChevronDown size={14} className="text-[#888888] ml-auto" /> : <ChevronUp size={14} className="text-[#888888] ml-auto" />}
                </button>
                <div className="flex items-center gap-1 ml-3">
                  <button onClick={() => openEditGroup(group)} className="p-1.5 text-[#888888] hover:text-[#D4FF00] transition-colors"><Edit3 size={13} /></button>
                  <button onClick={() => setDeleteGroupConfirm(group.id)} className="p-1.5 text-[#888888] hover:text-[#ff4444] transition-colors"><Trash2 size={13} /></button>
                </div>
              </div>
              {/* Group routines */}
              {!isCollapsed && (
                <div className="p-3 space-y-2 bg-[#0f0f0f]">
                  {groupRoutines.length === 0 ? (
                    <p className="text-xs text-[#555555] uppercase tracking-wider text-center py-4">No routines in this group yet.</p>
                  ) : (
                    groupRoutines.map((routine) => (
                      <RoutineCard key={routine.id} routine={routine} onStart={() => startRoutine(routine)} onEdit={() => openEdit(routine)} onDelete={() => setDeleteConfirm(routine.id)} />
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Ungrouped routines */}
        {ungrouped.length > 0 && (
          <div className="space-y-3">
            {groups.length > 0 && (
              <p className="text-xs font-bold uppercase tracking-wider text-[#555555]">Ungrouped</p>
            )}
            {ungrouped.map((routine) => (
              <RoutineCard key={routine.id} routine={routine} onStart={() => startRoutine(routine)} onEdit={() => openEdit(routine)} onDelete={() => setDeleteConfirm(routine.id)} />
            ))}
          </div>
        )}

        {/* Group form modal */}
        {showGroupForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[2px] p-6 max-w-sm w-full mx-4 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold uppercase tracking-wider text-[#ffffff]">{editingGroupId ? 'Edit Group' : 'New Group'}</h3>
                <button onClick={() => setShowGroupForm(false)} className="text-[#888888] hover:text-[#ffffff]"><X size={18} /></button>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#888888] mb-1.5">Name</label>
                <input type="text" value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="e.g. Strength, Cardio, 4-Day Split" autoFocus className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-[#ffffff] placeholder-[#888888] px-4 py-2.5 rounded-[2px] text-sm focus:outline-none focus:border-[#D4FF00] transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#888888] mb-2">Colour</label>
                <div className="flex flex-wrap gap-2">
                  {GROUP_COLORS.map((c) => (
                    <button key={c} onClick={() => setGroupColor(c)} className="w-8 h-8 rounded-[2px] transition-all" style={{ backgroundColor: c, outline: groupColor === c ? `2px solid #fff` : 'none', outlineOffset: '2px' }} />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <button onClick={handleSaveGroup} disabled={!groupName.trim()} className="flex items-center gap-2 bg-[#D4FF00] text-[#0a0a0a] px-5 py-2.5 rounded-[2px] font-bold uppercase tracking-wider text-sm hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed">
                  <Save size={14} /> {editingGroupId ? 'Update' : 'Create'}
                </button>
                <button onClick={() => setShowGroupForm(false)} className="px-5 py-2.5 rounded-[2px] font-bold uppercase tracking-wider text-sm text-[#888888] border border-[#2a2a2a] hover:text-[#ffffff]">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Delete routine confirm */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[2px] p-6 max-w-sm w-full mx-4 space-y-4">
              <h3 className="text-base font-bold uppercase tracking-wider text-[#ffffff]">Delete Routine?</h3>
              <p className="text-sm text-[#888888]">Are you sure? This cannot be undone.</p>
              <div className="flex items-center gap-3 pt-1">
                <button onClick={() => handleDelete(deleteConfirm)} className="flex items-center gap-2 bg-[#ff4444] text-[#ffffff] px-4 py-2 rounded-[2px] font-bold uppercase tracking-wider text-sm"><Trash2 size={14} /> Delete</button>
                <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 rounded-[2px] font-bold uppercase tracking-wider text-sm text-[#888888] border border-[#2a2a2a] hover:text-[#ffffff]">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Delete group confirm */}
        {deleteGroupConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[2px] p-6 max-w-sm w-full mx-4 space-y-4">
              <h3 className="text-base font-bold uppercase tracking-wider text-[#ffffff]">Delete Group?</h3>
              <p className="text-sm text-[#888888]">The group will be deleted. Routines inside it will become ungrouped.</p>
              <div className="flex items-center gap-3 pt-1">
                <button onClick={() => handleDeleteGroup(deleteGroupConfirm)} className="flex items-center gap-2 bg-[#ff4444] text-[#ffffff] px-4 py-2 rounded-[2px] font-bold uppercase tracking-wider text-sm"><Trash2 size={14} /> Delete</button>
                <button onClick={() => setDeleteGroupConfirm(null)} className="px-4 py-2 rounded-[2px] font-bold uppercase tracking-wider text-sm text-[#888888] border border-[#2a2a2a] hover:text-[#ffffff]">Cancel</button>
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
                <button onClick={() => setShowTemplates(false)} className="text-[#888888] hover:text-[#ffffff] p-1"><X size={18} /></button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {WEEKLY_TEMPLATES.map((template) => (
                  <button key={template.name} onClick={() => { setRoutineName(template.name); setRoutineExercises(template.exercises); setEditingId(null); setShowTemplates(false); setShowForm(true); }} className="w-full text-left px-4 py-4 border-b border-[#2a2a2a] hover:bg-[#1f1f1f] transition-colors">
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
                <button onClick={() => setShowExerciseSearch(false)} className="text-[#888888] hover:text-[#ffffff] p-1"><X size={18} /></button>
              </div>
              <div className="px-4 py-3 border-b border-[#2a2a2a]">
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search exercises..." autoFocus className="w-full bg-[#1f1f1f] border border-[#2a2a2a] rounded-[2px] px-3 py-2 text-[#ffffff] text-sm placeholder:text-[#888888]/50 focus:outline-none focus:border-[#D4FF00]" />
              </div>
              <div className="px-4 py-2 border-b border-[#2a2a2a] flex flex-wrap gap-2">
                {MUSCLE_GROUPS.map((group) => (
                  <button key={group} onClick={() => setMuscleFilter(group)} className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-[2px] transition-colors ${muscleFilter === group ? 'bg-[#D4FF00] text-[#0a0a0a]' : 'bg-[#1f1f1f] text-[#888888] border border-[#2a2a2a]'}`}>{group}</button>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto">
                {filteredExercises.length === 0 ? (
                  <div className="px-4 py-8 text-center text-[#888888] text-sm">No exercises found.</div>
                ) : (
                  filteredExercises.map((exercise) => (
                    <button key={exercise.id} onClick={() => addExerciseToRoutine(exercise)} className="w-full text-left px-4 py-3 border-b border-[#2a2a2a] hover:bg-[#1f1f1f] transition-colors flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#1f1f1f] border border-[#2a2a2a] rounded-[2px] overflow-hidden shrink-0">
                        <ExerciseSVG exerciseId={exercise.id} exerciseName={exercise.name} className="w-full h-full" />
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
