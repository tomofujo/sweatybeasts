import { useEffect, useState, type ReactNode } from 'react';
import { Trash2, X } from 'lucide-react';

/**
 * A delete button that asks for confirmation in place.
 * First tap swaps the button for an inline "Delete / ×" pair right where the
 * user's finger is; it reverts by itself after a few seconds if ignored.
 */
export default function ConfirmDeleteButton({
  onConfirm,
  title = 'Delete',
  iconSize = 14,
  className = 'p-1 text-[#888888] hover:text-[#ff4444] transition-colors',
  compact = false,
  children,
}: {
  onConfirm: () => void;
  title?: string;
  iconSize?: number;
  className?: string;
  /** Tight spaces (e.g. table cells): show a tick-style icon instead of the word "Delete". */
  compact?: boolean;
  /** Custom content for the idle button (defaults to a bin icon). */
  children?: ReactNode;
}) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 5000);
    return () => clearTimeout(t);
  }, [armed]);

  if (!armed) {
    return (
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setArmed(true); }}
        className={className}
        title={title}
        aria-label={title}
      >
        {children ?? <Trash2 size={iconSize} />}
      </button>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => { setArmed(false); onConfirm(); }}
        className={`flex items-center gap-1 bg-[#ff4444] text-[#ffffff] rounded-[2px] font-bold uppercase tracking-wider hover:brightness-110 transition-all ${
          compact ? 'p-1.5' : 'px-2.5 py-1.5 text-[10px]'
        }`}
        title={`Confirm: ${title}`}
        aria-label={`Confirm: ${title}`}
        autoFocus
      >
        <Trash2 size={compact ? 13 : 12} />
        {!compact && 'Delete'}
      </button>
      <button
        type="button"
        onClick={() => setArmed(false)}
        className="p-1.5 text-[#888888] hover:text-[#ffffff] border border-[#2a2a2a] rounded-[2px] transition-colors"
        title="Cancel"
        aria-label="Cancel"
      >
        <X size={13} />
      </button>
    </span>
  );
}
