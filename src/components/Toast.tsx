import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useWarmConnect } from '../context/WarmConnectContext';

export const Toast: React.FC = () => {
  const { toast, dismissToast } = useWarmConnect();

  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 transition-all duration-300"
    >
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#14161C]/95 backdrop-blur-md border border-white/15 text-[#F5F5F7] shadow-2xl shadow-black/70 text-xs max-w-sm">
        {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#E4E7EE] shrink-0" />}
        {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
        {toast.type === 'info' && <Info className="w-4 h-4 text-[#9FA6B2] shrink-0" />}

        <span className="font-normal text-[#F5F5F7] leading-snug">{toast.message}</span>

        <button
          type="button"
          onClick={dismissToast}
          aria-label="Dismiss notification"
          className="ml-1 p-1 text-[#9FA6B2] hover:text-white rounded transition-colors shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
