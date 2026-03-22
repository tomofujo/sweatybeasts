import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell, Zap, Flame, Trophy } from 'lucide-react';
import { getWorkouts, getActivities, getSettings } from '../utils/storage';
import type { Workout, Activity, AppSettings } from '../types';
import { kgToDisplay } from '../utils/units';
import PageWrapper from '../components/PageWrapper';

type FeedEntry = {
  date: string;
  type: 'workout' | 'activity';
  name: string;
  summary: string;
};

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? 6 : day - 1;
  date.setDate(date.getDate() - diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function isInCurrentWeek(dateStr: string): boolean {
  const monday = getMonday(new Date());
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  const d = new Date(dateStr);
  return d >= monday && d <= sunday;
}

function calcStreak(workouts: Workout[], activities: Activity[]): number {
  const sessionDates = new Set<string>();
  workouts.forEach((w) => sessionDates.add(w.date));
  activities.forEach((a) => sessionDates.add(a.date));

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const check = new Date(today);

  // If today has no session, start checking from yesterday
  if (!sessionDates.has(toDateStr(check))) {
    check.setDate(check.getDate() - 1);
  }

  while (sessionDates.has(toDateStr(check))) {
    streak++;
    check.setDate(check.getDate() - 1);
  }

  return streak;
}

function calcWeeklyVolume(workouts: Workout[]): number {
  return workouts
    .filter((w) => isInCurrentWeek(w.date))
    .reduce((total, w) => {
      return (
        total +
        w.exercises.reduce((exTotal, ex) => {
          return (
            exTotal +
            ex.sets.reduce((setTotal, s) => setTotal + s.weight * s.reps, 0)
          );
        }, 0)
      );
    }, 0);
}

function calcWeeklyWorkouts(workouts: Workout[], activities: Activity[]): number {
  return (
    workouts.filter((w) => isInCurrentWeek(w.date)).length +
    activities.filter((a) => isInCurrentWeek(a.date)).length
  );
}

function buildFeed(workouts: Workout[], activities: Activity[]): FeedEntry[] {
  const entries: FeedEntry[] = [];

  workouts.forEach((w) => {
    const totalSets = w.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
    entries.push({
      date: w.date,
      type: 'workout',
      name: w.name || 'Workout',
      summary: `${w.exercises.length} exercise${w.exercises.length !== 1 ? 's' : ''}, ${totalSets} set${totalSets !== 1 ? 's' : ''}`,
    });
  });

  activities.forEach((a) => {
    const name = a.type === 'Custom' && a.customName ? a.customName : a.type;
    const parts: string[] = [];
    if (a.duration) parts.push(`${a.duration} min`);
    parts.push(name);
    entries.push({
      date: a.date,
      type: 'activity',
      name,
      summary: parts.join(' '),
    });
  });

  entries.sort((a, b) => b.date.localeCompare(a.date));
  return entries.slice(0, 5);
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const target = new Date(d);
  target.setHours(0, 0, 0, 0);

  if (target.getTime() === today.getTime()) return 'Today';
  if (target.getTime() === yesterday.getTime()) return 'Yesterday';

  return d.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

export default function Dashboard() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    setWorkouts(getWorkouts());
    setActivities(getActivities());
    setSettings(getSettings());
  }, []);

  if (!settings) return null;

  const weeklyWorkouts = calcWeeklyWorkouts(workouts, activities);
  const weeklyVolume = calcWeeklyVolume(workouts);
  const streak = calcStreak(workouts, activities);
  const feed = buildFeed(workouts, activities);

  const displayVolume = Math.round(kgToDisplay(weeklyVolume, settings.weightUnit));

  return (
    <PageWrapper>
      <div className="space-y-8 pb-8">
        {/* Motivational header */}
        <div className="pt-2 text-center">
          <h1 className="text-3xl font-bold uppercase tracking-[0.15em] text-[#D4FF00] sm:text-4xl">
            What's your excuse?
          </h1>
          <p className="mt-2 text-sm font-medium uppercase tracking-widest text-[#888888]">
            Results don't sleep
          </p>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center gap-1 rounded-[2px] bg-[#1a1a1a] p-4 border border-[#2a2a2a]">
            <Zap size={18} className="text-[#888888] mb-1" />
            <span className="text-3xl font-bold text-[#D4FF00]">
              {weeklyWorkouts}
            </span>
            <span className="text-[11px] font-medium uppercase tracking-widest text-[#888888]">
              This week
            </span>
          </div>

          <div className="flex flex-col items-center gap-1 rounded-[2px] bg-[#1a1a1a] p-4 border border-[#2a2a2a]">
            <Dumbbell size={18} className="text-[#888888] mb-1" />
            <span className="text-3xl font-bold text-[#D4FF00]">
              {displayVolume.toLocaleString()}
            </span>
            <span className="text-[11px] font-medium uppercase tracking-widest text-[#888888]">
              Volume ({settings.weightUnit})
            </span>
          </div>

          <div className="flex flex-col items-center gap-1 rounded-[2px] bg-[#1a1a1a] p-4 border border-[#2a2a2a]">
            <Flame size={18} className="text-[#888888] mb-1" />
            <span className="text-3xl font-bold text-[#D4FF00]">
              {streak}
            </span>
            <span className="text-[11px] font-medium uppercase tracking-widest text-[#888888]">
              Day streak
            </span>
          </div>
        </div>

        {/* Quick-start buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            to="/workout"
            className="flex items-center justify-center gap-2 rounded-[2px] bg-[#D4FF00] py-4 text-sm font-bold uppercase tracking-widest text-[#0a0a0a] transition-opacity hover:opacity-90 active:opacity-80"
          >
            <Dumbbell size={18} />
            Log workout
          </Link>
          <Link
            to="/activity"
            className="flex items-center justify-center gap-2 rounded-[2px] bg-[#D4FF00] py-4 text-sm font-bold uppercase tracking-widest text-[#0a0a0a] transition-opacity hover:opacity-90 active:opacity-80"
          >
            <Zap size={18} />
            Log activity
          </Link>
        </div>

        {/* Recent activity feed */}
        <div>
          <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#888888]">
            Recent sessions
          </h2>

          {feed.length === 0 ? (
            <div className="rounded-[2px] border border-[#2a2a2a] bg-[#1a1a1a] p-8 text-center">
              <Trophy size={32} className="mx-auto mb-3 text-[#888888]" />
              <p className="text-sm font-bold uppercase tracking-widest text-[#888888]">
                No sessions logged yet.
                <br />
                Time to get to work.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {feed.map((entry, i) => (
                <div
                  key={`${entry.type}-${entry.date}-${i}`}
                  className="flex items-center gap-3 rounded-[2px] border border-[#2a2a2a] bg-[#1a1a1a] px-4 py-3"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[2px] bg-[#1f1f1f]">
                    {entry.type === 'workout' ? (
                      <Dumbbell size={16} className="text-[#D4FF00]" />
                    ) : (
                      <Zap size={16} className="text-[#D4FF00]" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold uppercase tracking-wide text-white">
                      {entry.name}
                    </p>
                    <p className="text-xs text-[#888888]">{entry.summary}</p>
                  </div>
                  <span className="shrink-0 text-[11px] font-medium uppercase tracking-wide text-[#888888]">
                    {formatDate(entry.date)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
