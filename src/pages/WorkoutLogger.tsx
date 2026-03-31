import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { Plus, Trash2, Search, Save, X, Trophy, AlertCircle, Link2, Unlink, ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import ExerciseSVG from '../components/ExerciseSVG';
import RestTimer from '../components/RestTimer';
import SessionTimer from '../components/SessionTimer';
import { getExercises, saveExercises, getWorkouts, saveWorkouts, getPBs, savePBs, getActiveSession, saveActiveSession, clearActiveSession } from '../utils/storage';
import { inputToKg } from '../utils/units';
import { getSettings } from '../utils/storage';
import type { Exercise, Workout, WorkoutExercise, WorkoutSet, PersonalBest, AppSettings } from '../types';
import { builtInExercises } from '../data/exercises';

// ── PB Detection ──────────────────────────────────────────────────────────────

function checkPB(
  exerciseId: string,
  exerciseName: string,
  weight: number,
  reps: number,
  pbs: PersonalBest[],
): { isPB: boolean; updatedPBs: PersonalBest[] } {
  const volume = weight * reps;
  const existing = pbs.find((p) => p.exerciseId === exerciseId);
  let isPB = false;
  const updated = [...pbs];

  if (!existing) {
    isPB = true;
    updated.push({
      exerciseId,
      exerciseName,
      heaviestWeight: weight,
      heaviestWeightReps: reps,
      highestVolumeSet: volume,
      highestVolumeWeight: weight,
      highestVolumeReps: reps,
      bestWeightxReps: volume,
      date: new Date().toISOString(),
    });
  } else {
    if (weight > existing.heaviestWeight) {
      isPB = true;
      existing.heaviestWeight = weight;
      existing.heaviestWeightReps = reps;
      existing.date = new Date().toISOString();
    }
    if (volume > existing.highestVolumeSet) {
      isPB = true;
      existing.highestVolumeSet = volume;
      existing.highestVolumeWeight = weight;
      existing.highestVolumeReps = reps;
      existing.date = new Date().toISOString();
    }
  }
  return { isPB, updatedPBs: updated };
}

// ── Muscle group list for filter chips ────────────────────────────────────────

const MUSCLE_GROUPS = ['All', 'Chest', 'Back', 'Shoulders', 'Legs', 'Arms', 'Core', 'Full Body'] as const;

// ── Component ─────────────────────────────────────────────────────────────────

export default function WorkoutLogger() {
  const location = useLocation();

  // Settings
  const [settings, setSettings] = useState<AppSettings | null>(null);

  // Edit mode
  const [editingWorkoutId, setEditingWorkoutId] = useState<string | null>(null);

  // Session state
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [sessionName, setSessionName] = useState('');
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);

  // Exercise search modal
  const [showExerciseSearch, setShowExerciseSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [muscleFilter, setMuscleFilter] = useState('All');
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  // Inline custom exercise creation inside the search modal
  const [showCreateCustom, setShowCreateCustom] = useState(false);
  const [newExName, setNewExName] = useState('');
  const [newExMuscle, setNewExMuscle] = useState<import('../types').MuscleGroup>('Chest');
  const [newExEquipment, setNewExEquipment] = useState<import('../types').Equipment>('Barbell');

  // Feedback
  const [saved, setSaved] = useState(false);
  const [savedStatus, setSavedStatus] = useState<'draft' | 'complete'>('complete');
  const [pbAlerts, setPbAlerts] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Session-level unit override
  const [sessionUnit, setSessionUnit] = useState<'kg' | 'lbs' | null>(null);

  // Rest timer
  const [showRestTimer, setShowRestTimer] = useState(false);

  // Collapsed exercises
  const [collapsedExercises, setCollapsedExercises] = useState<Set<string>>(new Set());
  const toggleCollapse = useCallback((id: string) => {
    setCollapsedExercises((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // ── Drag-to-reorder ───────────────────────────────────────────────────────
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const activeDragIdxRef = useRef<number | null>(null);
  const exercisesContainerRef = useRef<HTMLDivElement>(null);

  const reorderExercises = useCallback((fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx) return;
    setExercises((prev) => {
      const arr = [...prev];
      const [item] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, item);
      return arr;
    });
  }, []);

  // Called directly from onPointerDown on the grip handle.
  // Attaches document-level move/up listeners so events fire even when the
  // pointer leaves the container, and non-passive touchmove prevents iOS scroll.
  const handleGripPointerDown = useCallback((e: React.PointerEvent, idx: number) => {
    e.preventDefault();
    if (activeDragIdxRef.current !== null) return; // already dragging
    activeDragIdxRef.current = idx;
    setDragIdx(idx);

    const getExIdxAt = (x: number, y: number): { idx: number; rect: DOMRect } | null => {
      for (const el of document.elementsFromPoint(x, y)) {
        let t: Element | null = el;
        while (t && !t.getAttribute('data-ex-idx')) t = t.parentElement;
        if (t) {
          const i = parseInt(t.getAttribute('data-ex-idx')!);
          if (!isNaN(i)) return { idx: i, rect: t.getBoundingClientRect() };
        }
      }
      return null;
    };

    const move = (x: number, y: number) => {
      if (activeDragIdxRef.current === null) return;
      const hit = getExIdxAt(x, y);
      if (!hit || hit.idx === activeDragIdxRef.current) return;
      const { relY } = { relY: y - hit.rect.top };
      const threshold = hit.rect.height * 0.4;
      if (relY < threshold || relY > hit.rect.height - threshold) {
        reorderExercises(activeDragIdxRef.current, hit.idx);
        activeDragIdxRef.current = hit.idx;
        setDragIdx(hit.idx);
        setDragOverIdx(hit.idx);
      }
    };

    const onPointerMove = (ev: PointerEvent) => { ev.preventDefault(); move(ev.clientX, ev.clientY); };
    const onTouchMove  = (ev: TouchEvent)   => { ev.preventDefault(); move(ev.touches[0].clientX, ev.touches[0].clientY); };
    const cleanup = () => {
      activeDragIdxRef.current = null;
      setDragIdx(null);
      setDragOverIdx(null);
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup',   cleanup);
      document.removeEventListener('pointercancel', cleanup);
      document.removeEventListener('touchmove',   onTouchMove);
      document.removeEventListener('touchend',    cleanup);
    };

    document.addEventListener('pointermove',   onPointerMove, { passive: false });
    document.addEventListener('pointerup',     cleanup);
    document.addEventListener('pointercancel', cleanup);
    document.addEventListener('touchmove',     onTouchMove, { passive: false });
    document.addEventListener('touchend',      cleanup);
  }, [reorderExercises]);

  // Active session persistence
  const [showResumeBanner, setShowResumeBanner] = useState(false);
  const initialLoadDone = useRef(false);

  // ── Load settings + exercises on mount ────────────────────────────────────

  useEffect(() => {
    setSettings(getSettings());
    let exerciseList = getExercises();
    if (exerciseList.length === 0) {
      saveExercises(builtInExercises);
      exerciseList = builtInExercises;
    }
    setAvailableExercises(exerciseList);

    // Check for saved active session
    const savedSession = getActiveSession();
    if (savedSession && (savedSession.exercises.length > 0 || savedSession.sessionName)) {
      setDate(savedSession.date);
      setSessionName(savedSession.sessionName);
      setExercises(savedSession.exercises);
      setShowResumeBanner(true);
    }
    initialLoadDone.current = true;
  }, []);

  // ── Refresh exercise list whenever the workout tab becomes active ──────────

  useEffect(() => {
    if (location.pathname === '/workout') {
      const exerciseList = getExercises();
      setAvailableExercises(exerciseList.length > 0 ? exerciseList : builtInExercises);
    }
  }, [location.pathname]);

  // ── Handle incoming edit/template from History ────────────────────────────

  useEffect(() => {
    const state = location.state as { editWorkout?: Workout; template?: Workout } | null;
    if (!state) return;

    if (state.editWorkout) {
      const w = state.editWorkout;
      setEditingWorkoutId(w.id);
      setDate(w.date);
      setSessionName(w.name);
      // Convert stored kg weights back to display unit
      const displaySettings = getSettings();
      const unit = displaySettings.weightUnit;
      const displayExercises = w.exercises.map((ex) => ({
        ...ex,
        sets: ex.sets.map((s) => ({
          ...s,
          weight: unit === 'lbs' ? Math.round(s.weight * 2.20462 * 10) / 10 : s.weight,
        })),
      }));
      setExercises(displayExercises);
      setShowResumeBanner(false);
      // Clear the state so navigating back doesn't reload
      window.history.replaceState({}, '');
    } else if (state.template) {
      const w = state.template;
      setEditingWorkoutId(null);
      setDate(new Date().toISOString().slice(0, 10));
      setSessionName(w.name);
      // Clear set data for template
      const templateExercises = w.exercises.map((ex) => ({
        ...ex,
        id: crypto.randomUUID(),
        sets: ex.sets.map((s) => ({
          ...s,
          id: crypto.randomUUID(),
          weight: 0,
          reps: 0,
          notes: '',
          isPB: false,
        })),
      }));
      setExercises(templateExercises);
      setShowResumeBanner(false);
      window.history.replaceState({}, '');
    }
  }, [location.state]);

  // ── Auto-save session to localStorage (immediate) ────────────────────────
  // No debounce — localStorage writes are synchronous and fast. Saving
  // immediately ensures the session survives a service-worker-triggered
  // page reload, which can happen with less than 500ms of notice.

  useEffect(() => {
    if (!initialLoadDone.current) return;

    if (exercises.length > 0 || sessionName) {
      saveActiveSession({
        date,
        sessionName,
        exercises,
        savedAt: new Date().toISOString(),
      });
    } else {
      clearActiveSession();
    }
  }, [date, sessionName, exercises]);

  const weightUnit = sessionUnit ?? settings?.weightUnit ?? 'kg';

  // ── Exercise search helpers ───────────────────────────────────────────────

  const filteredExercises = availableExercises.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMuscle = muscleFilter === 'All' || ex.muscleGroup === muscleFilter;
    return matchesSearch && matchesMuscle;
  });

  const openExerciseSearch = useCallback(() => {
    setSearchQuery('');
    setMuscleFilter('All');
    setShowExerciseSearch(true);
  }, []);

  const addExercise = useCallback((exercise: Exercise) => {
    const newExercise: WorkoutExercise = {
      id: crypto.randomUUID(),
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      sets: [],
    };
    setExercises((prev) => [...prev, newExercise]);
    setShowExerciseSearch(false);
    setShowCreateCustom(false);
    setNewExName('');
  }, []);

  const removeExercise = useCallback((exerciseEntryId: string) => {
    setExercises((prev) => prev.filter((e) => e.id !== exerciseEntryId));
  }, []);

  // ── Set helpers ───────────────────────────────────────────────────────────

  const addSet = useCallback((exerciseEntryId: string) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exerciseEntryId) return ex;
        const newSet: WorkoutSet = {
          id: crypto.randomUUID(),
          reps: 0,
          weight: 0,
          notes: '',
          isPB: false,
        };
        return { ...ex, sets: [...ex.sets, newSet] };
      }),
    );
  }, []);

  const updateSet = useCallback(
    (exerciseEntryId: string, setId: string, field: keyof WorkoutSet, value: string | number | boolean) => {
      setExercises((prev) =>
        prev.map((ex) => {
          if (ex.id !== exerciseEntryId) return ex;
          return {
            ...ex,
            sets: ex.sets.map((s) => {
              if (s.id !== setId) return s;
              return { ...s, [field]: value };
            }),
          };
        }),
      );
    },
    [],
  );

  const removeSet = useCallback((exerciseEntryId: string, setId: string) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exerciseEntryId) return ex;
        return { ...ex, sets: ex.sets.filter((s) => s.id !== setId) };
      }),
    );
  }, []);

  // ── Superset helpers ─────────────────────────────────────────────────────

  const toggleSuperset = useCallback((exerciseIndex: number) => {
    setExercises((prev) => {
      if (exerciseIndex >= prev.length - 1) return prev; // Need at least 2 exercises to link
      const current = prev[exerciseIndex];
      const next = prev[exerciseIndex + 1];

      // If both already share the same superset group, unlink them
      if (current.supersetGroup && current.supersetGroup === next.supersetGroup) {
        return prev.map((ex, i) => {
          if (i === exerciseIndex || i === exerciseIndex + 1) {
            return { ...ex, supersetGroup: undefined };
          }
          return ex;
        });
      }

      // Otherwise link them with a new or existing group
      const groupId = current.supersetGroup || next.supersetGroup || crypto.randomUUID();
      return prev.map((ex, i) => {
        if (i === exerciseIndex || i === exerciseIndex + 1) {
          return { ...ex, supersetGroup: groupId };
        }
        return ex;
      });
    });
  }, []);

  const toggleTrackingMode = useCallback((exerciseId: string) => {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id === exerciseId
          ? { ...ex, trackingMode: ex.trackingMode === 'seconds' ? 'reps' : 'seconds' }
          : ex
      )
    );
  }, []);

  const toggleExerciseUnit = useCallback((exerciseId: string) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        const cur = ex.weightUnit ?? weightUnit;
        const next = cur === 'kg' ? 'lbs' : 'kg';
        return {
          ...ex,
          weightUnit: next,
          sets: ex.sets.map((s) => ({
            ...s,
            weight:
              next === 'lbs'
                ? Math.round(s.weight * 2.20462 * 10) / 10
                : Math.round((s.weight / 2.20462) * 10) / 10,
          })),
        };
      })
    );
  }, [weightUnit]);

  // ── Save workout ──────────────────────────────────────────────────────────

  const saveWorkout = useCallback((status: 'draft' | 'complete') => {
    // For complete, validate: at least one exercise with at least one set
    if (status === 'complete') {
      const hasValidData = exercises.some((ex) => ex.sets.length > 0);
      if (!hasValidData) return;
    }

    // PB detection (only for complete workouts)
    let currentPBs = getPBs();
    const newPBNames: string[] = [];

    const finalExercises = exercises.map((ex) => {
      const updatedSets = ex.sets.map((s) => {
        // Convert displayed weight to kg for storage (use per-exercise unit if set)
        const weightInKg = inputToKg(s.weight, ex.weightUnit ?? weightUnit);
        if (status === 'complete') {
          const { isPB, updatedPBs } = checkPB(ex.exerciseId, ex.exerciseName, weightInKg, s.reps, currentPBs);
          currentPBs = updatedPBs;
          if (isPB) {
            if (!newPBNames.includes(ex.exerciseName)) {
              newPBNames.push(ex.exerciseName);
            }
          }
          return { ...s, weight: weightInKg, isPB };
        }
        return { ...s, weight: weightInKg };
      });
      return { ...ex, sets: updatedSets };
    });

    // Save PBs (only for complete)
    if (status === 'complete') {
      savePBs(currentPBs);
    }

    // Build workout object
    const workout: Workout = {
      id: editingWorkoutId ?? crypto.randomUUID(),
      date,
      name: sessionName || 'Workout',
      notes: '',
      exercises: finalExercises,
      status,
      createdAt: editingWorkoutId
        ? (getWorkouts().find((w) => w.id === editingWorkoutId)?.createdAt ?? new Date().toISOString())
        : new Date().toISOString(),
    };

    const existingWorkouts = getWorkouts();
    if (editingWorkoutId) {
      saveWorkouts(existingWorkouts.map((w) => (w.id === editingWorkoutId ? workout : w)));
    } else {
      saveWorkouts([...existingWorkouts, workout]);
    }

    // Feedback
    setPbAlerts(newPBNames);
    setSaved(true);
    setSavedStatus(status);
    setTimeout(() => {
      setSaved(false);
      setPbAlerts([]);
    }, 4000);

    // Clear active session from localStorage
    clearActiveSession();

    // Reset form
    setEditingWorkoutId(null);
    setExercises([]);
    setSessionName('');
    setDate(new Date().toISOString().slice(0, 10));
  }, [exercises, date, sessionName, weightUnit, editingWorkoutId]);

  // ── Delete workout ────────────────────────────────────────────────────────
  const handleDeleteWorkout = useCallback(() => {
    if (editingWorkoutId) {
      const existing = getWorkouts().filter((w) => w.id !== editingWorkoutId);
      saveWorkouts(existing);
    }
    clearActiveSession();
    setEditingWorkoutId(null);
    setExercises([]);
    setSessionName('');
    setDate(new Date().toISOString().slice(0, 10));
    setShowDeleteConfirm(false);
  }, [editingWorkoutId]);

  // ── Render ────────────────────────────────────────────────────────────────

  if (!settings) return null;

  return (
    <PageWrapper>
      <div className="px-4 py-6 max-w-3xl mx-auto">
        {/* ── Resume session banner ────────────────────────────────── */}
        {showResumeBanner && (
          <div className="mb-4 px-4 py-3 bg-[#D4FF00]/10 border border-[#D4FF00] rounded-[2px] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[#D4FF00] text-sm font-bold uppercase tracking-wider">
              <AlertCircle size={16} />
              <span>You have an unsaved session in progress — resume it?</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setShowResumeBanner(false)}
                className="text-xs font-bold uppercase tracking-wider text-[#D4FF00] hover:text-[#a3c700] transition-colors"
              >
                Continue
              </button>
              <button
                onClick={() => {
                  setShowResumeBanner(false);
                  clearActiveSession();
                  setExercises([]);
                  setSessionName('');
                  setDate(new Date().toISOString().slice(0, 10));
                }}
                className="text-xs font-bold uppercase tracking-wider text-[#888888] hover:text-[#ff4444] transition-colors"
              >
                Discard
              </button>
            </div>
          </div>
        )}

        {/* ── Success banner ─────────────────────────────────────────── */}
        {saved && (
          <div className="mb-4 px-4 py-3 bg-[#00cc66]/15 border border-[#00cc66] rounded-[2px] text-[#00cc66] text-sm font-bold uppercase tracking-wider">
            {savedStatus === 'draft' ? 'Draft saved!' : 'Workout saved successfully!'}
            {pbAlerts.length > 0 && (
              <div className="flex items-center gap-2 mt-1 text-[#D4FF00]">
                <Trophy size={14} />
                <span>New PB{pbAlerts.length > 1 ? 's' : ''}: {pbAlerts.join(', ')}</span>
              </div>
            )}
          </div>
        )}

        {/* ── Page heading ───────────────────────────────────────────── */}
        <div className="mb-6">
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-2xl font-bold uppercase tracking-wider text-[#ffffff]">
              {editingWorkoutId ? 'Edit Workout' : 'Log Workout'}
            </h1>
            <button
              onClick={() => setShowRestTimer((v) => !v)}
              className={`shrink-0 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-[2px] transition-colors ${
                showRestTimer ? 'bg-[#D4FF00] text-[#0a0a0a]' : 'bg-[#1a1a1a] border border-[#2a2a2a] text-[#888888] hover:text-[#D4FF00]'
              }`}
            >
              Rest Timer
            </button>
          </div>
          <div className="mt-2">
            <SessionTimer />
          </div>
        </div>

        {/* ── Rest timer ─────────────────────────────────────────────── */}
        {showRestTimer && <RestTimer onClose={() => setShowRestTimer(false)} />}

        {/* ── Date + Session name + Unit toggle ─────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#888888] mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-[2px] px-3 py-2 text-[#ffffff] text-sm focus:outline-none focus:border-[#D4FF00] transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#888888] mb-1">
              Session Name
            </label>
            <input
              type="text"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="e.g. Push Day, Leg Day"
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-[2px] px-3 py-2 text-[#ffffff] text-sm placeholder:text-[#888888]/50 focus:outline-none focus:border-[#D4FF00] transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#888888] mb-1">
              Weight Unit
            </label>
            <div className="flex rounded-[2px] overflow-hidden border border-[#2a2a2a]">
              <button
                onClick={() => setSessionUnit('kg')}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                  weightUnit === 'kg'
                    ? 'bg-[#D4FF00] text-[#0a0a0a]'
                    : 'bg-[#1a1a1a] text-[#888888] hover:text-[#ffffff]'
                }`}
              >
                KG
              </button>
              <button
                onClick={() => setSessionUnit('lbs')}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                  weightUnit === 'lbs'
                    ? 'bg-[#D4FF00] text-[#0a0a0a]'
                    : 'bg-[#1a1a1a] text-[#888888] hover:text-[#ffffff]'
                }`}
              >
                LBS
              </button>
            </div>
          </div>
        </div>

        {/* ── Add exercise button ─────────────────────────────────────── */}
        <button
          onClick={openExerciseSearch}
          className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-[2px] text-[#D4FF00] text-sm font-bold uppercase tracking-wider hover:border-[#D4FF00] transition-colors mb-6"
        >
          <Plus size={16} />
          Add Exercise
        </button>

        {/* ── Empty state ─────────────────────────────────────────────── */}
        {exercises.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[#888888] text-sm font-bold uppercase tracking-wider">
              No exercises added yet. Let&apos;s get to work.
            </p>
          </div>
        )}

        {/* ── Exercise list ───────────────────────────────────────────── */}
        <div ref={exercisesContainerRef} className="space-y-2">
          {exercises.map((ex, exIndex) => {
            const isCollapsed = collapsedExercises.has(ex.id);
            const trackingMode = ex.trackingMode ?? 'reps';
            const isInSuperset = !!ex.supersetGroup;
            const prevEx = exIndex > 0 ? exercises[exIndex - 1] : null;
            const nextEx = exIndex < exercises.length - 1 ? exercises[exIndex + 1] : null;
            const isFirstInSuperset = isInSuperset && (!prevEx || prevEx.supersetGroup !== ex.supersetGroup);
            const isLastInSuperset = isInSuperset && (!nextEx || nextEx.supersetGroup !== ex.supersetGroup);
            const isLinkedToNext = isInSuperset && nextEx?.supersetGroup === ex.supersetGroup;

            return (
              <motion.div
                key={ex.id}
                layout
                layoutId={ex.id}
                transition={{ duration: 0.08, ease: 'easeOut' }}
                data-ex-idx={exIndex}
                style={{ opacity: dragIdx === exIndex ? 0.5 : 1 }}
              >
                {/* Superset label */}
                {isFirstInSuperset && (
                  <div className="flex items-center gap-2 mb-1 px-2">
                    <Link2 size={12} className="text-[#D4FF00]" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4FF00]">Superset</span>
                  </div>
                )}

                <div className={`bg-[#1a1a1a] border rounded-[2px] transition-colors ${
                  dragOverIdx === exIndex && dragIdx !== exIndex ? 'border-[#D4FF00]' :
                  isInSuperset ? 'border-[#D4FF00]/30 ml-3' : 'border-[#2a2a2a]'
                } ${isInSuperset && !isLastInSuperset ? 'border-b-0 rounded-b-none' : ''} ${isInSuperset && !isFirstInSuperset ? 'rounded-t-none' : ''}`}>
              {/* Exercise header */}
              <div className="flex items-center justify-between px-2 py-3 border-b border-[#2a2a2a]">
                <div className="flex items-center gap-2">
                  {/* Drag handle */}
                  <div
                    data-grip-idx={exIndex}
                    className="touch-none cursor-grab active:cursor-grabbing text-[#444444] hover:text-[#888888] transition-colors flex-shrink-0 px-1 py-2 -ml-1 select-none"
                    style={{ WebkitUserSelect: 'none', userSelect: 'none', touchAction: 'none' }}
                    onPointerDown={(e) => handleGripPointerDown(e, exIndex)}
                    onContextMenu={(e) => e.preventDefault()}
                    title="Drag to reorder"
                  >
                    <GripVertical size={16} />
                  </div>
                  <div className="w-10 h-10 bg-[#1f1f1f] border border-[#2a2a2a] rounded-[2px] overflow-hidden flex-shrink-0">
                    <ExerciseSVG exerciseId={ex.exerciseId} className="w-full h-full" />
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#ffffff] leading-tight">
                    {ex.exerciseName}
                  </h3>
                </div>
                <div className="flex items-center gap-1">
                  {/* Reps / Secs toggle */}
                  <button
                    onClick={() => toggleTrackingMode(ex.id)}
                    className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-[2px] transition-colors ${
                      trackingMode === 'seconds' ? 'bg-[#D4FF00] text-[#0a0a0a]' : 'bg-[#1f1f1f] border border-[#2a2a2a] text-[#888888] hover:text-[#D4FF00]'
                    }`}
                    title="Toggle reps / seconds tracking"
                  >
                    {trackingMode === 'seconds' ? 'Secs' : 'Reps'}
                  </button>
                  {/* Per-exercise weight unit toggle */}
                  <button
                    onClick={() => toggleExerciseUnit(ex.id)}
                    className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-[2px] transition-colors ${
                      ex.weightUnit ? 'bg-[#333300] border border-[#D4FF00]/40 text-[#D4FF00]' : 'bg-[#1f1f1f] border border-[#2a2a2a] text-[#888888] hover:text-[#D4FF00]'
                    }`}
                    title="Toggle weight unit for this exercise"
                  >
                    {ex.weightUnit ?? weightUnit}
                  </button>
                  {exIndex < exercises.length - 1 && (
                    <button
                      onClick={() => toggleSuperset(exIndex)}
                      className={`p-1 transition-colors ${isLinkedToNext ? 'text-[#D4FF00] hover:text-[#ff4444]' : 'text-[#888888] hover:text-[#D4FF00]'}`}
                      title={isLinkedToNext ? 'Unlink superset' : 'Link as superset with next exercise'}
                    >
                      {isLinkedToNext ? <Unlink size={16} /> : <Link2 size={16} />}
                    </button>
                  )}
                  <button
                    onClick={() => removeExercise(ex.id)}
                    className="text-[#888888] hover:text-[#ff4444] transition-colors p-1"
                    title="Remove exercise"
                  >
                    <Trash2 size={16} />
                  </button>
                  {/* Collapse toggle */}
                  <button
                    onClick={() => toggleCollapse(ex.id)}
                    className="p-1 text-[#888888] hover:text-[#D4FF00] transition-colors"
                    title={isCollapsed ? 'Expand' : 'Collapse'}
                  >
                    {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                  </button>
                </div>
              </div>

              {!isCollapsed && (
                <>
              {/* Sets table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[#888888] text-xs font-bold uppercase tracking-wider">
                      <th className="px-4 py-2 text-left w-12">Set</th>
                      <th className="px-4 py-2 text-left">Weight</th>
                      <th className="px-4 py-2 text-left">{trackingMode === 'seconds' ? 'Secs' : 'Reps'}</th>
                      <th className="px-4 py-2 text-left">Notes</th>
                      <th className="px-4 py-2 text-center w-12">PB</th>
                      <th className="px-4 py-2 text-center w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {ex.sets.map((set, setIndex) => (
                      <tr key={set.id} className="border-t border-[#2a2a2a]">
                        <td className="px-4 py-2 text-[#888888] font-mono">{setIndex + 1}</td>
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min={0}
                              step={0.5}
                              value={set.weight || ''}
                              onChange={(e) =>
                                updateSet(ex.id, set.id, 'weight', parseFloat(e.target.value) || 0)
                              }
                              className="w-20 bg-[#1f1f1f] border border-[#2a2a2a] rounded-[2px] px-2 py-1 text-[#ffffff] text-sm text-center focus:outline-none focus:border-[#D4FF00] transition-colors"
                            />
                            <span className="text-[#888888] text-xs">{ex.weightUnit ?? weightUnit}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          {trackingMode === 'seconds' ? (
                            <input
                              type="number"
                              min={0}
                              value={set.seconds || ''}
                              onChange={(e) =>
                                updateSet(ex.id, set.id, 'seconds', parseInt(e.target.value) || 0)
                              }
                              className="w-16 bg-[#1f1f1f] border border-[#2a2a2a] rounded-[2px] px-2 py-1 text-[#ffffff] text-sm text-center focus:outline-none focus:border-[#D4FF00] transition-colors"
                            />
                          ) : (
                            <input
                              type="number"
                              min={0}
                              value={set.reps || ''}
                              onChange={(e) =>
                                updateSet(ex.id, set.id, 'reps', parseInt(e.target.value) || 0)
                              }
                              placeholder={ex.targetReps ? String(ex.targetReps) : ''}
                              className="w-16 bg-[#1f1f1f] border border-[#2a2a2a] rounded-[2px] px-2 py-1 text-[#ffffff] text-sm text-center focus:outline-none focus:border-[#D4FF00] transition-colors placeholder:text-[#D4FF00]/40"
                            />
                          )}
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={set.notes}
                            onChange={(e) => updateSet(ex.id, set.id, 'notes', e.target.value)}
                            placeholder="Optional"
                            className="w-full bg-[#1f1f1f] border border-[#2a2a2a] rounded-[2px] px-2 py-1 text-[#ffffff] text-sm placeholder:text-[#888888]/40 focus:outline-none focus:border-[#D4FF00] transition-colors"
                          />
                        </td>
                        <td className="px-4 py-2 text-center">
                          {set.isPB && (
                            <span className="inline-block bg-[#D4FF00]/15 text-[#D4FF00] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[2px]">
                              PB
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-center">
                          <button
                            onClick={() => removeSet(ex.id, set.id)}
                            className="text-[#888888] hover:text-[#ff4444] transition-colors p-1"
                            title="Delete set"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add set button */}
              <div className="px-4 py-3 border-t border-[#2a2a2a]">
                <button
                  onClick={() => addSet(ex.id)}
                  className="flex items-center gap-1 text-[#888888] hover:text-[#D4FF00] text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  <Plus size={14} />
                  Add Set
                </button>
              </div>
                </>
              )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── Save / Delete buttons ───────────────────────────────────── */}
        {exercises.length > 0 && (
          <div className="mt-8 space-y-2">
            <button
              onClick={() => saveWorkout('complete')}
              disabled={!exercises.some((ex) => ex.sets.length > 0)}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#D4FF00] text-[#0a0a0a] font-bold uppercase tracking-wider text-sm rounded-[2px] hover:bg-[#a3c700] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Save size={16} />
              {editingWorkoutId ? 'Update Workout' : 'Finish & Save'}
            </button>

            {/* Delete / confirm */}
            {showDeleteConfirm ? (
              <div className="flex gap-2">
                <button
                  onClick={handleDeleteWorkout}
                  className="flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-[2px] bg-[#ff4444]/10 border border-[#ff4444]/60 text-[#ff4444] hover:bg-[#ff4444]/20 transition-colors"
                >
                  Confirm Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-[2px] bg-[#1a1a1a] border border-[#2a2a2a] text-[#888888] hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full py-2.5 text-xs font-bold uppercase tracking-wider rounded-[2px] bg-[#1a1a1a] border border-[#2a2a2a] text-[#888888] hover:border-[#ff4444] hover:text-[#ff4444] transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 size={14} />
                {editingWorkoutId ? 'Delete Workout' : 'Discard Session'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Exercise search modal ──────────────────────────────────────── */}
      {showExerciseSearch && (
        <div className="fixed inset-0 z-50 flex items-start justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setShowExerciseSearch(false)}
          />

          {/* Modal */}
          <div className="relative w-full max-w-lg mx-4 mt-8 sm:mt-24 bg-[#1a1a1a] border border-[#2a2a2a] rounded-[2px] max-h-[80vh] flex flex-col">
            {/* Modal header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a2a]">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#ffffff]">
                Select Exercise
              </h2>
              <button
                onClick={() => setShowExerciseSearch(false)}
                className="text-[#888888] hover:text-[#ffffff] transition-colors p-1"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search input */}
            <div className="px-4 py-3 border-b border-[#2a2a2a]">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search exercises..."
                  autoFocus
                  className="w-full bg-[#1f1f1f] border border-[#2a2a2a] rounded-[2px] pl-9 pr-3 py-2 text-[#ffffff] text-sm placeholder:text-[#888888]/50 focus:outline-none focus:border-[#D4FF00] transition-colors"
                />
              </div>
            </div>

            {/* Muscle group filter chips */}
            <div className="px-4 py-2 border-b border-[#2a2a2a] flex flex-wrap gap-2">
              {MUSCLE_GROUPS.map((group) => (
                <button
                  key={group}
                  onClick={() => setMuscleFilter(group)}
                  className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-[2px] transition-colors ${
                    muscleFilter === group
                      ? 'bg-[#D4FF00] text-[#0a0a0a]'
                      : 'bg-[#1f1f1f] text-[#888888] border border-[#2a2a2a] hover:text-[#ffffff]'
                  }`}
                >
                  {group}
                </button>
              ))}
            </div>

            {/* Exercise list */}
            <div className="flex-1 overflow-y-auto">
              {filteredExercises.length === 0 ? (
                <div className="px-4 py-8 text-center text-[#888888] text-sm">
                  No exercises found.
                </div>
              ) : (
                filteredExercises.map((exercise) => (
                  <button
                    key={exercise.id}
                    onClick={() => addExercise(exercise)}
                    className="w-full text-left px-4 py-3 border-b border-[#2a2a2a] hover:bg-[#1f1f1f] transition-colors flex items-center gap-3"
                  >
                    <div className="w-10 h-10 bg-[#1f1f1f] border border-[#2a2a2a] rounded-[2px] overflow-hidden shrink-0">
                      <ExerciseSVG exerciseId={exercise.id} className="w-full h-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#ffffff] truncate">{exercise.name}</p>
                      <p className="text-[10px] text-[#888888] uppercase tracking-wider">
                        {exercise.muscleGroup}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#888888] bg-[#1f1f1f] border border-[#2a2a2a] px-2 py-0.5 rounded-[2px] shrink-0">
                      {exercise.equipment}
                    </span>
                  </button>
                ))
              )}
            </div>

            {/* Create custom exercise */}
            <div className="border-t border-[#2a2a2a] p-3">
              {showCreateCustom ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newExName}
                    onChange={(e) => setNewExName(e.target.value)}
                    placeholder="Exercise name..."
                    autoFocus
                    className="w-full bg-[#1f1f1f] border border-[#2a2a2a] rounded-[2px] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4FF00]"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={newExMuscle}
                      onChange={(e) => setNewExMuscle(e.target.value as import('../types').MuscleGroup)}
                      className="bg-[#1f1f1f] border border-[#2a2a2a] rounded-[2px] px-2 py-1.5 text-xs text-white focus:outline-none focus:border-[#D4FF00]"
                    >
                      {(['Chest','Back','Shoulders','Legs','Arms','Core','Full Body'] as const).map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    <select
                      value={newExEquipment}
                      onChange={(e) => setNewExEquipment(e.target.value as import('../types').Equipment)}
                      className="bg-[#1f1f1f] border border-[#2a2a2a] rounded-[2px] px-2 py-1.5 text-xs text-white focus:outline-none focus:border-[#D4FF00]"
                    >
                      {(['Barbell','Dumbbell','Cable','Machine','Bodyweight','Kettlebell','Other'] as const).map(eq => (
                        <option key={eq} value={eq}>{eq}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      disabled={!newExName.trim()}
                      onClick={() => {
                        if (!newExName.trim()) return;
                        const newEx: Exercise = {
                          id: `custom-${Date.now()}`,
                          name: newExName.trim(),
                          muscleGroup: newExMuscle,
                          secondaryMuscles: [],
                          equipment: newExEquipment,
                          description: '',
                          instructions: [],
                          isCustom: true,
                        };
                        const existing = getExercises();
                        saveExercises([...existing, newEx]);
                        setAvailableExercises((prev) => [...prev, newEx]);
                        addExercise(newEx);
                        setShowCreateCustom(false);
                        setNewExName('');
                      }}
                      className="flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-[2px] bg-[#D4FF00] text-[#0a0a0a] hover:bg-[#a3c700] transition-colors disabled:opacity-40"
                    >
                      Create & Add
                    </button>
                    <button
                      onClick={() => { setShowCreateCustom(false); setNewExName(''); }}
                      className="px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-[2px] bg-[#1f1f1f] border border-[#2a2a2a] text-[#888888] hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowCreateCustom(true)}
                  className="w-full py-2 text-xs font-bold uppercase tracking-wider rounded-[2px] bg-[#1f1f1f] border border-[#2a2a2a] text-[#888888] hover:border-[#D4FF00] hover:text-[#D4FF00] transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={12} />
                  Create Custom Exercise
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
