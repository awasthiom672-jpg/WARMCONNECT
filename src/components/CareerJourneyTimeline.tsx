import React, { useState } from 'react';
import { Compass, Sparkles, Send, MessageSquare, Rocket, ArrowUpRight } from 'lucide-react';
import { useAlumBridge } from '../context/AlumBridgeContext';

export const CareerJourneyTimeline: React.FC = () => {
  const [activeStep, setActiveStep] = useState(1);
  const { setIsGoalFinderOpen } = useAlumBridge();

  const journeySteps = [
    {
      step: 1,
      title: 'Set a Career Goal',
      description: 'Define your target role, target organizations, and core engineering skills.',
      detail: 'Example: 3rd year CSE targeting Google Distributed Systems & Go infrastructure.',
      icon: Compass,
    },
    {
      step: 2,
      title: 'Discover Relevant Alumni',
      description: 'Transparent matching surfaces senior engineers and researchers with clear criteria.',
      detail: 'Illustrative scenario: compare skills and experience with a relevant approved alumni profile. No score or individual match is implied here.',
      icon: Sparkles,
    },
    {
      step: 3,
      title: 'Request Mentorship',
      description: 'Send a structured inquiry with concrete context and preferred session cadence.',
      detail: 'Alumni review focused requests and confirm session slots cleanly.',
      icon: Send,
    },
    {
      step: 4,
      title: 'Receive 1-on-1 Guidance',
      description: 'Engage in focused 30-min strategy calls, architecture critiques, or portfolio reviews.',
      detail: 'Direct, actionable feedback from someone familiar with your institution and career path.',
      icon: MessageSquare,
    },
    {
      step: 5,
      title: 'Explore Opportunities',
      description: 'Unlock internal employee referrals and high-impact research fellowship pathways.',
      detail: 'Convert warm mentorship conversations into compounding career momentum.',
      icon: Rocket,
    },
  ];

  return (
    <section className="py-28 bg-[#050507] text-[#F5F5F7] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="text-[11px] font-medium tracking-[0.24em] uppercase text-[#9FA6B2] mb-3">
            Example Pathway · Progression
          </div>
          <h2 className="text-3xl sm:text-5xl font-extralight text-[#F5F5F7] tracking-[-0.02em]">
            Small Connections. <span className="font-normal chrome-text">Meaningful Progress.</span>
          </h2>
          <p className="text-sm sm:text-base text-[#9FA6B2] font-light mt-3 [text-wrap:balance]">
            An example of how a student can turn a thoughtful institutional conversation into long-term momentum.
          </p>
        </div>

        {/* 5-Column Exhibition Stepper */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative mb-12">
          {journeySteps.map((item, idx) => {
            const Icon = item.icon;
            const isSelected = activeStep === idx;
            return (
              <div
                key={item.step}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                onClick={() => setActiveStep(idx)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveStep(idx);
                  }
                }}
                className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${
                  isSelected
                    ? 'bg-[#111318] border-white/45 shadow-[0_16px_40px_rgba(0,0,0,0.6)]'
                    : 'bg-[#0B0C10] border-white/10 hover:border-white/25'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className={`text-xs font-mono ${isSelected ? 'text-[#F5F5F7]' : 'text-[#9FA6B2]/70'}`}>
                      0{item.step}
                    </span>
                    <div
                      className={`p-2 rounded-full ${
                        isSelected ? 'bg-[#F5F5F7] text-[#050507]' : 'bg-white/5 text-[#9FA6B2]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <h3 className="text-sm font-medium text-[#F5F5F7] mb-2 leading-tight">
                    {item.title}
                  </h3>

                  <p className="text-xs text-[#9FA6B2] font-light leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-white/10 text-[10px] font-mono uppercase tracking-wider text-[#9FA6B2]/75">
                  {isSelected ? 'Active Stage' : 'Inspect'}
                </div>
              </div>
            );
          })}
        </div>

        {/* Active Step Scenario Box */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0B0C10] border border-white/15 max-w-3xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#D4D8E1]">
              Stage 0{journeySteps[activeStep].step} Case Scenario
            </div>
            <h4 className="text-lg font-medium text-[#F5F5F7]">
              {journeySteps[activeStep].title}
            </h4>
            <p className="text-xs sm:text-sm text-[#9FA6B2] font-light">
              {journeySteps[activeStep].detail}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsGoalFinderOpen(true)}
            className="px-6 py-3 text-xs font-medium tracking-wider uppercase text-[#050507] bg-[#F5F5F7] hover:bg-white rounded-full transition-all whitespace-nowrap cursor-pointer shrink-0 flex items-center gap-2"
          >
            <span>Start Your Journey</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="text-center text-[11px] text-[#9FA6B2]/60 mt-6 font-light">
          Illustrative pathway demonstrating community progression. Individual outcomes depend on merit, preparation, and mentor availability.
        </div>
      </div>
    </section>
  );
};
