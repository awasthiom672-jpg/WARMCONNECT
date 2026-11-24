import React, { useState } from 'react';
import { Calendar, ArrowUpRight, CheckCircle2, UserCheck, Plus, X } from 'lucide-react';
import type { Opportunity, OpportunityType } from '../types';
import { useWarmConnect } from '../context/WarmConnectContext';
import { formatDeadline, formatRelativeDate, localDateKey } from '../lib/date';

const initialForm = {
  title: '', company: '', description: '', type: 'Internship' as OpportunityType,
  department: 'All', location: '', compensation: '', deadline: '', applicationUrl: '', skills: '',
};

export const OpportunitySection: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>('All');
  const [showComposer, setShowComposer] = useState(false);
  const [editingOpportunityId, setEditingOpportunityId] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const { opportunities, requestedReferralIds, referralStatuses, incomingReferralRequests, respondToReferralRequest, toggleReferralRequest, isDemoMode, dataLoading, user, createOpportunity, updateOpportunity, deleteOpportunity, setIsAuthModalOpen } = useWarmConnect();

  const types = ['All', 'Internship', 'Research', 'Full-Time', 'Mentorship Cohort'];
  const filteredOpportunities = opportunities.filter((opp) => selectedType === 'All' || opp.type === selectedType);

  const handleApplyReferral = (opp: Opportunity) => { void toggleReferralRequest(opp); };
  const updateField = (field: keyof typeof initialForm, value: string) => setForm((current) => ({ ...current, [field]: value }));

  const startEditing = (opportunity: Opportunity) => {
    setEditingOpportunityId(opportunity.id);
    setForm({
      title: opportunity.title,
      company: opportunity.company,
      description: opportunity.description,
      type: opportunity.type,
      department: opportunity.department,
      location: opportunity.location,
      compensation: opportunity.compensation,
      deadline: opportunity.deadline,
      applicationUrl: opportunity.applicationUrl || '',
      skills: opportunity.skills.join(', '),
    });
    setShowComposer(true);
  };

  const handleDelete = async (opportunity: Opportunity) => {
    if (!window.confirm(`Close “${opportunity.title}”? It will no longer appear in the public listings, and existing referral inquiries will remain on file.`)) return;
    await deleteOpportunity(opportunity.id);
  };

  const closeComposer = () => {
    setShowComposer(false);
    setEditingOpportunityId(null);
    setForm(initialForm);
  };

  const handlePublish = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    if (user.role !== 'alumni' || user.verificationStatus !== 'approved') return;
    setSubmitting(true);
    const input = {
      title: form.title, company: form.company, description: form.description, type: form.type,
      department: form.department, location: form.location, compensation: form.compensation,
      deadline: form.deadline, applicationUrl: form.applicationUrl,
      skills: form.skills.split(',').map((item) => item.trim()).filter(Boolean),
    };
    const success = editingOpportunityId
      ? await updateOpportunity(editingOpportunityId, input)
      : await createOpportunity(input);
    setSubmitting(false);
    if (success) {
      setForm(initialForm);
      setEditingOpportunityId(null);
      setShowComposer(false);
    }
  };

  return (
    <section id="opportunities" className="py-28 bg-[#0E1015] text-[#F5F5F7] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-8 border-b border-white/10">
          <div>
            <div className="text-[11px] font-medium tracking-[0.24em] uppercase text-[#9FA6B2] mb-3">Alumni Referrals &amp; Roles · Fellowships</div>
            <h2 className="text-3xl sm:text-5xl font-extralight text-[#F5F5F7] tracking-[-0.02em]">Opportunities Aligned With <span className="font-normal chrome-text">Ambition</span></h2>
            <p className="text-sm sm:text-base text-[#9FA6B2] font-light mt-3 max-w-xl">Explore roles, research fellowships, and mentorship cohorts shared by approved alumni.</p>
          </div>
          {user?.role === 'alumni' ? (
            <button type="button" onClick={() => { if (showComposer) closeComposer(); else setShowComposer(true); }} disabled={user.verificationStatus !== 'approved'} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-white/20 px-5 py-3 text-xs uppercase tracking-wider text-[#F5F5F7] transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50">
              {showComposer ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
              {showComposer ? 'Close form' : 'Post an opportunity'}
            </button>
          ) : null}
        </div>

        {user?.role === 'alumni' && user.verificationStatus !== 'approved' && (
          <p className="mb-8 rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3 text-xs text-[#9FA6B2]">Opportunity publishing becomes available after your alumni verification is approved.</p>
        )}

        {showComposer && user?.role === 'alumni' && user.verificationStatus === 'approved' && (
          <form onSubmit={(event) => void handlePublish(event)} className="mb-10 space-y-4 rounded-2xl border border-white/10 bg-[#08090C] p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3"><h3 className="text-sm font-medium">{editingOpportunityId ? 'Edit opportunity' : 'Publish an opportunity'}</h3><span className="text-[10px] uppercase tracking-wider text-[#9FA6B2]">Visible after submission</span></div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="text-[11px] text-[#9FA6B2]">Opportunity title<input required minLength={3} maxLength={160} value={form.title} onChange={(event) => updateField('title', event.target.value)} className="mt-2 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none focus:border-white/35" /></label>
              <label className="text-[11px] text-[#9FA6B2]">Company / organisation<input required minLength={2} maxLength={120} value={form.company} onChange={(event) => updateField('company', event.target.value)} className="mt-2 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none focus:border-white/35" /></label>
              <label className="text-[11px] text-[#9FA6B2]">Type<select value={form.type} onChange={(event) => updateField('type', event.target.value)} className="mt-2 w-full rounded-lg border border-white/10 bg-[#14161C] px-3 py-2.5 text-sm text-white outline-none"><option>Internship</option><option>Research</option><option>Full-Time</option><option>Mentorship Cohort</option></select></label>
              <label className="text-[11px] text-[#9FA6B2]">Department<input maxLength={80} value={form.department} onChange={(event) => updateField('department', event.target.value)} className="mt-2 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none" /></label>
              <label className="text-[11px] text-[#9FA6B2]">Location<input maxLength={120} value={form.location} onChange={(event) => updateField('location', event.target.value)} className="mt-2 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none" /></label>
              <label className="text-[11px] text-[#9FA6B2]">Compensation<input maxLength={120} value={form.compensation} onChange={(event) => updateField('compensation', event.target.value)} placeholder="Optional" className="mt-2 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none" /></label>
              <label className="text-[11px] text-[#9FA6B2]">Application deadline<input required type="date" min={localDateKey()} value={form.deadline} onChange={(event) => updateField('deadline', event.target.value)} className="mt-2 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none" /></label>
              <label className="text-[11px] text-[#9FA6B2]">Application URL<input type="url" maxLength={1000} value={form.applicationUrl} onChange={(event) => updateField('applicationUrl', event.target.value)} placeholder="https://…" className="mt-2 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none" /></label>
            </div>
            <label className="block text-[11px] text-[#9FA6B2]">Description<textarea required minLength={20} maxLength={5000} rows={4} value={form.description} onChange={(event) => updateField('description', event.target.value)} className="mt-2 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none focus:border-white/35" /></label>
            <label className="block text-[11px] text-[#9FA6B2]">Skills (comma separated)<input value={form.skills} onChange={(event) => updateField('skills', event.target.value)} className="mt-2 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none" /></label>
            <div className="flex justify-end"><button type="submit" disabled={submitting} className="rounded-full bg-[#F5F5F7] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[#050507] hover:bg-white disabled:opacity-60">{submitting ? (editingOpportunityId ? 'Saving…' : 'Publishing…') : (editingOpportunityId ? 'Save changes' : 'Publish opportunity')}</button></div>
          </form>
        )}

        <div className="mb-8 flex items-center gap-1.5 overflow-x-auto pb-1">
          {types.map((type) => <button key={type} type="button" onClick={() => setSelectedType(type)} className={`whitespace-nowrap rounded-full px-3.5 py-2 text-xs transition-colors ${selectedType === type ? 'bg-[#F5F5F7] font-medium text-[#050507]' : 'border border-white/10 bg-white/[0.04] text-[#9FA6B2] hover:bg-white/[0.09] hover:text-white'}`}>{type === 'All' ? 'All Roles' : type}</button>)}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOpportunities.map((opp) => {
            const isRequested = requestedReferralIds.includes(opp.id);
            const referralStatus = referralStatuses[opp.id];
            return (
              <article key={opp.id} className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#07080A] p-6 transition-all duration-300 hover:border-white/30">
                <div>
                  <div className="mb-4 flex items-center justify-between gap-2"><span className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#E4E7EE]">{opp.type}</span><div className="flex items-center gap-1 text-[11px] font-mono text-[#9FA6B2]"><Calendar className="h-3 w-3" /><span>{formatDeadline(opp.deadline)}</span></div></div>
                  <h3 className="mb-1.5 text-base font-medium leading-snug">{opp.title}</h3><div className="mb-3 text-xs font-medium text-[#D4D8E1]">{opp.company}</div>
                  <div className="mb-3.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-[#9FA6B2]"><span>{opp.location}</span><span aria-hidden="true">·</span><span>{opp.department}</span><span aria-hidden="true">·</span><span className="font-mono text-[#E4E7EE]">{opp.compensation}</span></div>
                  <p className="mb-3 line-clamp-3 text-xs font-light leading-relaxed text-[#9FA6B2]">{opp.description}</p>
                  {opp.applicationUrl && <a href={opp.applicationUrl} target="_blank" rel="noopener noreferrer" className="mb-4 inline-flex items-center gap-1 text-[11px] text-[#D4D8E1] underline decoration-white/30 underline-offset-4 hover:text-white">Application details <ArrowUpRight className="h-3 w-3" /></a>}
                  <div className="mb-5 text-[11px] leading-relaxed text-[#D4D8E1]/80">{opp.skills.join(' · ')}</div>
                </div>
                <div className="space-y-3 border-t border-white/10 pt-4">
                  <div className="flex items-center justify-between gap-2 text-[11px] text-[#9FA6B2]"><span className="flex items-center gap-1.5"><UserCheck className="h-3.5 w-3.5 text-[#D4D8E1]" /> Posted by {opp.postedByAlumniName} ({opp.postedByAlumniBatch})</span></div>
                  {user?.role === 'alumni' && user.id === opp.postedByAlumniId ? (
                    <div className="flex gap-2"><button type="button" onClick={() => startEditing(opp)} className="flex-1 rounded-full border border-white/15 py-2.5 text-xs uppercase tracking-wider text-[#D4D8E1] hover:bg-white/5">Edit listing</button><button type="button" onClick={() => void handleDelete(opp)} className="rounded-full border border-red-300/20 px-4 py-2.5 text-xs text-red-200 hover:bg-red-500/10">Close listing</button></div>
                  ) : (
                    <button type="button" onClick={() => handleApplyReferral(opp)} disabled={isRequested || user?.role === 'alumni'} className={`flex w-full items-center justify-center gap-1.5 rounded-full py-2.5 text-xs font-medium uppercase tracking-wider transition-all ${isRequested ? 'cursor-default border border-emerald-400/35 bg-emerald-500/15 text-emerald-200' : 'bg-[#F5F5F7] text-[#050507] hover:bg-white disabled:opacity-40'}`}>
                      {isRequested ? <><CheckCircle2 className="h-3.5 w-3.5" /><span>{referralStatus === 'acknowledged' ? 'Inquiry Acknowledged' : referralStatus === 'declined' ? 'Inquiry Declined' : referralStatus === 'withdrawn' ? 'Inquiry Withdrawn' : 'Inquiry Pending'}</span></> : <><span>{user?.role === 'alumni' ? 'Student referrals only' : 'Request Internal Referral'}</span>{user?.role !== 'alumni' && <ArrowUpRight className="h-3.5 w-3.5" />}</>}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {user?.role === 'alumni' && !isDemoMode && incomingReferralRequests.length > 0 && (
          <section aria-labelledby="incoming-referrals-heading" className="mt-12 rounded-2xl border border-white/10 bg-[#08090C] p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div><h3 id="incoming-referrals-heading" className="text-sm font-medium">Incoming referral inquiries</h3><p className="mt-1 text-xs text-[#9FA6B2]">Respond to students who have contacted you about an opportunity.</p></div>
              <span className="text-[10px] uppercase tracking-wider text-[#9FA6B2]">{incomingReferralRequests.filter((item) => item.status === 'pending').length} pending</span>
            </div>
            <div className="space-y-3">
              {incomingReferralRequests.map((request) => (
                <article key={request.id} className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div><p className="text-sm font-medium">{request.studentName}</p><p className="mt-1 text-[11px] text-[#9FA6B2]">{request.studentDepartment || 'Department not provided'} · {formatRelativeDate(request.createdAt)}</p></div>
                    <span className="w-fit rounded-full border border-white/10 px-2.5 py-1 text-[10px] uppercase tracking-wider text-[#D4D8E1]">{request.status}</span>
                  </div>
                  <p className="mt-3 text-xs text-[#D4D8E1]">{request.opportunityTitle} · {request.company}</p>
                  {request.message && <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-[#9FA6B2]">{request.message}</p>}
                  {request.status === 'pending' && <div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => void respondToReferralRequest(request.id, 'acknowledged')} className="rounded-full bg-[#F5F5F7] px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-[#050507] hover:bg-white">Acknowledge</button><button type="button" onClick={() => void respondToReferralRequest(request.id, 'declined')} className="rounded-full border border-white/15 px-4 py-2 text-[10px] uppercase tracking-wider text-[#D4D8E1] hover:bg-white/5">Decline</button></div>}
                </article>
              ))}
            </div>
          </section>
        )}

        {dataLoading && <p className="mt-8 text-center text-xs text-[#9FA6B2]" role="status">Loading opportunities…</p>}
        {!dataLoading && filteredOpportunities.length === 0 && <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.025] px-6 py-10 text-center"><p className="text-sm text-[#D4D8E1]">No opportunities match this category yet.</p><p className="mt-2 text-xs text-[#9FA6B2]">Check back as approved alumni publish new listings.</p></div>}
        <div className="mt-10 text-center text-xs font-light text-[#9FA6B2]/70">
          {isDemoMode ? 'Illustrative demo listings only. These opportunities and referral pathways are not live or independently verified.' : user?.role === 'student' ? 'Referral inquiries are sent to the approved alumnus who published the listing. An inquiry is not a referral or job application.' : 'Listings are supplied by approved alumni. Published opportunities are shown with their recorded application deadlines.'}
        </div>
      </div>
    </section>
  );
};
