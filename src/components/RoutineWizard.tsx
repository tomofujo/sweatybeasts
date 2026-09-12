import { useState, useMemo } from 'react';
import { X, ChevronLeft, ChevronRight, Sparkles, Check, RefreshCw } from 'lucide-react';
import type { Exercise } from '../types';
import {
  generateRoutines,
  suggestPlanName,
  GOAL_LABELS,
  LEVEL_LABELS,
  EQUIPMENT_LABELS,
  LENGTH_LABELS,
  type WizardAnswers,
  type Goal,
  type Level,
  type EquipmentAccess,
  type SessionLength,
  type FocusArea,
  type GeneratedRoutine,
} from '../utils/routineGenerator';

const FOCUS_OPTIONS: FocusArea[] = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Glutes', 'Core', 'Cardio'];

const STEPS = ['Goal', 'Days', 'Focus', 'Kit', 'Level', 'Plan'] as const;

interface Props {
  library: Exercise[];
  onClose: () => void;
  onCreate: (planName: string, routines: GeneratedRoutine[]) => void;
}

function OptionCard({ title, blurb, selected, onClick }: {
  title: string; blurb: string; selected: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded-[2px] border transition-colors ${
        selected
          ? 'bg-[#D4FF00]/10 border-[#D4FF00]'
          : 'bg-[#0a0a0a] border-[#2a2a2a] hover:border-[#555555]'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className={`text-sm font-bold uppercase tracking-wider ${selected ? 'text-[#D4FF00]' : 'text-[#ffffff]'}`}>
            {title}
          </p>
          <p className="text-xs text-[#888888] mt-0.5">{blurb}</p>
        </div>
        {selected && <Check size={16} className="text-[#D4FF00] shrink-0" />}
      </div>
    </button>
  );
}

export default function RoutineWizard({ library, onClose, onCreate }: Props) {
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<Goal>('muscle');
  const [daysPerWeek, setDaysPerWeek] = useState(3);
  const [focusAreas, setFocusAreas] = useState<FocusArea[]>([]);
  const [equipment, setEquipment] = useState<EquipmentAccess>('gym');
  const [level, setLevel] = useState<Level>('intermediate');
  const [sessionLength, setSessionLength] = useState<SessionLength>('medium');
  const [planName, setPlanName] = useState('');
  const [reshuffle, setReshuffle] = useState(0);

  const answers: WizardAnswers = { goal, daysPerWeek, focusAreas, equipment, level, sessionLength };

  const preview = useMemo(
    () => generateRoutines(answers, library),
    // reshuffle is a manual regenerate trigger
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [goal, daysPerWeek, focusAreas, equipment, level, sessionLength, library, reshuffle]
  );

  const isLast = step === STEPS.length - 1;

  function toggleFocus(area: FocusArea) {
    setFocusAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : prev.length >= 3 ? prev : [...prev, area]
    );
  }

  function handleCreate() {
    onCreate(planName.trim() || suggestPlanName(answers), preview);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative w-full max-w-lg mx-4 mt-6 sm:mt-16 mb-6 bg-[#1a1a1a] border border-[#2a2a2a] rounded-[2px] max-h-[88vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a2a] shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#D4FF00]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#ffffff]">Routine Builder</h2>
          </div>
          <button onClick={onClose} className="text-[#888888] hover:text-[#ffffff] p-1"><X size={18} /></button>
        </div>

        {/* Step indicator */}
        <div className="px-4 pt-3 shrink-0">
          <div className="flex items-center gap-1">
            {STEPS.map((label, i) => (
              <div key={label} className="flex-1">
                <div
                  className="h-1 rounded-full transition-colors"
                  style={{ backgroundColor: i <= step ? '#D4FF00' : '#2a2a2a' }}
                />
              </div>
            ))}
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#888888] mt-2">
            Step {step + 1} of {STEPS.length} — {STEPS[step]}
          </p>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {step === 0 && (
            <>
              <p className="text-sm text-[#ffffff] font-bold mb-3">What are you training for?</p>
              {(Object.keys(GOAL_LABELS) as Goal[]).map((g) => (
                <OptionCard key={g} title={GOAL_LABELS[g].title} blurb={GOAL_LABELS[g].blurb} selected={goal === g} onClick={() => setGoal(g)} />
              ))}
            </>
          )}

          {step === 1 && (
            <>
              <p className="text-sm text-[#ffffff] font-bold mb-3">How many days a week can you train?</p>
              <div className="grid grid-cols-5 gap-2">
                {[2, 3, 4, 5, 6].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDaysPerWeek(d)}
                    className={`py-4 rounded-[2px] border text-lg font-bold transition-colors ${
                      daysPerWeek === d ? 'bg-[#D4FF00] text-[#0a0a0a] border-[#D4FF00]' : 'bg-[#0a0a0a] text-[#888888] border-[#2a2a2a] hover:border-[#555555]'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
              <p className="text-xs text-[#888888] pt-1">
                {daysPerWeek === 2 && 'Two full-body sessions — the most efficient way to cover everything.'}
                {daysPerWeek === 3 && 'Push / Pull / Legs — a classic three-way split.'}
                {daysPerWeek === 4 && 'Upper / Lower twice over — great balance of volume and recovery.'}
                {daysPerWeek === 5 && 'Push / Pull / Legs plus an upper and lower day.'}
                {daysPerWeek === 6 && 'Push / Pull / Legs run twice — high volume, plan your recovery.'}
              </p>

              <p className="text-sm text-[#ffffff] font-bold pt-4 mb-2">How long per session?</p>
              {(Object.keys(LENGTH_LABELS) as SessionLength[]).map((l) => (
                <OptionCard key={l} title={LENGTH_LABELS[l].title} blurb={LENGTH_LABELS[l].blurb} selected={sessionLength === l} onClick={() => setSessionLength(l)} />
              ))}
            </>
          )}

          {step === 2 && (
            <>
              <p className="text-sm text-[#ffffff] font-bold">Anything you want to bring up?</p>
              <p className="text-xs text-[#888888] mb-3">Pick up to 3 — these get extra volume. Skip if you want it even.</p>
              <div className="flex flex-wrap gap-2">
                {FOCUS_OPTIONS.map((area) => {
                  const on = focusAreas.includes(area);
                  const full = focusAreas.length >= 3 && !on;
                  return (
                    <button
                      key={area}
                      onClick={() => toggleFocus(area)}
                      disabled={full}
                      className={`px-4 py-2 rounded-[2px] border text-xs font-bold uppercase tracking-wider transition-colors ${
                        on
                          ? 'bg-[#D4FF00] text-[#0a0a0a] border-[#D4FF00]'
                          : full
                            ? 'bg-[#0a0a0a] text-[#444444] border-[#1f1f1f] cursor-not-allowed'
                            : 'bg-[#0a0a0a] text-[#888888] border-[#2a2a2a] hover:border-[#555555]'
                      }`}
                    >
                      {area}
                    </button>
                  );
                })}
              </div>
              {focusAreas.length > 0 && (
                <button onClick={() => setFocusAreas([])} className="text-[10px] font-bold uppercase tracking-wider text-[#888888] hover:text-[#ffffff] pt-2">
                  Clear all
                </button>
              )}
            </>
          )}

          {step === 3 && (
            <>
              <p className="text-sm text-[#ffffff] font-bold mb-3">What have you got access to?</p>
              {(Object.keys(EQUIPMENT_LABELS) as EquipmentAccess[]).map((e) => (
                <OptionCard key={e} title={EQUIPMENT_LABELS[e].title} blurb={EQUIPMENT_LABELS[e].blurb} selected={equipment === e} onClick={() => setEquipment(e)} />
              ))}
            </>
          )}

          {step === 4 && (
            <>
              <p className="text-sm text-[#ffffff] font-bold mb-3">How long have you been training?</p>
              {(Object.keys(LEVEL_LABELS) as Level[]).map((l) => (
                <OptionCard key={l} title={LEVEL_LABELS[l].title} blurb={LEVEL_LABELS[l].blurb} selected={level === l} onClick={() => setLevel(l)} />
              ))}
            </>
          )}

          {step === 5 && (
            <>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#888888] mb-1.5">Plan name</label>
                <input
                  type="text"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  placeholder={suggestPlanName(answers)}
                  className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-[#ffffff] placeholder-[#555555] px-4 py-2.5 rounded-[2px] text-sm focus:outline-none focus:border-[#D4FF00] transition-colors"
                />
                <p className="text-[10px] text-[#888888] mt-1.5">
                  Saved as a group with {preview.length} {preview.length === 1 ? 'routine' : 'routines'} inside.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <p className="text-xs font-bold uppercase tracking-wider text-[#888888]">Your plan</p>
                <button
                  onClick={() => setReshuffle((n) => n + 1)}
                  className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#D4FF00] hover:brightness-110"
                >
                  <RefreshCw size={12} /> Shuffle
                </button>
              </div>

              {preview.map((routine) => (
                <div key={routine.name} className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-[2px] p-3">
                  <p className="text-sm font-bold uppercase tracking-wider text-[#ffffff] mb-2">{routine.name}</p>
                  <div className="space-y-1">
                    {routine.exercises.map((ex, i) => (
                      <div key={`${ex.exerciseId}-${i}`} className="flex items-center justify-between gap-3 text-xs">
                        <span className="text-[#cccccc] truncate">{ex.exerciseName}</span>
                        <span className="text-[#888888] font-mono shrink-0">{ex.targetSets}×{ex.targetReps}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-4 py-3 border-t border-[#2a2a2a] shrink-0">
          {step > 0 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="flex items-center gap-1 px-4 py-2.5 rounded-[2px] font-bold uppercase tracking-wider text-xs text-[#888888] border border-[#2a2a2a] hover:text-[#ffffff] hover:border-[#888888] transition-colors"
            >
              <ChevronLeft size={14} /> Back
            </button>
          )}
          <div className="flex-1" />
          {isLast ? (
            <button
              onClick={handleCreate}
              disabled={preview.length === 0}
              className="flex items-center gap-2 bg-[#D4FF00] text-[#0a0a0a] px-5 py-2.5 rounded-[2px] font-bold uppercase tracking-wider text-xs hover:brightness-110 transition-all disabled:opacity-40"
            >
              <Check size={14} /> Create Plan
            </button>
          ) : (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="flex items-center gap-1 bg-[#D4FF00] text-[#0a0a0a] px-5 py-2.5 rounded-[2px] font-bold uppercase tracking-wider text-xs hover:brightness-110 transition-all"
            >
              Next <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
