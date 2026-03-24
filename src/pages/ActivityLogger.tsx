import { useState, useEffect } from 'react';
import { Save, Check } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import { getActivities, saveActivities, getSettings } from '../utils/storage';
import { inputToKm } from '../utils/units';
import type { Activity, ActivityType, MoodRating, AppSettings } from '../types';
import { MOOD_EMOJIS } from '../types';
import { activityTypeConfigs } from '../data/activityTypes';

export default function ActivityLogger() {
  const [activityType, setActivityType] = useState<ActivityType | null>(null);
  const [customName, setCustomName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
  const [duration, setDuration] = useState<number>(0);
  const [distance, setDistance] = useState<number>(0);
  const [averagePace, setAveragePace] = useState('');
  const [rounds, setRounds] = useState<number>(0);
  const [roundDuration, setRoundDuration] = useState<number>(3);
  const [partnerNotes, setPartnerNotes] = useState('');
  const [workInterval, setWorkInterval] = useState<number>(30);
  const [restInterval, setRestInterval] = useState<number>(15);
  const [intensity, setIntensity] = useState<number>(5);
  const [calories, setCalories] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [mood, setMood] = useState<MoodRating | undefined>();
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState<AppSettings>();

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  const activeConfig = activityType ? activityTypeConfigs.find((c) => c.type === activityType) : undefined;
  const distanceUnit = settings?.distanceUnit ?? 'km';

  function resetForm() {
    setActivityType(null);
    setCustomName('');
    setDate(new Date().toISOString().split('T')[0]);
    setTime(new Date().toTimeString().slice(0, 5));
    setDuration(0);
    setDistance(0);
    setAveragePace('');
    setRounds(0);
    setRoundDuration(3);
    setPartnerNotes('');
    setWorkInterval(30);
    setRestInterval(15);
    setIntensity(5);
    setCalories(0);
    setNotes('');
    setMood(undefined);
  }

  function handleSave() {
    if (!activityType) return;
    const activity: Activity = {
      id: crypto.randomUUID(),
      type: activityType,
      customName: activityType === 'Custom' ? customName : undefined,
      date,
      time,
      duration,
      distance: activeConfig?.hasDistance ? inputToKm(distance, distanceUnit) : undefined,
      averagePace: activeConfig?.hasPace ? averagePace : undefined,
      rounds: activeConfig?.hasRounds || activeConfig?.hasIntervals ? rounds : undefined,
      roundDuration: activeConfig?.hasRounds ? roundDuration : undefined,
      partnerNotes: activeConfig?.hasRounds ? partnerNotes : undefined,
      workInterval: activeConfig?.hasIntervals ? workInterval : undefined,
      restInterval: activeConfig?.hasIntervals ? restInterval : undefined,
      intensity,
      calories: calories > 0 ? calories : undefined,
      notes,
      mood,
      createdAt: new Date().toISOString(),
    };

    const existing = getActivities();
    saveActivities([...existing, activity]);

    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      resetForm();
    }, 2000);
  }

  const inputClasses =
    'w-full bg-[#1a1a1a] border border-[#2a2a2a] text-white px-3 py-2 rounded-[2px] focus:outline-none focus:border-[#D4FF00] transition-colors';

  const labelClasses = 'block text-sm font-bold uppercase tracking-wider text-[#888888] mb-1';

  return (
    <PageWrapper>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-wider text-white">
            Activity Logger
          </h1>
          <p className="text-[#888888] mt-1">Log non-gym activities and training sessions.</p>
        </div>

        {/* Activity Type Selector */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#888888] mb-3">
            Activity Type
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {activityTypeConfigs.map((config) => {
              const Icon = config.icon;
              const isSelected = activityType === config.type;
              return (
                <button
                  key={config.type}
                  type="button"
                  onClick={() => setActivityType(config.type)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-[2px] border transition-colors ${
                    isSelected
                      ? 'bg-[#D4FF00] border-[#D4FF00] text-black'
                      : 'bg-[#1a1a1a] border-[#2a2a2a] text-[#888888] hover:border-[#D4FF00] hover:text-white'
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-xs font-bold uppercase tracking-wider leading-tight text-center">
                    {config.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Name */}
        {activityType === 'Custom' && (
          <div>
            <label className={labelClasses}>Custom Activity Name</label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Enter activity name..."
              className={inputClasses}
            />
          </div>
        )}

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClasses}>Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputClasses}
            />
          </div>
          <div>
            <label className={labelClasses}>Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className={inputClasses}
            />
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className={labelClasses}>Duration (minutes)</label>
          <input
            type="number"
            min={0}
            value={duration || ''}
            onChange={(e) => setDuration(Number(e.target.value))}
            placeholder="0"
            className={inputClasses}
          />
        </div>

        {/* Conditional: Distance & Pace */}
        {activeConfig?.hasDistance && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>
                Distance ({distanceUnit === 'miles' ? 'miles' : 'km'})
              </label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={distance || ''}
                onChange={(e) => setDistance(Number(e.target.value))}
                placeholder="0"
                className={inputClasses}
              />
            </div>
            {activeConfig?.hasPace && (
              <div>
                <label className={labelClasses}>Average Pace / Speed</label>
                <input
                  type="text"
                  value={averagePace}
                  onChange={(e) => setAveragePace(e.target.value)}
                  placeholder="e.g. 5:30 /km"
                  className={inputClasses}
                />
              </div>
            )}
          </div>
        )}

        {/* Conditional: Rounds (combat sports) */}
        {activeConfig?.hasRounds && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClasses}>Rounds</label>
                <input
                  type="number"
                  min={0}
                  value={rounds || ''}
                  onChange={(e) => setRounds(Number(e.target.value))}
                  placeholder="0"
                  className={inputClasses}
                />
              </div>
              <div>
                <label className={labelClasses}>Round Duration (mins)</label>
                <input
                  type="number"
                  min={0}
                  value={roundDuration || ''}
                  onChange={(e) => setRoundDuration(Number(e.target.value))}
                  placeholder="3"
                  className={inputClasses}
                />
              </div>
            </div>
            <div>
              <label className={labelClasses}>Partner / Sparring Notes</label>
              <input
                type="text"
                value={partnerNotes}
                onChange={(e) => setPartnerNotes(e.target.value)}
                placeholder="Training partner, techniques practised..."
                className={inputClasses}
              />
            </div>
          </div>
        )}

        {/* Conditional: HIIT Intervals */}
        {activeConfig?.hasIntervals && (
          <div className="space-y-4">
            <div>
              <label className={labelClasses}>Rounds</label>
              <input
                type="number"
                min={0}
                value={rounds || ''}
                onChange={(e) => setRounds(Number(e.target.value))}
                placeholder="0"
                className={inputClasses}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClasses}>Work Interval (secs)</label>
                <input
                  type="number"
                  min={0}
                  value={workInterval || ''}
                  onChange={(e) => setWorkInterval(Number(e.target.value))}
                  placeholder="30"
                  className={inputClasses}
                />
              </div>
              <div>
                <label className={labelClasses}>Rest Interval (secs)</label>
                <input
                  type="number"
                  min={0}
                  value={restInterval || ''}
                  onChange={(e) => setRestInterval(Number(e.target.value))}
                  placeholder="15"
                  className={inputClasses}
                />
              </div>
            </div>
          </div>
        )}

        {/* Intensity */}
        <div>
          <label className={labelClasses}>Intensity ({intensity}/10)</label>
          <input
            type="range"
            min={1}
            max={10}
            value={intensity}
            onChange={(e) => setIntensity(Number(e.target.value))}
            className="w-full accent-[#D4FF00] bg-[#1a1a1a] h-2 rounded-[2px] cursor-pointer"
          />
          <div className="flex justify-between text-xs text-[#888888] mt-1">
            <span>1</span>
            <span>5</span>
            <span>10</span>
          </div>
        </div>

        {/* Calories */}
        <div>
          <label className={labelClasses}>Calories Burnt (optional)</label>
          <input
            type="number"
            min={0}
            value={calories || ''}
            onChange={(e) => setCalories(Number(e.target.value))}
            placeholder="0"
            className={inputClasses}
          />
        </div>

        {/* Notes */}
        <div>
          <label className={labelClasses}>Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="How did the session go?"
            className={inputClasses + ' resize-none'}
          />
        </div>

        {/* Mood / Energy */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#888888] mb-3">
            Mood / Energy
          </h2>
          <div className="flex gap-2">
            {([1, 2, 3, 4, 5] as MoodRating[]).map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => setMood(rating)}
                className={`flex-1 py-3 text-2xl rounded-[2px] border transition-colors ${
                  mood === rating
                    ? 'bg-[#D4FF00] border-[#D4FF00]'
                    : 'bg-[#1a1a1a] border-[#2a2a2a] hover:border-[#D4FF00]'
                }`}
              >
                {MOOD_EMOJIS[rating]}
              </button>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <button
          type="button"
          onClick={handleSave}
          disabled={saved || !activityType}
          className={`w-full py-3 rounded-[2px] font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-2 transition-colors ${
            saved
              ? 'bg-green-600 text-white cursor-default'
              : !activityType
              ? 'bg-[#1a1a1a] border border-[#2a2a2a] text-[#555555] cursor-not-allowed'
              : 'bg-[#D4FF00] text-black hover:brightness-110 cursor-pointer'
          }`}
        >
          {saved ? (
            <>
              <Check size={18} />
              Activity Logged!
            </>
          ) : (
            <>
              <Save size={18} />
              Log Activity
            </>
          )}
        </button>
      </div>
    </PageWrapper>
  );
}
