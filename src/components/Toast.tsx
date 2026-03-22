import { X } from 'lucide-react';

export interface ToastData {
  id: string;
  message: string;
  type: 'success' | 'error' | 'pb';
}

interface Props {
  toasts: ToastData[];
  onRemove: (id: string) => void;
}

export default function ToastContainer({ toasts, onRemove }: Props) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-[2px] shadow-lg animate-[slideIn_200ms_ease-out] ${
            toast.type === 'pb'
              ? 'bg-accent text-black font-black uppercase tracking-wider'
              : toast.type === 'error'
              ? 'bg-danger text-white'
              : 'bg-surface-light text-text border border-border'
          }`}
        >
          <span className="text-sm">{toast.message}</span>
          <button onClick={() => onRemove(toast.id)} className="ml-2 opacity-70 hover:opacity-100">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
