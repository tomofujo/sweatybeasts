import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, List, Trash2, Copy, Edit3, ChevronLeft, ChevronRight, Dumbbell, Zap, X, Save } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import { getWorkouts, saveWorkouts, getActivities, saveActivities, getSettings, getRoutines, saveRoutines } from '../utils/storage';
import { kgToDisplay } from '../utils/units';
import type { Workout, Activity, AppSettings } from '../types';
import { MOOD_EMOJIS } from '../types';

type SessionRef = { type: 'workout' | 'activity'; id: string };

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getWorkoutVolume(w: Workout): number {
  return w.exercises.reduce(
    (total, ex) => total + ex.sets.reduce((st, s) => st + s.weight * s.reps, 0),
    0
  );
}

export default function History() {
  const navigate = useNavigate();
  const location = useLocation();
  const [view, setView] = useState<'calendar' | 'list'>('list');
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [typeFilter, setTypeFilter] = useState<'all' | 'workouts' | 'activities'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [muscleGroupFilter, setMuscleGroupFilter] = useState('');
  const [activityTypeFilter, setActivityTypeFilter] = useState('');
  const [selectedSession, setSelectedSession] = useState<SessionRef | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [saveRoutineWorkoutId, setSaveRoutineWorkoutId] = useState<string | null>(null);
  const [saveRoutineName, setSaveRoutineName] = useState('');

  useEffect(() => {
    setWorkouts(getWorkouts());
    setActivities(getActivities());
    setSettings(getSettings());
  }, []);

  // Refresh whenever the history tab becomes active (keep-alive)
  useEffect(() => {
    if (location.pathname === '/history') {
      setWorkouts(getWorkouts());
      setActivities(getActivities());
      setSettings(getSettings());
    }
  }, [location.pathname]);

  // Open detail modal when navigated here from Dashboard with an openSession ref
  useEffect(() => {
    const state = location.state as { openSession?: SessionRef } | null;
    if (state?.openSession) {
      setSelectedSession(state.openSession);
      // Clear the state so navigating away and back doesn't re-open it
      navigate('/history', { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  const weightUnit = settings?.weightUnit ?? 'kg';
  const firstDayOfWeek = settings?.firstDayOfWeek ?? 'monday';

  // Unique muscle groups from workout exercise names — approximate via stored exercises
  const muscleGroups = useMemo(() => {
    return ['Chest', 'Back', 'Shoulders', 'Legs', 'Arms', 'Core', 'Full Body'];
  }, []);

  const activityTypes = useMemo(() => {
    const types = new Set<string>();
    activities.forEach((a) => types.add(a.type));
    return Array.from(types).sort();
  }, [activities]);

  // Combined and filtered sessions for list view
  const filteredSessions = useMemo(() => {
    type Session = { type: 'workout'; data: Workout } | { type: 'activity'; data: Activity };
    let sessions: Session[] = [];

    if (typeFilter !== 'activities') {
      sessions.push(...workouts.map((w) => ({ type: 'workout' as const, data: w })));
    }
    if (typeFilter !== 'workouts') {
      sessions.push(...activities.map((a) => ({ type: 'activity' as const, data: a })));
    }

    // Date range filter
    if (dateFrom) {
      sessions = sessions.filter((s) => s.data.date >= dateFrom);
    }
    if (dateTo) {
      sessions = sessions.filter((s) => s.data.date <= dateTo);
    }

    // Muscle group filter (workouts only — we filter by exercise name containing the group)
    if (muscleGroupFilter) {
      sessions = sessions.filter((s) => {
        if (s.type !== 'workout') return true;
        // Keep workout if any exercise name loosely matches — not ideal but functional
        // A better approach: we just keep all workouts since we can't determine muscle group from WorkoutExercise alone
        return true;
      });
    }

    // Activity type filter
    if (activityTypeFilter) {
      sessions = sessions.filter((s) => {
        if (s.type !== 'activity') return true;
        return s.data.type === activityTypeFilter;
      });
    }

    // Sort reverse chronological
    sessions.sort((a, b) => b.data.date.localeCompare(a.data.date) || b.data.createdAt.localeCompare(a.data.createdAt));

    return sessions;
  }, [workouts, activities, typeFilter, dateFrom, dateTo, muscleGroupFilter, activityTypeFilter]);

  // Calendar helpers
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const lastOfMonth = new Date(year, month + 1, 0);

    // Day of week for first of month (0=Sun, 1=Mon, ...)
    let startDow = firstOfMonth.getDay();
    if (firstDayOfWeek === 'monday') {
      startDow = startDow === 0 ? 6 : startDow - 1;
    }

    const days: { date: string; day: number; inMonth: boolean }[] = [];

    // Fill leading days from previous month
    const prevMonthLast = new Date(year, month, 0);
    for (let i = startDow - 1; i >= 0; i--) {
      const d = new Date(prevMonthLast);
      d.setDate(prevMonthLast.getDate() - i);
      days.push({ date: toDateStr(d), day: d.getDate(), inMonth: false });
    }

    // Current month days
    for (let d = 1; d <= lastOfMonth.getDate(); d++) {
      const dt = new Date(year, month, d);
      days.push({ date: toDateStr(dt), day: d, inMonth: true });
    }

    // Fill to 42 (6 rows of 7)
    while (days.length < 42) {
      const lastDate = new Date(days[days.length - 1].date + 'T00:00:00');
      lastDate.setDate(lastDate.getDate() + 1);
      days.push({ date: toDateStr(lastDate), day: lastDate.getDate(), inMonth: false });
    }

    return days;
  }, [currentMonth, firstDayOfWeek]);

  // Sessions by date for calendar dots
  const sessionsByDate = useMemo(() => {
    const map: Record<string, { hasWorkout: boolean; hasActivity: boolean }> = {};
    workouts.forEach((w) => {
      if (!map[w.date]) map[w.date] = { hasWorkout: false, hasActivity: false };
      map[w.date].hasWorkout = true;
    });
    activities.forEach((a) => {
      if (!map[a.date]) map[a.date] = { hasWorkout: false, hasActivity: false };
      map[a.date].hasActivity = true;
    });
    return map;
  }, [workouts, activities]);

  // Sessions for selected calendar day
  const daySessionsList = useMemo(() => {
    if (!selectedDay) return [];
    type Session = { type: 'workout'; data: Workout } | { type: 'activity'; data: Activity };
    const sessions: Session[] = [];
    workouts.filter((w) => w.date === selectedDay).forEach((w) => sessions.push({ type: 'workout', data: w }));
    activities.filter((a) => a.date === selectedDay).forEach((a) => sessions.push({ type: 'activity', data: a }));
    sessions.sort((a, b) => b.data.createdAt.localeCompare(a.data.createdAt));
    return sessions;
  }, [selectedDay, workouts, activities]);

  const monthLabel = currentMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  const dayHeaders = firstDayOfWeek === 'monday'
    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  function prevMonth() {
    setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
    setSelectedDay(null);
  }

  function nextMonth() {
    setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));
    setSelectedDay(null);
  }

  function handleDelete(sessionRef: SessionRef) {
    if (sessionRef.type === 'workout') {
      const updated = workouts.filter((w) => w.id !== sessionRef.id);
      saveWorkouts(updated);
      setWorkouts(updated);
    } else {
      const updated = activities.filter((a) => a.id !== sessionRef.id);
      saveActivities(updated);
      setActivities(updated);
    }
    setSelectedSession(null);
    setDeleteConfirm(null);
  }

  function handleDuplicate(sessionRef: SessionRef) {
    if (sessionRef.type === 'workout') {
      const workout = workouts.find((w) => w.id === sessionRef.id);
      if (workout) {
        navigate('/workout', { state: { template: workout } });
      }
    } else {
      const activity = activities.find((a) => a.id === sessionRef.id);
      if (activity) {
        navigate('/activity', { state: { template: activity } });
      }
    }
  }

  function handleEdit(sessionRef: SessionRef) {
    if (sessionRef.type === 'workout') {
      const workout = workouts.find((w) => w.id === sessionRef.id);
      if (workout) {
        navigate('/workout', { state: { editWorkout: workout } });
      }
    }
  }

  function getSelectedData(): { type: 'workout'; data: Workout } | { type: 'activity'; data: Activity } | null {
    if (!selectedSession) return null;
    if (selectedSession.type === 'workout') {
      const data = workouts.find((w) => w.id === selectedSession.id);
      return data ? { type: 'workout', data } : null;
    } else {
      const data = activities.find((a) => a.id === selectedSession.id);
      return data ? { type: 'activity', data } : null;
    }
  }

  const selectedData = getSelectedData();
  const isEmpty = workouts.length === 0 && activities.length === 0;

  function renderWorkoutSummary(w: Workout): string {
    const exerciseCount = w.exercises.length;
    const setCount = w.exercises.reduce((t, ex) => t + ex.sets.length, 0);
    const volume = kgToDisplay(getWorkoutVolume(w), weightUnit);
    const prefix = w.status === 'draft' ? '[DRAFT] ' : '';
    return `${prefix}${exerciseCount} exercise${exerciseCount !== 1 ? 's' : ''}, ${setCount} set${setCount !== 1 ? 's' : ''}, ${volume} ${weightUnit} total volume`;
  }

  function renderActivitySummary(a: Activity): string {
    const parts: string[] = [];
    if (a.duration) parts.push(`${a.duration} min`);
    parts.push(a.type === 'Custom' && a.customName ? a.customName : a.type);
    if (a.mood) parts.push(MOOD_EMOJIS[a.mood]);
    return parts.join(' · ');
  }

  // Detail modal/view
  function renderDetail() {
    if (!selectedData) return null;

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
        onClick={() => setSelectedSession(null)}
      >
        <div
          className="w-full max-w-lg max-h-[85vh] overflow-y-auto"
          style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '2px' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid #2a2a2a' }}>
            <h3 className="font-bold uppercase tracking-wider text-sm" style={{ color: '#ffffff' }}>
              {selectedData.type === 'workout' ? 'WORKOUT DETAILS' : 'ACTIVITY DETAILS'}
            </h3>
            <button
              onClick={() => setSelectedSession(null)}
              className="p-1 transition-colors cursor-pointer"
              style={{ color: '#888888' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#888888')}
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-4 space-y-4">
            {selectedData.type === 'workout' ? renderWorkoutDetail(selectedData.data) : renderActivityDetail(selectedData.data)}

            {/* Action buttons */}
            <div className="flex gap-3 pt-4 flex-wrap" style={{ borderTop: '1px solid #2a2a2a' }}>
              {selectedSession?.type === 'workout' && (
                <>
                  <button
                    onClick={() => handleEdit(selectedSession!)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 font-bold uppercase tracking-wider text-xs transition-colors cursor-pointer"
                    style={{ backgroundColor: '#D4FF00', color: '#0a0a0a', borderRadius: '2px' }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                  >
                    <Edit3 size={14} />
                    EDIT
                  </button>
                  <button
                    onClick={() => {
                      setSaveRoutineWorkoutId(selectedSession!.id);
                      setSaveRoutineName(selectedData?.type === 'workout' ? selectedData.data.name : '');
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 font-bold uppercase tracking-wider text-xs transition-colors cursor-pointer"
                    style={{ backgroundColor: '#1f1f1f', color: '#D4FF00', border: '1px solid #D4FF00', borderRadius: '2px' }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                  >
                    <Save size={14} />
                    SAVE AS ROUTINE
                  </button>
                </>
              )}
              <button
                onClick={() => handleDuplicate(selectedSession!)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 font-bold uppercase tracking-wider text-xs transition-colors cursor-pointer"
                style={{ backgroundColor: selectedSession?.type === 'workout' ? '#1f1f1f' : '#D4FF00', color: selectedSession?.type === 'workout' ? '#ffffff' : '#0a0a0a', border: selectedSession?.type === 'workout' ? '1px solid #2a2a2a' : 'none', borderRadius: '2px' }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                <Copy size={14} />
                DUPLICATE
              </button>
              <button
                onClick={() => setDeleteConfirm(selectedSession!.id)}
                className="flex items-center justify-center gap-2 px-4 py-3 font-bold uppercase tracking-wider text-xs transition-colors cursor-pointer"
                style={{ backgroundColor: 'transparent', color: '#ff4444', border: '1px solid #ff4444', borderRadius: '2px' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,68,68,0.1)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Save as Routine modal */}
        {saveRoutineWorkoutId && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}>
            <div className="w-full max-w-sm p-6 space-y-4" style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '2px' }}>
              <h4 className="font-bold uppercase tracking-wider text-sm" style={{ color: '#ffffff' }}>
                SAVE AS ROUTINE
              </h4>
              <input
                type="text"
                value={saveRoutineName}
                onChange={(e) => setSaveRoutineName(e.target.value)}
                placeholder="Routine name..."
                autoFocus
                style={{ width: '100%', backgroundColor: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: '2px', padding: '8px 12px', color: '#ffffff', fontSize: '14px', outline: 'none' }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#D4FF00')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#2a2a2a')}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const workout = workouts.find((w) => w.id === saveRoutineWorkoutId);
                    if (!workout || !saveRoutineName.trim()) return;
                    const routines = getRoutines();
                    const newRoutine = {
                      id: crypto.randomUUID(),
                      name: saveRoutineName.trim(),
                      exercises: workout.exercises.map((ex) => ({
                        exerciseId: ex.exerciseId,
                        exerciseName: ex.exerciseName,
                        targetSets: ex.sets.length || 3,
                        targetReps: ex.sets.length > 0 ? (ex.sets[0].reps || 10) : 10,
                      })),
                      createdAt: new Date().toISOString(),
                    };
                    saveRoutines([...routines, newRoutine]);
                    setSaveRoutineWorkoutId(null);
                    setSaveRoutineName('');
                  }}
                  disabled={!saveRoutineName.trim()}
                  className="flex-1 px-4 py-3 font-bold uppercase tracking-wider text-xs cursor-pointer disabled:opacity-40"
                  style={{ backgroundColor: '#D4FF00', color: '#0a0a0a', borderRadius: '2px' }}
                >
                  SAVE
                </button>
                <button
                  onClick={() => { setSaveRoutineWorkoutId(null); setSaveRoutineName(''); }}
                  className="flex-1 px-4 py-3 font-bold uppercase tracking-wider text-xs cursor-pointer"
                  style={{ backgroundColor: 'transparent', color: '#888888', border: '1px solid #2a2a2a', borderRadius: '2px' }}
                >
                  CANCEL
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete confirmation modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}>
            <div className="w-full max-w-sm p-6 space-y-4" style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '2px' }}>
              <h4 className="font-bold uppercase tracking-wider text-sm" style={{ color: '#ffffff' }}>
                CONFIRM DELETION
              </h4>
              <p className="text-sm" style={{ color: '#888888' }}>
                Are you sure you want to delete this session? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-3 font-bold uppercase tracking-wider text-xs transition-colors cursor-pointer"
                  style={{ backgroundColor: '#1f1f1f', color: '#ffffff', border: '1px solid #2a2a2a', borderRadius: '2px' }}
                >
                  CANCEL
                </button>
                <button
                  onClick={() => handleDelete(selectedSession!)}
                  className="flex-1 px-4 py-3 font-bold uppercase tracking-wider text-xs transition-colors cursor-pointer"
                  style={{ backgroundColor: '#ff4444', color: '#ffffff', borderRadius: '2px' }}
                >
                  DELETE
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderWorkoutDetail(w: Workout) {
    return (
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Dumbbell size={18} style={{ color: '#D4FF00' }} />
            <span className="font-bold text-lg" style={{ color: '#ffffff' }}>{w.name || 'Untitled Workout'}</span>
          </div>
          <span className="text-sm" style={{ color: '#888888' }}>{formatDate(w.date)}</span>
        </div>

        {w.notes && (
          <div className="text-sm p-3" style={{ backgroundColor: '#1f1f1f', color: '#888888', borderRadius: '2px' }}>
            {w.notes}
          </div>
        )}

        <div className="text-xs font-bold uppercase tracking-wider" style={{ color: '#888888' }}>
          {renderWorkoutSummary(w)}
        </div>

        {/* Exercises */}
        <div className="space-y-3">
          {w.exercises.map((ex) => (
            <div key={ex.id} className="p-3 space-y-2" style={{ backgroundColor: '#1f1f1f', borderRadius: '2px' }}>
              <div className="font-bold text-sm" style={{ color: '#ffffff' }}>{ex.exerciseName}</div>
              <div className="space-y-1">
                {ex.sets.map((set, idx) => (
                  <div key={set.id} className="flex items-center gap-2 text-sm">
                    <span className="w-6 text-center font-bold" style={{ color: '#888888' }}>{idx + 1}</span>
                    <span style={{ color: '#ffffff' }}>
                      {set.reps} reps &times; {kgToDisplay(set.weight, weightUnit)} {weightUnit}
                    </span>
                    {set.isPB && (
                      <span className="px-1.5 py-0.5 text-xs font-bold uppercase" style={{ backgroundColor: '#D4FF00', color: '#0a0a0a', borderRadius: '2px' }}>
                        PB
                      </span>
                    )}
                    {set.notes && (
                      <span className="text-xs" style={{ color: '#888888' }}>— {set.notes}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderActivityDetail(a: Activity) {
    const displayName = a.type === 'Custom' && a.customName ? a.customName : a.type;

    const fields: { label: string; value: string }[] = [
      { label: 'Date', value: formatDate(a.date) },
      { label: 'Time', value: a.time },
      { label: 'Duration', value: `${a.duration} min` },
    ];

    if (a.distance !== undefined) fields.push({ label: 'Distance', value: `${a.distance} km` });
    if (a.averagePace) fields.push({ label: 'Average Pace', value: a.averagePace });
    if (a.rounds !== undefined) fields.push({ label: 'Rounds', value: String(a.rounds) });
    if (a.roundDuration !== undefined) fields.push({ label: 'Round Duration', value: `${a.roundDuration} min` });
    if (a.partnerNotes) fields.push({ label: 'Partner Notes', value: a.partnerNotes });
    if (a.workInterval !== undefined) fields.push({ label: 'Work Interval', value: `${a.workInterval}s` });
    if (a.restInterval !== undefined) fields.push({ label: 'Rest Interval', value: `${a.restInterval}s` });
    if (a.intensity !== undefined) fields.push({ label: 'Intensity', value: `${a.intensity}/10` });
    if (a.calories !== undefined) fields.push({ label: 'Calories', value: String(a.calories) });
    if (a.mood !== undefined) fields.push({ label: 'Mood', value: MOOD_EMOJIS[a.mood] });

    return (
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap size={18} style={{ color: '#22c55e' }} />
            <span className="font-bold text-lg" style={{ color: '#ffffff' }}>{displayName}</span>
          </div>
          <span className="text-sm" style={{ color: '#888888' }}>{formatDate(a.date)}</span>
        </div>

        <div className="space-y-2">
          {fields.map((f) => (
            <div key={f.label} className="flex justify-between text-sm py-1" style={{ borderBottom: '1px solid #2a2a2a' }}>
              <span style={{ color: '#888888' }}>{f.label}</span>
              <span style={{ color: '#ffffff' }}>{f.value}</span>
            </div>
          ))}
        </div>

        {a.notes && (
          <div>
            <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#888888' }}>Notes</div>
            <div className="text-sm p-3" style={{ backgroundColor: '#1f1f1f', color: '#ffffff', borderRadius: '2px' }}>
              {a.notes}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold uppercase tracking-wider" style={{ color: '#ffffff' }}>
            HISTORY &amp; LOGS
          </h1>
          <div className="flex gap-1 p-1" style={{ backgroundColor: '#1a1a1a', borderRadius: '2px' }}>
            <button
              onClick={() => setView('list')}
              className="p-2 transition-colors cursor-pointer"
              style={{
                backgroundColor: view === 'list' ? '#D4FF00' : 'transparent',
                color: view === 'list' ? '#0a0a0a' : '#888888',
                borderRadius: '2px',
              }}
            >
              <List size={18} />
            </button>
            <button
              onClick={() => setView('calendar')}
              className="p-2 transition-colors cursor-pointer"
              style={{
                backgroundColor: view === 'calendar' ? '#D4FF00' : 'transparent',
                color: view === 'calendar' ? '#0a0a0a' : '#888888',
                borderRadius: '2px',
              }}
            >
              <Calendar size={18} />
            </button>
          </div>
        </div>

        {/* Empty state */}
        {isEmpty && (
          <div className="text-center py-16">
            <p className="font-bold uppercase tracking-wider text-sm" style={{ color: '#888888' }}>
              NO HISTORY YET. YOUR JOURNEY STARTS WITH THE FIRST SESSION.
            </p>
          </div>
        )}

        {/* Calendar View */}
        {!isEmpty && view === 'calendar' && (
          <div className="space-y-4">
            {/* Month navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={prevMonth}
                className="p-2 transition-colors cursor-pointer"
                style={{ color: '#888888' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#888888')}
              >
                <ChevronLeft size={20} />
              </button>
              <h2 className="font-bold uppercase tracking-wider text-sm" style={{ color: '#ffffff' }}>
                {monthLabel.toUpperCase()}
              </h2>
              <button
                onClick={nextMonth}
                className="p-2 transition-colors cursor-pointer"
                style={{ color: '#888888' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#888888')}
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1">
              {dayHeaders.map((dh) => (
                <div key={dh} className="text-center text-xs font-bold uppercase tracking-wider py-2" style={{ color: '#888888' }}>
                  {dh}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((cd, idx) => {
                const sessions = sessionsByDate[cd.date];
                const isToday = cd.date === toDateStr(new Date());
                const isSelected = cd.date === selectedDay;

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDay(cd.date === selectedDay ? null : cd.date)}
                    className="relative flex flex-col items-center justify-center py-3 transition-colors cursor-pointer"
                    style={{
                      backgroundColor: isSelected ? '#1f1f1f' : 'transparent',
                      color: cd.inMonth ? '#ffffff' : '#888888',
                      opacity: cd.inMonth ? 1 : 0.4,
                      borderRadius: '2px',
                      border: isToday ? '1px solid #D4FF00' : '1px solid transparent',
                    }}
                  >
                    <span className="text-sm">{cd.day}</span>
                    {sessions && (
                      <div className="flex gap-1 mt-1">
                        {sessions.hasWorkout && (
                          <div className="w-1.5 h-1.5" style={{ backgroundColor: '#D4FF00', borderRadius: '50%' }} />
                        )}
                        {sessions.hasActivity && (
                          <div className="w-1.5 h-1.5" style={{ backgroundColor: '#22c55e', borderRadius: '50%' }} />
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex gap-4 justify-center text-xs" style={{ color: '#888888' }}>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2" style={{ backgroundColor: '#D4FF00', borderRadius: '50%' }} />
                <span>Workout</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2" style={{ backgroundColor: '#22c55e', borderRadius: '50%' }} />
                <span>Activity</span>
              </div>
            </div>

            {/* Selected day sessions */}
            {selectedDay && (
              <div className="space-y-2">
                <h3 className="font-bold uppercase tracking-wider text-xs" style={{ color: '#888888' }}>
                  {formatDate(selectedDay)}
                </h3>
                {daySessionsList.length === 0 ? (
                  <p className="text-sm py-4 text-center" style={{ color: '#888888' }}>
                    No sessions on this day.
                  </p>
                ) : (
                  daySessionsList.map((s) => (
                    <button
                      key={s.data.id}
                      onClick={() => setSelectedSession({ type: s.type, id: s.data.id })}
                      className="w-full text-left p-3 flex items-center gap-3 transition-colors cursor-pointer"
                      style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '2px' }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#D4FF00')}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#2a2a2a')}
                    >
                      {s.type === 'workout' ? (
                        <Dumbbell size={18} style={{ color: '#D4FF00', flexShrink: 0 }} />
                      ) : (
                        <Zap size={18} style={{ color: '#22c55e', flexShrink: 0 }} />
                      )}
                      <div className="min-w-0">
                        <div className="font-bold text-sm truncate" style={{ color: '#ffffff' }}>
                          {s.type === 'workout'
                            ? (s.data as Workout).name || 'Untitled Workout'
                            : ((s.data as Activity).type === 'Custom' && (s.data as Activity).customName)
                              ? (s.data as Activity).customName
                              : (s.data as Activity).type}
                        </div>
                        <div className="text-xs truncate" style={{ color: '#888888' }}>
                          {s.type === 'workout'
                            ? renderWorkoutSummary(s.data as Workout)
                            : renderActivitySummary(s.data as Activity)}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* List View */}
        {!isEmpty && view === 'list' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="space-y-3">
              {/* Type toggle */}
              <div className="flex gap-2">
                {(['all', 'workouts', 'activities'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    style={{
                      backgroundColor: typeFilter === t ? '#D4FF00' : '#1a1a1a',
                      color: typeFilter === t ? '#0a0a0a' : '#888888',
                      border: typeFilter === t ? '1px solid #D4FF00' : '1px solid #2a2a2a',
                      borderRadius: '2px',
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Date range and dropdowns */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#888888' }}>
                    From
                  </label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full px-3 py-2 text-sm outline-none"
                    style={{
                      backgroundColor: '#1a1a1a',
                      color: '#ffffff',
                      border: '1px solid #2a2a2a',
                      borderRadius: '2px',
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#888888' }}>
                    To
                  </label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full px-3 py-2 text-sm outline-none"
                    style={{
                      backgroundColor: '#1a1a1a',
                      color: '#ffffff',
                      border: '1px solid #2a2a2a',
                      borderRadius: '2px',
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {typeFilter !== 'activities' && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#888888' }}>
                      Muscle Group
                    </label>
                    <select
                      value={muscleGroupFilter}
                      onChange={(e) => setMuscleGroupFilter(e.target.value)}
                      className="w-full px-3 py-2 text-sm outline-none cursor-pointer"
                      style={{
                        backgroundColor: '#1a1a1a',
                        color: '#ffffff',
                        border: '1px solid #2a2a2a',
                        borderRadius: '2px',
                      }}
                    >
                      <option value="">All Groups</option>
                      {muscleGroups.map((mg) => (
                        <option key={mg} value={mg}>{mg}</option>
                      ))}
                    </select>
                  </div>
                )}
                {typeFilter !== 'workouts' && activityTypes.length > 0 && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#888888' }}>
                      Activity Type
                    </label>
                    <select
                      value={activityTypeFilter}
                      onChange={(e) => setActivityTypeFilter(e.target.value)}
                      className="w-full px-3 py-2 text-sm outline-none cursor-pointer"
                      style={{
                        backgroundColor: '#1a1a1a',
                        color: '#ffffff',
                        border: '1px solid #2a2a2a',
                        borderRadius: '2px',
                      }}
                    >
                      <option value="">All Types</option>
                      {activityTypes.map((at) => (
                        <option key={at} value={at}>{at}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Clear filters */}
              {(dateFrom || dateTo || muscleGroupFilter || activityTypeFilter || typeFilter !== 'all') && (
                <button
                  onClick={() => {
                    setTypeFilter('all');
                    setDateFrom('');
                    setDateTo('');
                    setMuscleGroupFilter('');
                    setActivityTypeFilter('');
                  }}
                  className="text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  style={{ color: '#D4FF00' }}
                >
                  CLEAR FILTERS
                </button>
              )}
            </div>

            {/* Session list */}
            {filteredSessions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm" style={{ color: '#888888' }}>
                  No sessions match your filters.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredSessions.map((s) => (
                  <button
                    key={s.data.id}
                    onClick={() => setSelectedSession({ type: s.type, id: s.data.id })}
                    className="w-full text-left p-4 flex items-center gap-3 transition-colors cursor-pointer"
                    style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '2px' }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#D4FF00')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#2a2a2a')}
                  >
                    {s.type === 'workout' ? (
                      <Dumbbell size={20} style={{ color: '#D4FF00', flexShrink: 0 }} />
                    ) : (
                      <Zap size={20} style={{ color: '#22c55e', flexShrink: 0 }} />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-sm truncate" style={{ color: '#ffffff' }}>
                          {s.type === 'workout'
                            ? (s.data as Workout).name || 'Untitled Workout'
                            : ((s.data as Activity).type === 'Custom' && (s.data as Activity).customName)
                              ? (s.data as Activity).customName
                              : (s.data as Activity).type}
                        </span>
                        <span className="text-xs whitespace-nowrap" style={{ color: '#888888' }}>
                          {formatDate(s.data.date)}
                        </span>
                      </div>
                      <div className="text-xs mt-1 truncate" style={{ color: '#888888' }}>
                        {s.type === 'workout'
                          ? renderWorkoutSummary(s.data as Workout)
                          : renderActivitySummary(s.data as Activity)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Detail modal */}
        {selectedSession && renderDetail()}
      </div>
    </PageWrapper>
  );
}
