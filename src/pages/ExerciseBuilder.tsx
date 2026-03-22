import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, Save, X, ChevronDown } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import ExerciseSVG from '../components/ExerciseSVG';
import { getExercises, saveExercises } from '../utils/storage';
import type { Exercise, MuscleGroup, Equipment } from '../types';
import { builtInExercises } from '../data/exercises';

const MUSCLE_GROUPS: MuscleGroup[] = ['Chest', 'Back', 'Shoulders', 'Legs', 'Arms', 'Core', 'Full Body'];
const EQUIPMENT_OPTIONS: Equipment[] = ['Barbell', 'Dumbbell', 'Cable', 'Bodyweight', 'Machine', 'Kettlebell', 'Other'];

function generateId(): string {
  return 'custom-' + crypto.randomUUID();
}

export default function ExerciseBuilder() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [muscleFilter, setMuscleFilter] = useState<string>('');
  const [equipmentFilter, setEquipmentFilter] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup>('Chest');
  const [secondaryMuscles, setSecondaryMuscles] = useState<MuscleGroup[]>([]);
  const [equipment, setEquipment] = useState<Equipment>('Barbell');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState<string[]>(['']);
  const [imageUrl, setImageUrl] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    const stored = getExercises();
    if (stored.length === 0) {
      saveExercises(builtInExercises);
      setExercises(builtInExercises);
    } else {
      setExercises(stored);
    }
  }, []);

  const filteredExercises = exercises.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMuscle = !muscleFilter || ex.muscleGroup === muscleFilter;
    const matchesEquipment = !equipmentFilter || ex.equipment === equipmentFilter;
    return matchesSearch && matchesMuscle && matchesEquipment;
  });

  function resetForm() {
    setName('');
    setMuscleGroup('Chest');
    setSecondaryMuscles([]);
    setEquipment('Barbell');
    setDescription('');
    setInstructions(['']);
    setImageUrl('');
    setEditingId(null);
    setShowForm(false);
  }

  function openCreateForm() {
    resetForm();
    setShowForm(true);
  }

  function openEditForm(ex: Exercise) {
    setName(ex.name);
    setMuscleGroup(ex.muscleGroup);
    setSecondaryMuscles(ex.secondaryMuscles);
    setEquipment(ex.equipment);
    setDescription(ex.description);
    setInstructions(ex.instructions.length > 0 ? [...ex.instructions] : ['']);
    setImageUrl(ex.imageUrl ?? '');
    setEditingId(ex.id);
    setShowForm(true);
  }

  function handleSave() {
    if (!name.trim()) return;

    const validInstructions = instructions.filter((s) => s.trim() !== '');

    const exerciseData: Exercise = {
      id: editingId ?? generateId(),
      name: name.trim(),
      muscleGroup,
      secondaryMuscles,
      equipment,
      description: description.trim(),
      instructions: validInstructions,
      isCustom: true,
      ...(imageUrl.trim() ? { imageUrl: imageUrl.trim() } : {}),
    };

    let updated: Exercise[];
    if (editingId) {
      updated = exercises.map((ex) => (ex.id === editingId ? exerciseData : ex));
    } else {
      updated = [...exercises, exerciseData];
    }

    setExercises(updated);
    saveExercises(updated);
    resetForm();
  }

  function handleDelete(id: string) {
    const updated = exercises.filter((ex) => ex.id !== id);
    setExercises(updated);
    saveExercises(updated);
    setDeleteConfirm(null);
  }

  function toggleSecondaryMuscle(mg: MuscleGroup) {
    setSecondaryMuscles((prev) =>
      prev.includes(mg) ? prev.filter((m) => m !== mg) : [...prev, mg]
    );
  }

  function addInstructionStep() {
    setInstructions((prev) => [...prev, '']);
  }

  function updateInstruction(index: number, value: string) {
    setInstructions((prev) => prev.map((s, i) => (i === index ? value : s)));
  }

  function removeInstruction(index: number) {
    if (instructions.length <= 1) return;
    setInstructions((prev) => prev.filter((_, i) => i !== index));
  }

  // Remove selected primary from secondary when primary changes
  useEffect(() => {
    setSecondaryMuscles((prev) => prev.filter((m) => m !== muscleGroup));
  }, [muscleGroup]);

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold uppercase tracking-wider text-[#ffffff]">
            Exercise Library
          </h1>
          <button
            onClick={openCreateForm}
            className="flex items-center gap-2 bg-[#D4FF00] text-[#0a0a0a] px-4 py-2 rounded-[2px] font-bold uppercase tracking-wider text-sm hover:brightness-110 transition-all"
          >
            <Plus size={18} />
            Create Exercise
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search exercises..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] text-[#ffffff] placeholder-[#888888] px-4 py-2.5 rounded-[2px] text-sm focus:outline-none focus:border-[#D4FF00] transition-colors"
          />
          <div className="relative">
            <select
              value={muscleFilter}
              onChange={(e) => setMuscleFilter(e.target.value)}
              className="appearance-none bg-[#1a1a1a] border border-[#2a2a2a] text-[#ffffff] px-4 py-2.5 pr-10 rounded-[2px] text-sm focus:outline-none focus:border-[#D4FF00] transition-colors cursor-pointer w-full sm:w-auto"
            >
              <option value="">All Muscles</option>
              {MUSCLE_GROUPS.map((mg) => (
                <option key={mg} value={mg}>{mg}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888888] pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={equipmentFilter}
              onChange={(e) => setEquipmentFilter(e.target.value)}
              className="appearance-none bg-[#1a1a1a] border border-[#2a2a2a] text-[#ffffff] px-4 py-2.5 pr-10 rounded-[2px] text-sm focus:outline-none focus:border-[#D4FF00] transition-colors cursor-pointer w-full sm:w-auto"
            >
              <option value="">All Equipment</option>
              {EQUIPMENT_OPTIONS.map((eq) => (
                <option key={eq} value={eq}>{eq}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888888] pointer-events-none" />
          </div>
        </div>

        {/* Create / Edit Form */}
        {showForm && (
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[2px] p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold uppercase tracking-wider text-[#ffffff]">
                {editingId ? 'Edit Exercise' : 'Create Exercise'}
              </h2>
              <button
                onClick={resetForm}
                className="text-[#888888] hover:text-[#ffffff] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#888888] mb-1.5">
                Name <span className="text-[#ff4444]">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Incline Hammer Curl"
                className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-[#ffffff] placeholder-[#888888] px-4 py-2.5 rounded-[2px] text-sm focus:outline-none focus:border-[#D4FF00] transition-colors"
              />
            </div>

            {/* Primary Muscle Group & Equipment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#888888] mb-1.5">
                  Primary Muscle Group
                </label>
                <div className="relative">
                  <select
                    value={muscleGroup}
                    onChange={(e) => setMuscleGroup(e.target.value as MuscleGroup)}
                    className="appearance-none w-full bg-[#0a0a0a] border border-[#2a2a2a] text-[#ffffff] px-4 py-2.5 pr-10 rounded-[2px] text-sm focus:outline-none focus:border-[#D4FF00] transition-colors cursor-pointer"
                  >
                    {MUSCLE_GROUPS.map((mg) => (
                      <option key={mg} value={mg}>{mg}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888888] pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#888888] mb-1.5">
                  Equipment
                </label>
                <div className="relative">
                  <select
                    value={equipment}
                    onChange={(e) => setEquipment(e.target.value as Equipment)}
                    className="appearance-none w-full bg-[#0a0a0a] border border-[#2a2a2a] text-[#ffffff] px-4 py-2.5 pr-10 rounded-[2px] text-sm focus:outline-none focus:border-[#D4FF00] transition-colors cursor-pointer"
                  >
                    {EQUIPMENT_OPTIONS.map((eq) => (
                      <option key={eq} value={eq}>{eq}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888888] pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Secondary Muscles */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#888888] mb-1.5">
                Secondary Muscles
              </label>
              <div className="flex flex-wrap gap-2">
                {MUSCLE_GROUPS.filter((mg) => mg !== muscleGroup).map((mg) => (
                  <button
                    key={mg}
                    type="button"
                    onClick={() => toggleSecondaryMuscle(mg)}
                    className={`px-3 py-1.5 rounded-[2px] text-xs font-bold uppercase tracking-wider border transition-colors ${
                      secondaryMuscles.includes(mg)
                        ? 'bg-[#D4FF00] text-[#0a0a0a] border-[#D4FF00]'
                        : 'bg-[#0a0a0a] text-[#888888] border-[#2a2a2a] hover:border-[#D4FF00] hover:text-[#ffffff]'
                    }`}
                  >
                    {mg}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#888888] mb-1.5">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A brief description of the exercise (1-2 sentences)."
                rows={2}
                className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-[#ffffff] placeholder-[#888888] px-4 py-2.5 rounded-[2px] text-sm focus:outline-none focus:border-[#D4FF00] transition-colors resize-none"
              />
            </div>

            {/* Instructions */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#888888] mb-1.5">
                Instructions <span className="text-[#888888] font-normal normal-case tracking-normal">(optional)</span>
              </label>
              <div className="space-y-2">
                {instructions.map((step, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-xs font-bold text-[#D4FF00] mt-3 min-w-[20px] text-right">
                      {index + 1}.
                    </span>
                    <input
                      type="text"
                      value={step}
                      onChange={(e) => updateInstruction(index, e.target.value)}
                      placeholder={`Step ${index + 1}`}
                      className="flex-1 bg-[#0a0a0a] border border-[#2a2a2a] text-[#ffffff] placeholder-[#888888] px-4 py-2.5 rounded-[2px] text-sm focus:outline-none focus:border-[#D4FF00] transition-colors"
                    />
                    {instructions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeInstruction(index)}
                        className="mt-2 text-[#888888] hover:text-[#ff4444] transition-colors"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addInstructionStep}
                className="mt-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#D4FF00] hover:brightness-110 transition-all"
              >
                <Plus size={14} />
                Add Step
              </button>
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#888888] mb-1.5">
                Image URL <span className="text-[#888888] font-normal normal-case tracking-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-[#ffffff] placeholder-[#888888] px-4 py-2.5 rounded-[2px] text-sm focus:outline-none focus:border-[#D4FF00] transition-colors"
              />
            </div>

            {/* Save / Cancel */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={!name.trim()}
                className="flex items-center gap-2 bg-[#D4FF00] text-[#0a0a0a] px-5 py-2.5 rounded-[2px] font-bold uppercase tracking-wider text-sm hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Save size={16} />
                {editingId ? 'Update Exercise' : 'Save Exercise'}
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

        {/* Exercise List */}
        {filteredExercises.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[#888888] font-bold uppercase tracking-wider text-sm">
              No exercises found. Create your own below.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredExercises.map((ex) => (
              <div
                key={ex.id}
                className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[2px] p-4 flex items-center gap-4 hover:border-[#D4FF00]/30 transition-colors"
              >
                {/* SVG Icon */}
                <div className="hidden sm:block w-12 h-12 flex-shrink-0 bg-[#0a0a0a] rounded-[2px] border border-[#2a2a2a] overflow-hidden">
                  <ExerciseSVG exerciseId={ex.id} className="w-full h-full" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[#ffffff] font-bold text-sm truncate">
                      {ex.name}
                    </span>
                    {ex.isCustom && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#0a0a0a] bg-[#D4FF00] px-1.5 py-0.5 rounded-[2px] flex-shrink-0">
                        Custom
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-[#888888]">{ex.muscleGroup}</span>
                    <span className="text-[#2a2a2a]">&middot;</span>
                    <span className="text-xs text-[#888888]">{ex.equipment}</span>
                  </div>
                </div>

                {/* Actions (custom only) */}
                {ex.isCustom && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => openEditForm(ex)}
                      className="p-2 text-[#888888] hover:text-[#D4FF00] transition-colors"
                      title="Edit exercise"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(ex.id)}
                      className="p-2 text-[#888888] hover:text-[#ff4444] transition-colors"
                      title="Delete exercise"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[2px] p-6 max-w-sm w-full mx-4 space-y-4">
              <h3 className="text-base font-bold uppercase tracking-wider text-[#ffffff]">
                Delete Exercise?
              </h3>
              <p className="text-sm text-[#888888]">
                Are you sure you want to delete{' '}
                <span className="text-[#ffffff] font-bold">
                  {exercises.find((ex) => ex.id === deleteConfirm)?.name}
                </span>
                ? This action cannot be undone.
              </p>
              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex items-center gap-2 bg-[#ff4444] text-[#ffffff] px-4 py-2 rounded-[2px] font-bold uppercase tracking-wider text-sm hover:brightness-110 transition-all"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 rounded-[2px] font-bold uppercase tracking-wider text-sm text-[#888888] border border-[#2a2a2a] hover:text-[#ffffff] hover:border-[#888888] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
