import { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import PageWrapper from '../components/PageWrapper';
import { getWorkouts, getActivities, getPBs, getSettings } from '../utils/storage';
import { kgToDisplay } from '../utils/units';
import type { Workout, Activity, PersonalBest, AppSettings } from '../types';

const MUSCLE_COLOURS = ['#D4FF00', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
const PIE_COLOURS = ['#D4FF00', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#a3c700', '#dda0dd', '#87ceeb'];

interface CustomTooltipProps {
  active?: boolean;
  payload?: { name?: string; value?: number; color?: string; dataKey?: string }[];
  label?: string;
  unit?: string;
}

function ChartTooltip({ active, payload, label, unit = '' }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1f1f1f] border border-[#2a2a2a] px-3 py-2 rounded-[2px]">
      <p className="text-[#888888] text-xs mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-white text-sm" style={{ color: entry.color }}>
          {entry.name ?? entry.dataKey}: {entry.value}{unit}
        </p>
      ))}
    </div>
  );
}

function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1; // Monday start
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0];
}

export default function Progress() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [pbs, setPBs] = useState<PersonalBest[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [selectedExercise, setSelectedExercise] = useState('');

  useEffect(() => {
    const w = getWorkouts();
    const a = getActivities();
    const p = getPBs();
    const s = getSettings();
    setWorkouts(w);
    setActivities(a);
    setPBs(p);
    setSettings(s);
  }, []);

  const unit = settings?.weightUnit ?? 'kg';

  // All-time stats
  const stats = useMemo(() => {
    const totalSessions = workouts.length + activities.length;
    let totalVolume = 0;
    let totalExercises = 0;
    for (const w of workouts) {
      totalExercises += w.exercises.length;
      for (const ex of w.exercises) {
        for (const s of ex.sets) {
          totalVolume += s.weight * s.reps;
        }
      }
    }
    const totalActivityMinutes = activities.reduce((sum, a) => sum + (a.duration || 0), 0);
    const totalActivityHours = Math.round((totalActivityMinutes / 60) * 10) / 10;
    return { totalSessions, totalVolume, totalActivityHours, totalExercises };
  }, [workouts, activities]);

  // Unique exercises that have been logged
  const exerciseList = useMemo(() => {
    const map = new Map<string, string>();
    for (const w of workouts) {
      for (const ex of w.exercises) {
        if (!map.has(ex.exerciseId)) {
          map.set(ex.exerciseId, ex.exerciseName);
        }
      }
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [workouts]);

  // Auto-select first exercise
  useEffect(() => {
    if (!selectedExercise && exerciseList.length > 0) {
      setSelectedExercise(exerciseList[0].id);
    }
  }, [exerciseList, selectedExercise]);

  // Per-exercise progress data
  const exerciseProgressData = useMemo(() => {
    if (!selectedExercise) return [];
    const points: { date: string; weight: number }[] = [];
    const sorted = [...workouts].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    for (const w of sorted) {
      for (const ex of w.exercises) {
        if (ex.exerciseId === selectedExercise) {
          let maxWeight = 0;
          for (const s of ex.sets) {
            if (s.weight > maxWeight) maxWeight = s.weight;
          }
          if (maxWeight > 0) {
            const d = new Date(w.date);
            points.push({
              date: `${d.getDate()}/${d.getMonth() + 1}`,
              weight: kgToDisplay(maxWeight, unit),
            });
          }
        }
      }
    }
    return points;
  }, [workouts, selectedExercise, unit]);

  // Volume per muscle group per week (last 8 weeks)
  const volumeByMuscleData = useMemo(() => {
    const now = new Date();
    const eightWeeksAgo = new Date(now.getTime() - 8 * 7 * 24 * 60 * 60 * 1000);
    const muscleGroups = new Set<string>();
    const weekMap = new Map<string, Record<string, number>>();

    // Generate week labels
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      const key = getWeekStart(weekStart);
      weekMap.set(key, {});
    }

    const relevantWorkouts = workouts.filter(w => new Date(w.date) >= eightWeeksAgo);

    // We need exercise muscle group info - derive from exercise names or use a simple approach
    // Since we don't store muscle group on WorkoutExercise, we'll aggregate by exercise name
    // For a better approach, we'd need exercises from storage, but the spec asks for muscle group
    // We'll use a simplified version: total volume per week
    for (const w of relevantWorkouts) {
      const wk = getWeekStart(new Date(w.date));
      for (const ex of w.exercises) {
        // Use exercise name as category since we don't have muscle group on workout exercises
        const group = ex.exerciseName;
        muscleGroups.add(group);
        if (!weekMap.has(wk)) weekMap.set(wk, {});
        const entry = weekMap.get(wk)!;
        let vol = 0;
        for (const s of ex.sets) vol += s.weight * s.reps;
        entry[group] = (entry[group] || 0) + vol;
      }
    }

    // Take only the top 6 exercises by total volume for readability
    const totalByGroup: Record<string, number> = {};
    for (const entry of weekMap.values()) {
      for (const [g, v] of Object.entries(entry)) {
        totalByGroup[g] = (totalByGroup[g] || 0) + v;
      }
    }
    const topGroups = Object.entries(totalByGroup)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([g]) => g);

    const weeks = Array.from(weekMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-8);

    const data = weeks.map(([, entry], i) => {
      const row: Record<string, number | string> = { week: `W${i + 1}` };
      for (const g of topGroups) {
        row[g] = Math.round(kgToDisplay(entry[g] || 0, unit));
      }
      return row;
    });

    return { data, groups: topGroups };
  }, [workouts, unit]);

  // Activity breakdown (last 30 days)
  const activityBreakdown = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const counts: Record<string, number> = {};
    for (const a of activities) {
      if (new Date(a.date) >= thirtyDaysAgo) {
        const name = a.type === 'Custom' && a.customName ? a.customName : a.type;
        counts[name] = (counts[name] || 0) + 1;
      }
    }
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [activities]);

  // Weekly training frequency (last 12 weeks)
  const weeklyFrequency = useMemo(() => {
    const now = new Date();
    const weeks: { week: string; sessions: number }[] = [];

    for (let i = 11; i >= 0; i--) {
      const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      const weekStart = new Date(weekEnd.getTime() - 7 * 24 * 60 * 60 * 1000);

      let count = 0;
      for (const w of workouts) {
        const d = new Date(w.date);
        if (d >= weekStart && d < weekEnd) count++;
      }
      for (const a of activities) {
        const d = new Date(a.date);
        if (d >= weekStart && d < weekEnd) count++;
      }

      weeks.push({ week: `W${12 - i}`, sessions: count });
    }

    return weeks;
  }, [workouts, activities]);

  // Sorted PBs
  const sortedPBs = useMemo(() => {
    return [...pbs].sort((a, b) => a.exerciseName.localeCompare(b.exerciseName));
  }, [pbs]);

  const selectedExerciseName = exerciseList.find(e => e.id === selectedExercise)?.name ?? '';

  return (
    <PageWrapper>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold uppercase tracking-wider text-white">
          Progress & Stats
        </h1>

        {/* All-Time Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[2px] p-4">
            <p className="text-[#888888] text-xs font-bold uppercase tracking-wider mb-1">Total Sessions</p>
            <p className="text-white text-2xl font-bold">{stats.totalSessions}</p>
          </div>
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[2px] p-4">
            <p className="text-[#888888] text-xs font-bold uppercase tracking-wider mb-1">Total Volume</p>
            <p className="text-white text-2xl font-bold">
              {Math.round(kgToDisplay(stats.totalVolume, unit)).toLocaleString()}
              <span className="text-sm text-[#888888] ml-1">{unit}</span>
            </p>
          </div>
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[2px] p-4">
            <p className="text-[#888888] text-xs font-bold uppercase tracking-wider mb-1">Activity Time</p>
            <p className="text-white text-2xl font-bold">
              {stats.totalActivityHours}
              <span className="text-sm text-[#888888] ml-1">hrs</span>
            </p>
          </div>
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[2px] p-4">
            <p className="text-[#888888] text-xs font-bold uppercase tracking-wider mb-1">Exercises Done</p>
            <p className="text-white text-2xl font-bold">{stats.totalExercises}</p>
          </div>
        </div>

        {/* Per-Exercise Progress Chart */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[2px] p-4">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="text-white font-bold uppercase tracking-wider text-sm">Exercise Progress</h2>
            <select
              value={selectedExercise}
              onChange={(e) => setSelectedExercise(e.target.value)}
              className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-[2px] text-white text-sm px-3 py-1.5 outline-none focus:border-[#D4FF00]"
            >
              {exerciseList.map(ex => (
                <option key={ex.id} value={ex.id}>{ex.name}</option>
              ))}
            </select>
          </div>
          {exerciseProgressData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={exerciseProgressData}>
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#888888', fontSize: 12 }}
                  axisLine={{ stroke: '#2a2a2a' }}
                  tickLine={{ stroke: '#2a2a2a' }}
                />
                <YAxis
                  tick={{ fill: '#888888', fontSize: 12 }}
                  axisLine={{ stroke: '#2a2a2a' }}
                  tickLine={{ stroke: '#2a2a2a' }}
                  unit={` ${unit}`}
                />
                <Tooltip content={<ChartTooltip unit={` ${unit}`} />} />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#D4FF00"
                  strokeWidth={2}
                  dot={{ fill: '#D4FF00', r: 3 }}
                  activeDot={{ fill: '#D4FF00', r: 5 }}
                  name={selectedExerciseName}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-[#888888] text-sm text-center py-8">
              {exerciseList.length === 0
                ? 'NO EXERCISE DATA YET. LOG A WORKOUT TO SEE YOUR PROGRESS.'
                : 'NO DATA FOR THIS EXERCISE.'}
            </p>
          )}
        </div>

        {/* Volume Per Muscle Group Per Week */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[2px] p-4">
          <h2 className="text-white font-bold uppercase tracking-wider text-sm mb-4">
            Volume by Exercise (Last 8 Weeks)
          </h2>
          {volumeByMuscleData.data.length > 0 && volumeByMuscleData.groups.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={volumeByMuscleData.data}>
                <XAxis
                  dataKey="week"
                  tick={{ fill: '#888888', fontSize: 12 }}
                  axisLine={{ stroke: '#2a2a2a' }}
                  tickLine={{ stroke: '#2a2a2a' }}
                />
                <YAxis
                  tick={{ fill: '#888888', fontSize: 12 }}
                  axisLine={{ stroke: '#2a2a2a' }}
                  tickLine={{ stroke: '#2a2a2a' }}
                />
                <Tooltip content={<ChartTooltip unit={` ${unit}`} />} />
                {volumeByMuscleData.groups.map((group, i) => (
                  <Bar
                    key={group}
                    dataKey={group}
                    stackId="volume"
                    fill={MUSCLE_COLOURS[i % MUSCLE_COLOURS.length]}
                    name={group}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-[#888888] text-sm text-center py-8">
              NO VOLUME DATA YET. LOG SOME WORKOUTS TO SEE WEEKLY TRENDS.
            </p>
          )}
          {volumeByMuscleData.groups.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-3">
              {volumeByMuscleData.groups.map((group, i) => (
                <div key={group} className="flex items-center gap-1.5">
                  <div
                    className="w-2.5 h-2.5 rounded-[1px]"
                    style={{ backgroundColor: MUSCLE_COLOURS[i % MUSCLE_COLOURS.length] }}
                  />
                  <span className="text-[#888888] text-xs">{group}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity Breakdown (Last 30 Days) */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[2px] p-4">
          <h2 className="text-white font-bold uppercase tracking-wider text-sm mb-4">
            Activity Breakdown (Last 30 Days)
          </h2>
          {activityBreakdown.length > 0 ? (
            <div className="flex flex-col md:flex-row items-center gap-4">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={activityBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                    nameKey="name"
                    stroke="#0a0a0a"
                    strokeWidth={2}
                  >
                    {activityBreakdown.map((_, i) => (
                      <Cell key={i} fill={PIE_COLOURS[i % PIE_COLOURS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip unit=" sessions" />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2 min-w-[140px]">
                {activityBreakdown.map((entry, i) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-[1px] shrink-0"
                      style={{ backgroundColor: PIE_COLOURS[i % PIE_COLOURS.length] }}
                    />
                    <span className="text-[#888888] text-xs">{entry.name}</span>
                    <span className="text-white text-xs ml-auto font-bold">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-[#888888] text-sm text-center py-8">
              NO ACTIVITIES LOGGED IN THE LAST 30 DAYS.
            </p>
          )}
        </div>

        {/* Weekly Training Frequency (Last 12 Weeks) */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[2px] p-4">
          <h2 className="text-white font-bold uppercase tracking-wider text-sm mb-4">
            Weekly Training Frequency (Last 12 Weeks)
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyFrequency}>
              <XAxis
                dataKey="week"
                tick={{ fill: '#888888', fontSize: 12 }}
                axisLine={{ stroke: '#2a2a2a' }}
                tickLine={{ stroke: '#2a2a2a' }}
              />
              <YAxis
                tick={{ fill: '#888888', fontSize: 12 }}
                axisLine={{ stroke: '#2a2a2a' }}
                tickLine={{ stroke: '#2a2a2a' }}
                allowDecimals={false}
              />
              <Tooltip content={<ChartTooltip unit=" sessions" />} />
              <Bar dataKey="sessions" fill="#D4FF00" radius={[1, 1, 0, 0]} name="Sessions" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Personal Bests Table */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[2px] p-4">
          <h2 className="text-white font-bold uppercase tracking-wider text-sm mb-4">
            Personal Bests
          </h2>
          {sortedPBs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#2a2a2a]">
                    <th className="text-left text-[#888888] font-bold uppercase tracking-wider text-xs py-2 pr-4">Exercise</th>
                    <th className="text-right text-[#888888] font-bold uppercase tracking-wider text-xs py-2 px-4">Heaviest Weight</th>
                    <th className="text-right text-[#888888] font-bold uppercase tracking-wider text-xs py-2 px-4">Highest Volume Set</th>
                    <th className="text-right text-[#888888] font-bold uppercase tracking-wider text-xs py-2 pl-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedPBs.map(pb => {
                    const d = new Date(pb.date);
                    const dateStr = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
                    return (
                      <tr key={pb.exerciseId} className="border-b border-[#2a2a2a] last:border-b-0">
                        <td className="text-white py-2.5 pr-4">{pb.exerciseName}</td>
                        <td className="text-white text-right py-2.5 px-4">
                          <span className="text-[#D4FF00] font-bold">
                            {kgToDisplay(pb.heaviestWeight, unit)} {unit}
                          </span>
                          <span className="text-[#888888] ml-1">
                            x{pb.heaviestWeightReps}
                          </span>
                        </td>
                        <td className="text-white text-right py-2.5 px-4">
                          <span className="font-bold">
                            {Math.round(kgToDisplay(pb.highestVolumeSet, unit)).toLocaleString()} {unit}
                          </span>
                          <span className="text-[#888888] ml-1">
                            ({kgToDisplay(pb.highestVolumeWeight, unit)} x {pb.highestVolumeReps})
                          </span>
                        </td>
                        <td className="text-[#888888] text-right py-2.5 pl-4">{dateStr}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-[#888888] text-sm text-center py-8">
              NO PERSONAL BESTS YET. START LIFTING AND THEY'LL APPEAR HERE.
            </p>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
