import React from 'react';
import { ShieldCheck, Sparkles, HeartHandshake, Briefcase } from 'lucide-react';
import { institutionName } from '../lib/appConfig';

export const FeatureStrip: React.FC = () => {
  const features = [
    {
      index: '01',
      title: 'Reviewed Profiles',
      description: 'Alumni profiles become discoverable after administrator review. Institutional verification is claimed only when independently confirmed.',
      icon: ShieldCheck,
    },
    {
      index: '02',
      title: 'Personalized Matching',
      description: `Transparent alignment across engineering domains, technical disciplines, and ${institutionName} career interests.`,
      icon: Sparkles,
    },
    {
      index: '03',
      title: 'Structured Mentorship',
      description: 'Focused 1-on-1 strategy calls, systems critiques, and portfolio reviews without cold outreach friction.',
      icon: HeartHandshake,
    },
    {
      index: '04',
      title: 'Curated Pathways',
      description: 'Discover opportunities published by approved alumni and submit referral inquiries with clear status tracking.',
      icon: Briefcase,
    },
  ];

  return (
    <section className="py-20 bg-[#0B0C10] border-t border-b border-white/10 text-[#F5F5F7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/10 border border-white/10 rounded-2xl bg-[#0E1015]/60">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="p-7 transition-colors duration-300 hover:bg-white/[0.03] group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-mono text-[11px] tracking-[0.2em] text-[#9FA6B2]/70">
                      {feat.index}
                    </span>
                    <Icon className="w-4 h-4 text-[#D4D8E1] group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-base font-medium text-[#F5F5F7] tracking-tight mb-2.5">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-[#9FA6B2] font-light leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
