import React, { useState, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import { useWarmConnect } from '../context/WarmConnectContext';
import { institutionName } from '../lib/appConfig';

export const MentorshipRequestModal: React.FC = () => {
  const { requestModalAlumni, setRequestModalAlumni, submitMentorshipRequest, setIsTrackerOpen } = useWarmConnect();

  const [topic, setTopic] = useState('');
  const [message, setMessage] = useState('');
  const [preferredCadence, setPreferredCadence] = useState('One-time 30-min strategy session');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Reset form state cleanly whenever the selected alumnus changes
  useEffect(() => {
    if (requestModalAlumni) {
      setTopic(requestModalAlumni.mentorshipTopics[0] || 'General Career Guidance & Transition');
      setPreferredCadence('One-time 30-min strategy session');
      setMessage('');
      setError('');
      setIsSubmitting(false);
    }
  }, [requestModalAlumni]);

  // Escape key handler
  useEffect(() => {
    if (!requestModalAlumni) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setRequestModalAlumni(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [requestModalAlumni, setRequestModalAlumni]);

  if (!requestModalAlumni) return null;

  const currentTopic = topic || requestModalAlumni.mentorshipTopics[0] || 'General Career Guidance & Transition';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError('');

    if (message.trim().length < 20) {
      setError('Please provide a brief personal context (at least 20 characters) explaining what you hope to learn.');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await submitMentorshipRequest({
        alumniId: requestModalAlumni.id,
        alumniName: requestModalAlumni.name,
        alumniRole: requestModalAlumni.role,
        alumniCompany: requestModalAlumni.company,
        alumniAvatar: requestModalAlumni.avatar,
        topic: currentTopic,
        message: message.trim(),
        preferredCadence
      });

      if (success === true) {
        setRequestModalAlumni(null);
        setMessage('');
        setIsTrackerOpen(true);
      } else if (typeof success === 'string') {
        setError(success);
      } else {
        setError('The request was not submitted. Check the notification and your account permissions.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="mentorship-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={() => setRequestModalAlumni(null)}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-[#0B0C10] border border-white/15 rounded-2xl shadow-2xl text-[#F5F5F7] overflow-hidden my-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#050507]">
          <div className="flex items-center gap-3.5">
            <img
              src={requestModalAlumni.avatar}
              alt={requestModalAlumni.name}
              referrerPolicy="no-referrer"
              className="w-11 h-11 rounded-xl object-cover border border-white/15 shrink-0"
            />
            <div>
              <h2 id="mentorship-modal-title" className="text-base font-medium text-[#F5F5F7]">
                Request Mentorship
              </h2>
              <p className="text-xs text-[#9FA6B2]">
                with {requestModalAlumni.name} ({requestModalAlumni.company})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setRequestModalAlumni(null)}
            aria-label="Close mentorship request dialog"
            className="p-2 text-[#9FA6B2] hover:text-white rounded-full hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div
              role="alert"
              className="p-3 rounded-xl bg-red-500/10 border border-red-400/30 text-xs text-red-200"
            >
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="mentorship-topic"
              className="block text-[11px] font-medium text-[#D4D8E1] uppercase tracking-[0.16em] mb-2"
            >
              Select Mentorship Focus Area
            </label>
            <select
              id="mentorship-topic"
              value={currentTopic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-[#14161C] border border-white/15 rounded-xl text-[#F5F5F7] focus:outline-none focus:border-white/50"
            >
              {requestModalAlumni.mentorshipTopics.map((t, idx) => (
                <option key={idx} value={t}>{t}</option>
              ))}
              <option value="General Career Guidance & Transition">General Career Guidance & Transition</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="mentorship-cadence"
              className="block text-[11px] font-medium text-[#D4D8E1] uppercase tracking-[0.16em] mb-2"
            >
              Preferred Session Cadence
            </label>
            <select
              id="mentorship-cadence"
              value={preferredCadence}
              onChange={(e) => setPreferredCadence(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-[#14161C] border border-white/15 rounded-xl text-[#F5F5F7] focus:outline-none focus:border-white/50"
            >
              <option value="One-time 30-min strategy session">One-time 30-min strategy session</option>
              <option value="Async resume or portfolio review">Async resume or portfolio review</option>
              <option value="Bi-weekly mock interview or project feedback">Bi-weekly mock interview or project feedback</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="mentorship-note"
                className="text-[11px] font-medium text-[#D4D8E1] uppercase tracking-[0.16em]"
              >
                Personal Note &amp; Context
              </label>
              <span className="text-[11px] text-[#9FA6B2] font-mono tabular-nums">
                {message.length} chars
              </span>
            </div>
            <textarea
              id="mentorship-note"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Hi ${requestModalAlumni.name}, I am a student at ${institutionName} interested in your work on ${requestModalAlumni.skills[0] || 'engineering'}. I would love 20 minutes to ask about...`}
              className="w-full p-3 text-xs bg-white/[0.04] border border-white/15 rounded-xl text-[#F5F5F7] placeholder-neutral-500 focus:outline-none focus:border-white/50 leading-relaxed resize-none"
            />
            <p className="text-[11px] text-[#9FA6B2]/75 mt-1.5">
              Be concrete, polite, and respectful of the alumnus&apos;s schedule.
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setRequestModalAlumni(null)}
              className="px-4 py-2 text-xs font-normal text-[#9FA6B2] hover:text-white transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-xs font-medium tracking-wider uppercase text-[#050507] bg-[#F5F5F7] hover:bg-white rounded-full transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Sending Request...' : 'Submit Request'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
