import React from 'react';
import { Target, Users, MessageSquare, ArrowUpRight } from 'lucide-react';
import { useAlumBridge } from '../context/AlumBridgeContext';
import { institutionName } from '../lib/appConfig';

export const HowItWorks: React.FC = () => {
  const { setIsGoalFinderOpen } = useAlumBridge();

  const steps = [
    {
      number: '01',
      title: 'Share Your Goal',
      description:
        'Specify your branch, technical ambitions, target organizations, and whether you are preparing for systems interviews, frontier research fellowships, or founding a startup.',
      icon: Target,
      tag: 'Define Direction',
    },
    {
      number: '02',
      title: 'Find Your People',
      description:
        'Transparent matching criteria compare approved alumni profiles against shared domains, stated interests, skills, and experience.',
      icon: Users,
      tag: 'Explainable Match',
    },
    {
      number: '03',
      title: 'Start a Conversation',
      description:
        'Request structured mentorship sessions or compose contextual outreach messages. Replace cold dead-ends with authentic institutional affinity.',
      icon: MessageSquare,
      tag: '1-on-1 Guidance',
    },
  ];

  return (
    <section id="how-it-works" className="py-28 bg-[#F5F5F3] text-[#0A0A0C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Section Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end pb-14 border-b border-black/10 mb-14">
          <div className="lg:col-span-7">
            <div className="text-[11px] font-medium tracking-[0.24em] uppercase text-neutral-500 mb-4">
              Exhibition Process · Three Movements
            </div>
            <h2 className="text-3xl sm:text-5xl font-extralight text-[#0A0A0C] tracking-[-0.02em] leading-[1.1]">
              From Quiet Ambition to{' '}
              <span className="font-normal">Meaningful Opportunity.</span>
            </h2>
          </div>
          <div className="lg:col-span-5 lg:text-right">
            <p className="text-sm sm:text-base text-neutral-600 font-light leading-relaxed max-w-md lg:ml-auto">
              A deliberate framework designed to connect students from the configured institution with relevant mentors at decisive moments.
            </p>
          </div>
        </div>

        {/* 3-Step Gallery Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="relative p-8 rounded-2xl bg-white border border-black/[0.08] hover:border-black/25 hover:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-10">
                    <span className="text-4xl font-extralight text-neutral-300 group-hover:text-[#0A0A0C] transition-colors font-mono tracking-tight">
                      {step.number}
                    </span>
                    <span className="text-[10px] font-medium text-neutral-500 uppercase tracking-[0.18em]">
                      {step.tag}
                    </span>
                  </div>

                  <div className="w-11 h-11 rounded-full border border-black/15 flex items-center justify-center text-[#0A0A0C] mb-6 group-hover:bg-[#0A0A0C] group-hover:text-[#F5F5F7] transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>

                  <h3 className="text-xl font-medium text-[#0A0A0C] tracking-tight mb-3">
                    {step.title}
                  </h3>

                  <p className="text-sm text-neutral-600 font-light leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="pt-6 mt-8 border-t border-black/[0.07] flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-neutral-500">
                  <span>Phase 0{idx + 1} / 03</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-[#0A0A0C] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Obsidian Architectural Action Banner */}
        <div className="mt-14 p-8 sm:p-10 rounded-2xl bg-[#050507] text-[#F5F5F7] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border border-black/10 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.28)]">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#9FA6B2] mb-2">
              Deterministic Alignment Engine
            </div>
            <h3 className="text-xl sm:text-2xl font-light text-[#F5F5F7] tracking-tight">
              Ready to find an alumnus aligned with your direction?
            </h3>
            <p className="text-xs sm:text-sm text-[#9FA6B2] font-light mt-1.5">
              Select your career target and evaluate match rationale across {institutionName} profiles.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsGoalFinderOpen(true)}
            className="px-7 py-3.5 text-xs font-medium tracking-[0.14em] uppercase text-[#050507] bg-[#F5F5F7] hover:bg-white rounded-full transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 shrink-0"
          >
            <span>Launch Mentor Matcher</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
