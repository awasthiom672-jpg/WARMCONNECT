import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Copy, Check, MessageSquare, RefreshCw, ArrowUpRight } from 'lucide-react';
import { useWarmConnect } from '../context/WarmConnectContext';
import { institutionName, productName } from '../lib/appConfig';

type ToneOption = 'professional' | 'friendly' | 'concise';

export const SmartIntroAssistant: React.FC = () => {
  const { alumni, preselectedAlumnusForIntro, showToast, setRequestModalAlumni } = useWarmConnect();

  const [selectedAlumniId, setSelectedAlumniId] = useState<string>(alumni[0]?.id ?? '');
  const [reason, setReason] = useState<string>('System Design & Backend Preparation');
  const [studentContext, setStudentContext] = useState<string>(
    '3rd Year CSE student building distributed key-value storage primitives'
  );
  const [tone, setTone] = useState<ToneOption>('professional');
  const [generatedMessage, setGeneratedMessage] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (preselectedAlumnusForIntro) {
      setSelectedAlumniId(preselectedAlumnusForIntro.id);
    } else if (!selectedAlumniId && alumni.length > 0) {
      setSelectedAlumniId(alumni[0].id);
    }
  }, [preselectedAlumnusForIntro, alumni, selectedAlumniId]);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  const currentAlumnus = alumni.find((a) => a.id === selectedAlumniId) || alumni[0] || null;

  const generateTemplateMessage = useCallback(() => {
    const alum = currentAlumnus;
    if (!alum) {
      setGeneratedMessage('No approved alumni profiles are currently available. Once an alumnus is approved and published, you can generate a contextual introduction here.');
      return;
    }
    const contextText = studentContext.trim() || `student exploring ${alum.department} engineering pathways`;
    let text = '';

    if (tone === 'professional') {
      text = `Dear ${alum.name},

I hope this message finds you well. I am a student at ${institutionName} (${alum.department} cohort) currently focused on ${contextText}.

I have been following your career journey from ${institutionName} (Class of ${alum.batchYear}) to your current role as ${alum.role} at ${alum.company}. Given your deep expertise in ${alum.skills.slice(0, 2).join(' and ')}, I would be deeply grateful for your perspective on ${reason.toLowerCase()}.

If your schedule permits, would you be open to a brief 20-minute virtual conversation or async email advice? I would be glad to share my specific questions in advance to make the most of your time.

Thank you very much for your time and continued support of the ${institutionName} community.

Sincerely,
[Your Name]
${institutionName} Student`;
    } else if (tone === 'friendly') {
      text = `Hi ${alum.name}!

Warm greetings from the ${institutionName} campus! I came across your profile through ${productName} and was really inspired seeing an alumnus from our ${alum.department} department thriving as ${alum.role} at ${alum.company}.

I am currently a ${contextText}. As I navigate my next steps, I'd love to learn from your experience regarding ${reason.toLowerCase()}.

Would you have 15-20 minutes in the coming weeks for a casual virtual chat? Completely understand if you are busy, and happy to coordinate at your convenience.

Best regards,
[Your Name]`;
    } else {
      text = `Hi ${alum.name},

I am a ${institutionName} student (${contextText}) reaching out to fellow alumni.

I'm currently preparing for ${reason.toLowerCase()} and admire your work as ${alum.role} at ${alum.company}. Would you be open to a quick 15-minute call or brief async guidance on navigating this transition?

Appreciate your time,
[Your Name]
${institutionName}`;
    }

    setGeneratedMessage(text);
  }, [currentAlumnus, reason, studentContext, tone]);

  useEffect(() => {
    generateTemplateMessage();
  }, [generateTemplateMessage]);

  const handleCopy = async () => {
    if (!generatedMessage.trim() || !currentAlumnus) return;
    try {
      await navigator.clipboard.writeText(generatedMessage);
      setCopied(true);
      showToast('Message copied to clipboard.', 'success');
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Could not access clipboard automatically.', 'error');
    }
  };

  return (
    <section id="message-assistant" className="py-28 bg-[#050507] border-t border-white/10 text-[#F5F5F7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end pb-12 border-b border-white/10 mb-12">
          <div className="lg:col-span-7">
            <div className="text-[11px] font-medium tracking-[0.24em] uppercase text-[#9FA6B2] mb-3">
              Cold Outreach Assistant · Studio
            </div>
            <h2 className="text-3xl sm:text-5xl font-extralight text-[#F5F5F7] tracking-[-0.02em]">
              Make Your First Message <span className="font-normal chrome-text">Count.</span>
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-sm sm:text-base text-[#9FA6B2] font-light leading-relaxed">
              Generate respectful, contextual outreach messages grounded in available alumni profile information without generic fluff.
            </p>
          </div>
        </div>

        {/* 2-Column Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls */}
          <div className="lg:col-span-5 p-6 sm:p-7 rounded-2xl bg-[#0B0C10] border border-white/10 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <span className="text-[11px] font-medium text-[#F5F5F7] uppercase tracking-[0.18em]">
                Outreach Parameters
              </span>
              <span className="text-[11px] text-[#9FA6B2] font-mono">
                Deterministic Templates
              </span>
            </div>

            <div>
              <label
                htmlFor="intro-target-alumnus"
                className="block text-[11px] font-medium text-[#D4D8E1] uppercase tracking-[0.14em] mb-2"
              >
                Target Alumnus
              </label>
              <select
                id="intro-target-alumnus"
                value={selectedAlumniId}
                disabled={alumni.length === 0}
                onChange={(e) => setSelectedAlumniId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-[#14161C] border border-white/15 rounded-xl text-[#F5F5F7] focus:outline-none focus:border-white/45"
              >
                {alumni.length === 0
                  ? <option value="">No approved alumni profiles available</option>
                  : alumni.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} — {a.role} @ {a.company} ({a.department} &apos;{a.batchYear})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="intro-reason-select"
                className="block text-[11px] font-medium text-[#D4D8E1] uppercase tracking-[0.14em] mb-2"
              >
                Reason for Reaching Out
              </label>
              <select
                id="intro-reason-select"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-[#14161C] border border-white/15 rounded-xl text-[#F5F5F7] focus:outline-none focus:border-white/45"
              >
                <option value="System Design & Backend Preparation">System Design &amp; Backend Preparation</option>
                <option value="AI / ML Frontier Research Methodologies">AI / ML Frontier Research Methodologies</option>
                <option value="Product Design Portfolio Critique">Product Design Portfolio Critique</option>
                <option value="Early-Stage Startup & Y Combinator Insights">Early-Stage Startup &amp; Y Combinator Insights</option>
                <option value="Master's / Ph.D. Applications Advice">Master&apos;s / Ph.D. Applications Advice</option>
                <option value="Transition from Student to Industry SWE">Transition from Student to Industry SWE</option>
                <option value="General Career Guidance & Transition">General Career Guidance &amp; Transition</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="intro-student-context"
                className="block text-[11px] font-medium text-[#D4D8E1] uppercase tracking-[0.14em] mb-2"
              >
                Your Student Context / Projects
              </label>
              <input
                id="intro-student-context"
                type="text"
                value={studentContext}
                onChange={(e) => setStudentContext(e.target.value)}
                placeholder="e.g. 3rd year CSE student building distributed systems"
                className="w-full px-3.5 py-2.5 text-xs bg-white/[0.04] border border-white/15 rounded-xl text-[#F5F5F7] placeholder-neutral-500 focus:outline-none focus:border-white/45"
              />
            </div>

            <div>
              <span className="block text-[11px] font-medium text-[#D4D8E1] uppercase tracking-[0.14em] mb-2">
                Preferred Tone
              </span>
              <div className="grid grid-cols-3 gap-2">
                {(['professional', 'friendly', 'concise'] as ToneOption[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTone(t)}
                    className={`py-2 text-xs font-normal rounded-full capitalize border transition-all cursor-pointer ${
                      tone === t
                        ? 'bg-[#F5F5F7] text-[#050507] border-[#F5F5F7] font-medium'
                        : 'bg-white/[0.03] border-white/12 text-[#9FA6B2] hover:text-white hover:bg-white/[0.08]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 text-[11px] text-[#9FA6B2]/75 font-light">
              Structured template engine keeping student intent concise, verifiable, and respectful.
            </div>
          </div>

          {/* Preview */}
          <div className="lg:col-span-7 p-6 sm:p-7 rounded-2xl bg-[#0B0C10] border border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10 mb-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#D4D8E1]" />
                  <label
                    htmlFor="intro-draft-preview"
                    className="text-[11px] font-medium text-[#F5F5F7] uppercase tracking-[0.16em]"
                  >
                    Draft Message Preview (Editable)
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={generateTemplateMessage}
                    disabled={!currentAlumnus}
                    className="p-2 text-[#9FA6B2] hover:text-white rounded-full hover:bg-white/5 cursor-pointer"
                    aria-label="Regenerate message template"
                    title="Regenerate template"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleCopy}
                    disabled={!currentAlumnus}
                    className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-[#050507] bg-[#F5F5F7] hover:bg-white rounded-full transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Message</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <textarea
                id="intro-draft-preview"
                rows={12}
                value={generatedMessage}
                onChange={(e) => setGeneratedMessage(e.target.value)}
                disabled={!currentAlumnus}
                className="w-full p-4 text-xs font-mono bg-[#050507] border border-white/10 rounded-xl text-[#E4E7EE] leading-relaxed focus:outline-none focus:border-white/40 resize-y"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10 mt-4">
              <span className="text-[11px] text-[#9FA6B2]">
                Send externally or submit directly through ${productName}.
              </span>

              <button
                type="button"
                onClick={() => currentAlumnus && setRequestModalAlumni(currentAlumnus)}
                disabled={!currentAlumnus?.availableForMentorship}
                className={`w-full sm:w-auto px-5 py-2.5 text-xs font-medium tracking-wider uppercase rounded-full transition-colors flex items-center justify-center gap-1.5 ${
                  currentAlumnus?.availableForMentorship
                    ? 'text-[#050507] bg-[#F5F5F7] hover:bg-white cursor-pointer'
                    : 'text-neutral-500 bg-white/10 cursor-not-allowed'
                }`}
              >
                <span>
                  {currentAlumnus?.availableForMentorship ? 'Request Mentorship' : currentAlumnus ? 'Mentorship Paused' : 'No Mentor Available'}
                </span>
                {currentAlumnus?.availableForMentorship && <ArrowUpRight className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
