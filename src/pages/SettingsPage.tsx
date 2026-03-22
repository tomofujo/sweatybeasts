import { useState, useEffect } from 'react';
import { Save, Trash2, AlertTriangle } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import { getSettings, saveSettings, clearAllData } from '../utils/storage';
import type { AppSettings } from '../types';
import { DEFAULT_SETTINGS } from '../types';

export default function SettingsPage() {
  const [settings, setSettingsState] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearConfirmText, setClearConfirmText] = useState('');
  const [showSecondConfirm, setShowSecondConfirm] = useState(false);
  const [saved, setSaved] = useState(false);
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    setSettingsState(getSettings());
  }, []);

  function updateSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    const updated = { ...settings, [key]: value };
    setSettingsState(updated);
    saveSettings(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  function handleClearData() {
    if (clearConfirmText.trim().toLowerCase() !== 'delete') return;
    clearAllData();
    setShowSecondConfirm(false);
    setShowClearModal(false);
    setClearConfirmText('');
    setSettingsState(DEFAULT_SETTINGS);
    saveSettings(DEFAULT_SETTINGS);
    setCleared(true);
    setTimeout(() => setCleared(false), 3000);
  }

  function handleCloseModal() {
    setShowClearModal(false);
    setShowSecondConfirm(false);
    setClearConfirmText('');
  }

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold uppercase tracking-wider text-[#ffffff]">Settings</h1>
          {saved && (
            <div className="flex items-center gap-1.5 text-[#D4FF00] text-sm font-bold uppercase tracking-wider animate-pulse">
              <Save size={14} />
              SAVED
            </div>
          )}
        </div>

        {cleared && (
          <div className="bg-[#D4FF00]/10 border border-[#D4FF00]/30 rounded-[2px] p-3 text-[#D4FF00] text-sm font-bold uppercase tracking-wider text-center">
            All data cleared successfully
          </div>
        )}

        {/* Units */}
        <section className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[2px] p-4 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#ffffff]">Units</h2>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#888888] mb-2 block">
                Weight Unit
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => updateSetting('weightUnit', 'kg')}
                  className={`flex-1 py-2 px-4 text-sm font-bold uppercase tracking-wider rounded-[2px] transition-colors ${
                    settings.weightUnit === 'kg'
                      ? 'bg-[#D4FF00] text-black'
                      : 'bg-[#1f1f1f] text-[#888888] border border-[#2a2a2a] hover:text-[#ffffff]'
                  }`}
                >
                  KG
                </button>
                <button
                  onClick={() => updateSetting('weightUnit', 'lbs')}
                  className={`flex-1 py-2 px-4 text-sm font-bold uppercase tracking-wider rounded-[2px] transition-colors ${
                    settings.weightUnit === 'lbs'
                      ? 'bg-[#D4FF00] text-black'
                      : 'bg-[#1f1f1f] text-[#888888] border border-[#2a2a2a] hover:text-[#ffffff]'
                  }`}
                >
                  LBS
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#888888] mb-2 block">
                Distance Unit
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => updateSetting('distanceUnit', 'km')}
                  className={`flex-1 py-2 px-4 text-sm font-bold uppercase tracking-wider rounded-[2px] transition-colors ${
                    settings.distanceUnit === 'km'
                      ? 'bg-[#D4FF00] text-black'
                      : 'bg-[#1f1f1f] text-[#888888] border border-[#2a2a2a] hover:text-[#ffffff]'
                  }`}
                >
                  KM
                </button>
                <button
                  onClick={() => updateSetting('distanceUnit', 'miles')}
                  className={`flex-1 py-2 px-4 text-sm font-bold uppercase tracking-wider rounded-[2px] transition-colors ${
                    settings.distanceUnit === 'miles'
                      ? 'bg-[#D4FF00] text-black'
                      : 'bg-[#1f1f1f] text-[#888888] border border-[#2a2a2a] hover:text-[#ffffff]'
                  }`}
                >
                  MILES
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Preferences */}
        <section className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[2px] p-4 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#ffffff]">Preferences</h2>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#888888] mb-2 block">
              First Day of Week
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => updateSetting('firstDayOfWeek', 'monday')}
                className={`flex-1 py-2 px-4 text-sm font-bold uppercase tracking-wider rounded-[2px] transition-colors ${
                  settings.firstDayOfWeek === 'monday'
                    ? 'bg-[#D4FF00] text-black'
                    : 'bg-[#1f1f1f] text-[#888888] border border-[#2a2a2a] hover:text-[#ffffff]'
                }`}
              >
                Monday
              </button>
              <button
                onClick={() => updateSetting('firstDayOfWeek', 'sunday')}
                className={`flex-1 py-2 px-4 text-sm font-bold uppercase tracking-wider rounded-[2px] transition-colors ${
                  settings.firstDayOfWeek === 'sunday'
                    ? 'bg-[#D4FF00] text-black'
                    : 'bg-[#1f1f1f] text-[#888888] border border-[#2a2a2a] hover:text-[#ffffff]'
                }`}
              >
                Sunday
              </button>
            </div>
          </div>
        </section>

        {/* Data Management */}
        <section className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[2px] p-4 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#ffffff]">Data Management</h2>

          <button
            onClick={() => setShowClearModal(true)}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#ff4444]/10 border border-[#ff4444]/30 text-[#ff4444] text-sm font-bold uppercase tracking-wider rounded-[2px] hover:bg-[#ff4444]/20 transition-colors"
          >
            <Trash2 size={16} />
            Clear All Data
          </button>
        </section>

        {/* About */}
        <section className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[2px] p-4 space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#ffffff]">About</h2>
          <p className="text-[#ffffff] font-bold text-lg tracking-wider">SWEATY BEASTS</p>
          <p className="text-[#888888] text-sm">Version 1.0.0</p>
          <p className="text-[#888888] text-xs">All data stored locally in your browser.</p>
        </section>
      </div>

      {/* Clear Data Modal */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[2px] w-full max-w-md p-6 space-y-4">
            {!showSecondConfirm ? (
              <>
                <div className="flex items-center gap-3 text-[#ff4444]">
                  <AlertTriangle size={24} />
                  <h3 className="text-base font-bold uppercase tracking-wider">Are You Sure?</h3>
                </div>
                <p className="text-[#888888] text-sm leading-relaxed">
                  This will permanently delete all your workouts, activities, exercises, and personal bests. This action cannot be undone.
                </p>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleCloseModal}
                    className="flex-1 py-2.5 px-4 bg-[#1f1f1f] border border-[#2a2a2a] text-[#ffffff] text-sm font-bold uppercase tracking-wider rounded-[2px] hover:bg-[#2a2a2a] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setShowSecondConfirm(true)}
                    className="flex-1 py-2.5 px-4 bg-[#ff4444] text-white text-sm font-bold uppercase tracking-wider rounded-[2px] hover:bg-[#ff4444]/80 transition-colors"
                  >
                    Yes, Delete Everything
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 text-[#ff4444]">
                  <AlertTriangle size={24} />
                  <h3 className="text-base font-bold uppercase tracking-wider">Type 'Delete' to Confirm</h3>
                </div>
                <input
                  type="text"
                  value={clearConfirmText}
                  onChange={(e) => setClearConfirmText(e.target.value)}
                  placeholder="Type DELETE to confirm"
                  className="w-full py-2.5 px-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-[2px] text-[#ffffff] text-sm placeholder:text-[#888888]/50 focus:outline-none focus:border-[#ff4444]"
                  autoFocus
                />
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleCloseModal}
                    className="flex-1 py-2.5 px-4 bg-[#1f1f1f] border border-[#2a2a2a] text-[#ffffff] text-sm font-bold uppercase tracking-wider rounded-[2px] hover:bg-[#2a2a2a] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleClearData}
                    disabled={clearConfirmText.trim().toLowerCase() !== 'delete'}
                    className="flex-1 py-2.5 px-4 bg-[#ff4444] text-white text-sm font-bold uppercase tracking-wider rounded-[2px] hover:bg-[#ff4444]/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Confirm Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
