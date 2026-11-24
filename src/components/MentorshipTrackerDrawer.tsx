import React, { useEffect } from 'react';
import { X, Clock, CheckCircle2, XCircle, Trash2, ShieldAlert } from 'lucide-react';
import { useWarmConnect } from '../context/WarmConnectContext';
import { formatRelativeDate } from '../lib/date';

export const MentorshipTrackerDrawer: React.FC = () => {
  const { isTrackerOpen, setIsTrackerOpen, requests, cancelMentorshipRequest, respondToMentorshipRequest, user, isDemoMode } = useWarmConnect();

  useEffect(() => {
    if (!isTrackerOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsTrackerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTrackerOpen, setIsTrackerOpen]);

  if (!isTrackerOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tracker-drawer-title"
      className="fixed inset-0 z-50 overflow-hidden"
    >
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={() => setIsTrackerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0B0C10] border-l border-white/15 text-[#F5F5F7] flex flex-col justify-between shadow-2xl">
          {/* Header */}
          <div className="p-6 border-b border-white/10 bg-[#050507] flex items-center justify-between">
            <div>
              <h2 id="tracker-drawer-title" className="text-base font-medium text-[#F5F5F7] flex items-center gap-2">
                <span>My Mentorship Requests</span>
                <span className="text-xs font-mono text-[#D4D8E1] tabular-nums">
                  ({requests.length})
                </span>
              </h2>
              <p className="text-xs text-[#9FA6B2] mt-0.5">
                Track status and pending responses from alumni
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsTrackerOpen(false)}
              aria-label="Close mentorship requests drawer"
              className="p-2 text-[#9FA6B2] hover:text-white rounded-full hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List of Requests */}
          <div className="p-6 overflow-y-auto flex-1 space-y-4">
            {requests.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-xl bg-white/[0.03] border border-white/10">
                <Clock className="w-8 h-8 text-[#9FA6B2] mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium text-[#F5F5F7]">No active requests</p>
                <p className="text-xs text-[#9FA6B2] mt-1">
                  {user?.role === 'alumni' ? 'New student requests addressed to you will appear here.' : 'Explore alumni and submit a mentorship inquiry to get started.'}
                </p>
              </div>
            ) : (
              requests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/25 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {user?.role === 'alumni' ? (
                        <div className="w-10 h-10 rounded-lg border border-white/15 bg-white/5 flex items-center justify-center text-xs font-medium text-[#D4D8E1]">
                          {(req.studentName || 'S').slice(0, 1).toUpperCase()}
                        </div>
                      ) : req.alumniAvatar ? (
                        <img src={req.alumniAvatar} alt={req.alumniName} referrerPolicy="no-referrer" className="w-10 h-10 rounded-lg object-cover border border-white/15" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg border border-white/15 bg-white/5 flex items-center justify-center text-xs font-medium text-[#D4D8E1]">{req.alumniName.slice(0, 1).toUpperCase()}</div>
                      )}
                      <div>
                        <div className="text-xs font-medium text-[#F5F5F7]">{user?.role === 'alumni' ? (req.studentName || 'Student') : req.alumniName}</div>
                        <div className="text-[11px] text-[#9FA6B2]">
                          {user?.role === 'alumni' ? (req.studentDepartment || 'Student') : [req.alumniRole, req.alumniCompany].filter(Boolean).join(' @ ')}
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] font-medium shrink-0">
                      {req.status === 'accepted' && (
                        <span className="inline-flex items-center gap-1 text-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Accepted</span>
                        </span>
                      )}
                      {req.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 text-[#E4E7EE]">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Pending</span>
                        </span>
                      )}
                      {req.status === 'declined' && (
                        <span className="inline-flex items-center gap-1 text-red-300">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Unavailable</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#050507] border border-white/10 text-xs text-[#D4D8E1] space-y-1">
                    <div className="font-medium text-[#F5F5F7] text-[11px]">
                      Topic: {req.topic}
                    </div>
                    <div className="text-[#9FA6B2] text-[11px] line-clamp-2">
                      &ldquo;{req.message}&rdquo;
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#9FA6B2] pt-2 border-t border-white/10">
                    <span className="font-mono">{formatRelativeDate(req.createdAt)}</span>
                    {user?.role === 'alumni' && req.status === 'pending' ? (
                      <div className="flex items-center gap-3">
                        <button type="button" onClick={() => void respondToMentorshipRequest(req.id, 'declined')} className="text-red-300 hover:text-red-200 text-[11px]">Decline</button>
                        <button type="button" onClick={() => void respondToMentorshipRequest(req.id, 'accepted')} className="text-emerald-300 hover:text-emerald-200 text-[11px]">Accept</button>
                      </div>
                    ) : user?.role !== 'alumni' && req.status === 'pending' ? (
                      <button type="button" onClick={() => void cancelMentorshipRequest(req.id)} className="text-red-300 hover:text-red-200 flex items-center gap-1 hover:underline cursor-pointer">
                        <Trash2 className="w-3 h-3" /><span>Withdraw</span>
                      </button>
                    ) : null}
                  </div>
                </div>
              ))
            )}

            <div className="p-3.5 rounded-lg bg-[#050507] border border-white/10 text-[11px] text-[#9FA6B2] flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-[#D4D8E1] shrink-0 mt-0.5" />
              <span>
                {isDemoMode ? 'Demo mode: requests are held only in this browser session. Configure Supabase to enable secure accounts and persistent requests.' : 'Requests are stored in Supabase. Only the student who sent a request and the addressed alumnus can access it.'}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/10 bg-[#050507]">
            <button
              type="button"
              onClick={() => setIsTrackerOpen(false)}
              className="w-full py-2.5 text-xs font-medium tracking-wider uppercase text-[#F5F5F7] bg-white/5 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            >
              Close Drawer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
