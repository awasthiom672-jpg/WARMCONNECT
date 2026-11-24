import React, { useEffect } from 'react';
import { X, CheckCircle2, ShieldCheck, Briefcase, GraduationCap, Sparkles, MessageSquare, ArrowUpRight, MapPin, Bookmark } from 'lucide-react';
import { useAlumBridge } from '../context/AlumBridgeContext';
import { institutionName } from '../lib/appConfig';

export const AlumniProfileModal: React.FC = () => {
  const {
    activeProfile,
    setActiveProfile,
    setRequestModalAlumni,
    setPreselectedAlumnusForIntro,
    savedAlumniIds,
    toggleSaveAlumnus,
    isDemoMode
  } = useAlumBridge();

  useEffect(() => {
    if (!activeProfile) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveProfile(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeProfile, setActiveProfile]);

  if (!activeProfile) return null;

  const isSaved = savedAlumniIds.includes(activeProfile.id);

  const handleStartIntroAssistant = () => {
    setPreselectedAlumnusForIntro(activeProfile);
    setActiveProfile(null);
    const element = document.getElementById('message-assistant');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="alumni-profile-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        onClick={() => setActiveProfile(null)}
      />

      <div className="relative w-full max-w-2xl bg-[#0B0C10] border border-white/15 rounded-2xl shadow-2xl text-[#F5F5F7] overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Top Exhibition Header */}
        <div className="relative h-24 bg-[#050507] border-b border-white/10 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] font-medium text-[#D4D8E1] tracking-[0.18em] uppercase">
            <ShieldCheck className="w-4 h-4 text-[#E4E7EE]" />
            <span>{isDemoMode ? 'Illustrative Demo Profile · Not Verified' : 'Administrator-reviewed Alumni Profile'}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toggleSaveAlumnus(activeProfile.id, activeProfile.name)}
              aria-label={isSaved ? `Remove ${activeProfile.name} from shortlist` : `Save ${activeProfile.name} to shortlist`}
              aria-pressed={isSaved}
              className={`px-3 py-1.5 text-[11px] font-medium rounded-full border transition-colors flex items-center gap-1.5 cursor-pointer ${
                isSaved
                  ? 'bg-[#F5F5F7] text-[#050507] border-[#F5F5F7]'
                  : 'bg-white/5 text-[#D4D8E1] border-white/15 hover:bg-white/10'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveProfile(null)}
              aria-label="Close alumni profile modal"
              className="p-2 text-[#9FA6B2] hover:text-white rounded-full hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Profile Body */}
        <div className="px-6 pt-0 pb-6 -mt-8 overflow-y-auto flex-1 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <img
                src={activeProfile.avatar}
                alt={activeProfile.name}
                referrerPolicy="no-referrer"
                className="w-20 h-20 rounded-2xl object-cover border-2 border-[#0B0C10] shadow-xl shrink-0"
              />
              <div>
                <h2 id="alumni-profile-modal-title" className="text-xl font-medium text-[#F5F5F7] leading-tight">
                  {activeProfile.name}
                </h2>
                <p className="text-sm text-[#9FA6B2]">
                  {activeProfile.role} <span className="text-[#F5F5F7] font-medium">@ {activeProfile.company}</span>
                </p>
                <div className="flex items-center gap-1.5 text-xs text-[#9FA6B2] mt-1">
                  <MapPin className="w-3.5 h-3.5 text-[#9FA6B2]" />
                  <span>{activeProfile.location}</span>
                </div>
              </div>
            </div>

            <div className="sm:self-center">
              {activeProfile.availableForMentorship ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/25 text-emerald-300 text-[11px] font-medium">
                  <span>Accepting Mentees</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#9FA6B2] text-[11px]">
                  <span>Mentorship Paused</span>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs gap-4">
            <div className="flex items-center gap-3">
              <GraduationCap className="w-5 h-5 text-[#E4E7EE] shrink-0" />
              <div>
                <div className="font-medium text-[#F5F5F7]">{activeProfile.degree}</div>
                <div className="text-[#9FA6B2] font-light">{institutionName}</div>
              </div>
            </div>
            <div className="text-right font-mono text-[#E4E7EE] shrink-0">
              Class of {activeProfile.batchYear}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#050507] border border-white/15">
            <div className="flex items-center gap-2 text-[11px] font-medium text-[#E4E7EE] uppercase tracking-[0.16em] mb-2.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Why This Mentor?</span>
            </div>
            <ul className="space-y-1.5 text-xs text-[#9FA6B2]">
              {activeProfile.matchReasons && activeProfile.matchReasons.length > 0 ? (
                activeProfile.matchReasons.map((r, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#E4E7EE] shrink-0" />
                    <span>{r}</span>
                  </li>
                ))
              ) : (
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#E4E7EE] shrink-0" />
                  <span>Profile information provided by the account holder. Review the listed experience and mentorship topics.</span>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] font-medium text-[#D4D8E1] uppercase tracking-[0.16em] mb-2">
              Background &amp; Focus
            </h3>
            <p className="text-xs text-[#9FA6B2] font-light leading-relaxed">
              {activeProfile.bio}
            </p>
          </div>

          <div>
            <h3 className="text-[11px] font-medium text-[#D4D8E1] uppercase tracking-[0.16em] mb-3 flex items-center gap-2">
              <Briefcase className="w-3.5 h-3.5 text-[#E4E7EE]" />
              <span>Career Journey</span>
            </h3>
            <div className="space-y-2.5 border-l border-white/15 ml-2 pl-4">
              {activeProfile.pastMilestones.map((m, idx) => (
                <div key={idx} className="relative text-xs">
                  <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-[#F5F5F7] border border-[#0B0C10]" />
                  <div className="font-medium text-[#F5F5F7]">{m.title}</div>
                  <div className="text-[11px] text-[#9FA6B2]">
                    {m.organization} <span className="font-mono text-[#9FA6B2]/70">({m.year})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[11px] font-medium text-[#D4D8E1] uppercase tracking-[0.16em] mb-2">
              Offered Mentorship Topics
            </h3>
            <div className="flex flex-wrap gap-2">
              {activeProfile.mentorshipTopics.map((topic, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 text-xs rounded-md bg-white/[0.04] border border-white/10 text-[#D4D8E1]"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 text-xs italic text-[#D4D8E1] font-light">
            &ldquo;{activeProfile.adviceSnippet}&rdquo;
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-white/10 bg-[#050507] flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleStartIntroAssistant}
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-normal text-[#F5F5F7] bg-white/[0.05] hover:bg-white/[0.1] border border-white/15 rounded-full transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#D4D8E1]" />
            <span>Draft Cold Outreach Message</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const target = activeProfile;
              setActiveProfile(null);
              setRequestModalAlumni(target);
            }}
            disabled={!activeProfile.availableForMentorship}
            className={`w-full sm:w-auto px-6 py-2.5 text-xs font-medium tracking-wider uppercase rounded-full transition-all flex items-center justify-center gap-2 ${
              activeProfile.availableForMentorship
                ? 'text-[#050507] bg-[#F5F5F7] hover:bg-white cursor-pointer'
                : 'text-neutral-500 bg-white/10 cursor-not-allowed'
            }`}
          >
            <span>Request Mentorship Session</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
