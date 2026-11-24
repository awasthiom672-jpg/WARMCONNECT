import React, { useEffect, useState } from 'react';
import { Bell, CheckCheck, X } from 'lucide-react';
import { useWarmConnect } from '../context/WarmConnectContext';
import { formatRelativeDate } from '../lib/date';

export const NotificationCenter: React.FC = () => {
  const { notifications, refreshNotifications, markNotificationRead, user, isDemoMode } = useWarmConnect();
  const [open, setOpen] = useState(false);
  const unreadCount = notifications.filter((item) => !item.readAt).length;

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next && user && !isDemoMode) await refreshNotifications();
  };

  return (
    <div className="relative">
      <button type="button" onClick={() => void toggle()} aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ''}`} aria-expanded={open} className="relative rounded-full p-2 text-[#9FA6B2] transition-colors hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60">
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && <span aria-hidden="true" className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#E4E7EE]" />}
      </button>
      {open && (
        <div role="region" aria-label="Notifications panel" className="absolute right-0 top-full z-[70] mt-3 w-[min(92vw,22rem)] overflow-hidden rounded-2xl border border-white/15 bg-[#0B0C10] text-[#F5F5F7] shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 bg-[#050507] px-4 py-3">
            <div><h2 className="text-xs font-medium uppercase tracking-wider">Notifications</h2><p className="mt-1 text-[10px] text-[#9FA6B2]">{unreadCount} unread</p></div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close notifications" className="rounded-full p-1.5 text-[#9FA6B2] hover:bg-white/5 hover:text-white"><X className="h-4 w-4" /></button>
          </div>
          <div className="max-h-[60vh] overflow-y-auto">
            {!user ? <p className="px-4 py-8 text-center text-xs text-[#9FA6B2]">Sign in to view your notifications.</p> : isDemoMode ? <p className="px-4 py-8 text-center text-xs text-[#9FA6B2]">Notifications are available when Supabase is configured.</p> : notifications.length === 0 ? <p className="px-4 py-8 text-center text-xs text-[#9FA6B2]">You are all caught up. No notifications yet.</p> : notifications.map((item) => (
              <button type="button" key={item.id} onClick={() => { if (!item.readAt) void markNotificationRead(item.id); }} className={`block w-full border-b border-white/5 px-4 py-3 text-left transition-colors hover:bg-white/[0.04] ${item.readAt ? 'opacity-70' : 'bg-white/[0.025]'}`}>
                <span className="flex items-start justify-between gap-2"><span className="text-xs font-medium">{item.title}</span>{!item.readAt && <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#E4E7EE]" />}</span>
                <span className="mt-1 block text-[11px] leading-relaxed text-[#9FA6B2]">{item.message}</span>
                <span className="mt-2 flex items-center gap-1 text-[10px] text-[#737B88]"><CheckCheck className="h-3 w-3" /> {formatRelativeDate(item.createdAt)}{!item.readAt ? ' · Select to mark read' : ''}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
