import React, { useCallback, useEffect, useState } from 'react';
import { Check, ExternalLink, LoaderCircle, RefreshCw, ShieldCheck, X, XCircle } from 'lucide-react';
import { useWarmConnect } from '../context/WarmConnectContext';
import {
  createVerificationDocumentUrl,
  fetchPendingVerifications,
  reviewAlumniVerification,
  type AdminVerificationItem,
} from '../services/warmConnectService';
import { formatRelativeDate } from '../lib/date';

export const AdminReviewPanel: React.FC = () => {
  const { isAdminPanelOpen, setIsAdminPanelOpen, user, showToast, refreshDirectory } = useWarmConnect();
  const [items, setItems] = useState<AdminVerificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    if (user?.role !== 'admin') return;
    setLoading(true);
    try {
      setItems(await fetchPendingVerifications());
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Verification queue could not be loaded.', 'error');
    } finally {
      setLoading(false);
    }
  }, [user, showToast]);

  useEffect(() => {
    if (isAdminPanelOpen) void load();
  }, [isAdminPanelOpen, load]);

  if (!isAdminPanelOpen) return null;

  const openDocument = async (path: string) => {
    // Open synchronously from the click handler so browsers do not block the
    // later signed-URL navigation as an unsolicited popup.
    const popup = window.open('about:blank', '_blank');
    if (!popup) {
      showToast('Allow pop-ups for this site to view private verification evidence.', 'error');
      return;
    }
    popup.opener = null;
    try {
      const url = await createVerificationDocumentUrl(path);
      popup.location.href = url;
    } catch (error) {
      popup.close();
      showToast(error instanceof Error ? error.message : 'The private document could not be opened.', 'error');
    }
  };

  const review = async (item: AdminVerificationItem, status: 'approved' | 'rejected') => {
    setBusyId(item.id);
    try {
      await reviewAlumniVerification(item.id, status, notes[item.id] || '');
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      showToast(`Alumni verification ${status}.`, 'success');
      await refreshDirectory();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'The verification decision could not be saved.', 'error');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="admin-review-title" className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      <button type="button" aria-label="Close administrator panel" className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsAdminPanelOpen(false)} />
      <section className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#0B0C10] text-[#F5F5F7] shadow-2xl">
        <header className="flex items-center justify-between border-b border-white/10 bg-[#050507] p-5 sm:p-6">
          <div>
            <div className="mb-1 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#9FA6B2]"><ShieldCheck className="h-3.5 w-3.5" /> Restricted administrator access</div>
            <h2 id="admin-review-title" className="text-lg font-medium">Alumni Verification Queue</h2>
            <p className="mt-1 text-xs text-[#9FA6B2]">Review evidence before a profile becomes discoverable.</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => void load()} disabled={loading} aria-label="Refresh verification queue" className="rounded-full p-2 text-[#9FA6B2] hover:bg-white/5 hover:text-white disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /></button>
            <button type="button" onClick={() => setIsAdminPanelOpen(false)} aria-label="Close administrator panel" className="rounded-full p-2 text-[#9FA6B2] hover:bg-white/5 hover:text-white"><X className="h-5 w-5" /></button>
          </div>
        </header>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5 sm:p-6">
          {user?.role !== 'admin' ? (
            <p role="alert" className="rounded-xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-200">Administrator privileges are required. Access is also enforced by Supabase Row Level Security.</p>
          ) : loading && items.length === 0 ? (
            <p role="status" className="flex items-center justify-center gap-2 py-12 text-sm text-[#9FA6B2]"><LoaderCircle className="h-4 w-4 animate-spin" /> Loading submissions…</p>
          ) : items.length === 0 ? (
            <p className="py-12 text-center text-sm text-[#9FA6B2]">There are no pending verification submissions.</p>
          ) : items.map((item) => (
            <article key={item.id} className="space-y-3 rounded-xl border border-white/10 bg-white/[0.025] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-medium">{item.fullName}</h3>
                  <p className="mt-1 text-xs text-[#9FA6B2]">{[item.currentTitle, item.company, item.department].filter(Boolean).join(' · ') || 'Profile details not provided'}</p>
                  <p className="mt-1 text-[11px] text-[#777F8C]">Submitted {formatRelativeDate(item.createdAt)}</p>
                </div>
                <button type="button" onClick={() => void openDocument(item.documentPath)} className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-2 text-xs text-[#D4D8E1] hover:border-white/35 hover:text-white"><ExternalLink className="h-3.5 w-3.5" /> View private evidence</button>
              </div>
              <label className="block text-[10px] uppercase tracking-[0.15em] text-[#9FA6B2]" htmlFor={`review-note-${item.id}`}>Review note (optional)</label>
              <textarea id={`review-note-${item.id}`} rows={2} maxLength={1500} value={notes[item.id] || ''} onChange={(event) => setNotes((current) => ({ ...current, [item.id]: event.target.value }))} className="w-full rounded-lg border border-white/10 bg-[#050507] p-3 text-xs text-white outline-none focus:border-white/35" placeholder="Record the reason for your decision…" />
              <div className="flex justify-end gap-2">
                <button type="button" disabled={busyId === item.id} onClick={() => void review(item, 'rejected')} className="inline-flex items-center gap-1.5 rounded-full border border-red-400/25 px-4 py-2 text-xs text-red-200 hover:bg-red-500/10 disabled:opacity-50"><XCircle className="h-3.5 w-3.5" /> Reject</button>
                <button type="button" disabled={busyId === item.id} onClick={() => void review(item, 'approved')} className="inline-flex items-center gap-1.5 rounded-full bg-[#F5F5F7] px-4 py-2 text-xs font-medium text-[#050507] hover:bg-white disabled:opacity-50">{busyId === item.id ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Approve</button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};
