import React, { useEffect } from 'react';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'alert' | 'success' | 'info';
  title: string;
  message: string;
}

interface ToastNotificationProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  toasts,
  onDismiss
}) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`pointer-events-auto p-4 rounded-xl shadow-2xl border flex items-start gap-3 transition-all animate-in slide-in-from-bottom-5 duration-300 ${
            toast.type === 'alert'
              ? 'bg-[#1e1014] border-red-500/60 text-red-100 ring-1 ring-red-500/30'
              : (toast.type === 'success' ? 'bg-[#0f1f1a] border-emerald-500/60 text-emerald-100 ring-1 ring-emerald-500/30' : 'bg-[#0f172a] border-slate-700 text-slate-100')
          }`}
        >
          {toast.type === 'alert' && (
            <div className="p-1.5 rounded-lg bg-red-600/20 text-red-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
          )}
          {toast.type === 'success' && (
            <div className="p-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          )}
          {toast.type === 'info' && (
            <div className="p-1.5 rounded-lg bg-blue-600/20 text-blue-400 shrink-0">
              <Info className="w-5 h-5" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold leading-tight">{toast.title}</h4>
            <p className="text-xs text-slate-300 mt-0.5 leading-snug">{toast.message}</p>
          </div>

          <button
            onClick={() => onDismiss(toast.id)}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
