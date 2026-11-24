import React, { useEffect } from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { useWarmConnect } from '../context/WarmConnectContext';
import { institutionName, productName } from '../lib/appConfig';

export const LegalDocModal: React.FC = () => {
  const { legalDocModal, setLegalDocModal } = useWarmConnect();

  useEffect(() => {
    if (!legalDocModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLegalDocModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [legalDocModal, setLegalDocModal]);

  if (!legalDocModal) return null;

  const isPrivacy = legalDocModal === 'privacy';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-doc-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={() => setLegalDocModal(null)}
      />

      <div className="relative w-full max-w-lg bg-[#0B0C10] border border-white/15 rounded-2xl shadow-2xl text-[#F5F5F7] overflow-hidden my-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#050507]">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#E4E7EE]" />
            <h2 id="legal-doc-modal-title" className="text-base font-medium text-[#F5F5F7]">
              {isPrivacy ? 'Privacy Policy (Demonstration Preview)' : 'Terms of Community'}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setLegalDocModal(null)}
            aria-label="Close legal notice dialog"
            className="p-2 text-[#9FA6B2] hover:text-white rounded-full hover:bg-white/5 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs text-[#9FA6B2] font-light leading-relaxed">
          {isPrivacy ? (
            <>
              <p>
                {productName} is intended to help students and alumni of {institutionName} discover profiles, coordinate mentorship requests, and review community opportunities. When a Supabase project is configured, account and workflow data is processed by that project.
              </p>
              <p>
                Public directory fields are separated from private account identity and verification documents. Mentorship requests, saved alumni, referral inquiries, and notifications are restricted by database Row Level Security policies described in the project documentation.
              </p>
              <p>
                Preview mode uses illustrative data held in application memory only. It does not create accounts or persist actions. Before launch, the operator must publish a production privacy notice that identifies the data controller, retention periods, lawful basis, contact address, and applicable user rights.
              </p>
            </>
          ) : (
            <>
              <p>
                {productName} is intended to support respectful academic and career mentorship within the {institutionName} community.
              </p>
              <p>
                Users must provide accurate information, respect contact preferences and time boundaries, avoid harassment or mass unsolicited outreach, and use opportunity listings only for their stated purpose.
              </p>
              <p>
                Alumni verification is an administrator review of submitted evidence and does not imply an official institutional endorsement unless the operator has separately confirmed that relationship. Preview profiles, opportunities, and network relationships are illustrative rather than real endorsements.
              </p>
              <p>
                These in-app summaries are product notices, not legal advice or a complete legal agreement. The operator must obtain appropriate legal review and publish complete terms before production use.
              </p>
            </>
          )}
        </div>

        <div className="p-4 border-t border-white/10 bg-[#050507] flex justify-end">
          <button
            type="button"
            onClick={() => setLegalDocModal(null)}
            className="px-5 py-2 text-xs font-medium tracking-wider uppercase text-[#050507] bg-[#F5F5F7] hover:bg-white rounded-full transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
