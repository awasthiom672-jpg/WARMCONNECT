import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { useWarmConnect } from '../context/WarmConnectContext';
import { institutionName, productName } from '../lib/appConfig';

export const Footer: React.FC = () => {
  const { setIsGoalFinderOpen, setLegalDocModal } = useWarmConnect();

  return (
    <footer className="bg-[#050507] text-[#9FA6B2] border-t border-white/10 pt-20 pb-12 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-14">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <a
              href="#top"
              className="inline-block text-lg font-medium tracking-[0.14em] uppercase text-[#F5F5F7]"
            >
              Alum<span className="font-light text-[#9FA6B2]">Bridge</span>
            </a>

            <p className="text-xs text-[#9FA6B2] font-light max-w-sm leading-relaxed">
              An alumni networking and career mentorship platform for the configured {institutionName} community.
              Connecting students with engineering, research, and design leaders worldwide.
            </p>

            <div className="flex items-center gap-2 text-[11px] text-[#9FA6B2]/80 pt-2">
              <ShieldCheck className="w-4 h-4 text-[#E4E7EE] shrink-0" />
              <span>{institutionName} Community Initiative</span>
            </div>
          </div>

          {/* Col 2 */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-medium text-[#F5F5F7] uppercase tracking-[0.18em]">
              Platform
            </h4>
            <ul className="space-y-2.5 font-light">
              <li>
                <a href="#alumni-explorer" className="hover:text-white transition-colors">
                  Alumni Directory
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setIsGoalFinderOpen(true)}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Find My Mentor
                </button>
              </li>
              <li>
                <a href="#network-graph" className="hover:text-white transition-colors">
                  Interactive Network Graph
                </a>
              </li>
              <li>
                <a href="#opportunities" className="hover:text-white transition-colors">
                  Curated Opportunities
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors">
                  How Matching Works
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-medium text-[#F5F5F7] uppercase tracking-[0.18em]">
              For Students
            </h4>
            <ul className="space-y-2.5 font-light">
              <li>
                <a href="#message-assistant" className="hover:text-white transition-colors">
                  Cold Outreach Generator
                </a>
              </li>
              <li>
                <a href="#alumni-explorer" className="hover:text-white transition-colors">
                  System Design Mentorship
                </a>
              </li>
              <li>
                <a href="#alumni-explorer" className="hover:text-white transition-colors">
                  Ph.D. &amp; Fellowship Advice
                </a>
              </li>
              <li>
                <a href="#opportunities" className="hover:text-white transition-colors">
                  Alumni Referrals
                </a>
              </li>
              <li>
                <a href="#alumni-explorer" className="hover:text-white transition-colors">
                  HCD Portfolio Reviews
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-medium text-[#F5F5F7] uppercase tracking-[0.18em]">
              Departments
            </h4>
            <ul className="space-y-2 text-[11px] font-light">
              <li>CSE — Computer Science</li>
              <li>ECE — Electronics &amp; Comm.</li>
              <li>CSAM — CS &amp; Applied Math</li>
              <li>CB — Computational Biology</li>
              <li>HCD — Human-Centered Design</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#9FA6B2]/75 font-light">
          <div>
            © {new Date().getFullYear()} {productName}. Sample content in preview mode is illustrative.
          </div>

          <div className="flex items-center gap-5">
            <span>Built for {institutionName} students &amp; alumni</span>
            <span aria-hidden="true" className="text-white/25">·</span>
            <button
              type="button"
              onClick={() => setLegalDocModal('privacy')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => setLegalDocModal('terms')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Terms of Community
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
