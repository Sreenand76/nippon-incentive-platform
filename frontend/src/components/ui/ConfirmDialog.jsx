import React, { useEffect } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

const ConfirmDialog = ({
  open,
  title = 'Confirm delete',
  message = 'Are you sure?',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
}) => {
  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape' && !loading) onCancel(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, loading, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby="confirm-dialog-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]"
        onClick={!loading ? onCancel : undefined}
      />

      {/* Panel */}
      <div className="relative w-full max-w-xs rounded-xl bg-white shadow-[0_16px_48px_-8px_rgba(0,0,0,0.16)] ring-1 ring-slate-200/80 overflow-hidden animate-in">
        {/* Top accent line */}
        <div className="h-[2px] w-full bg-gradient-to-r from-red-500 via-rose-400 to-red-400" />

        <div className="px-4 pt-4 pb-4">
          {/* Icon + text */}
          <div className="flex items-start gap-3 mb-4">
            <div className="shrink-0 mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 ring-1 ring-red-100">
              <AlertTriangle className="w-4 h-4 text-red-500" strokeWidth={2} />
            </div>
            <div className="min-w-0 pt-0.5">
              <h3
                id="confirm-dialog-title"
                className="text-sm font-semibold text-slate-900 leading-snug"
              >
                {title}
              </h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                {message}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 ring-1 ring-slate-200 hover:ring-slate-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-red-500 hover:bg-red-600 shadow-sm shadow-red-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Deleting…
                </>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes dialog-in {
          from { opacity: 0; transform: scale(0.96) translateY(6px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);   }
        }
        .animate-in {
          animation: dialog-in 0.18s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
      `}</style>
    </div>
  );
};

export default ConfirmDialog;
