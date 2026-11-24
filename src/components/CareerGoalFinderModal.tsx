import React, { useState, useEffect, useRef } from 'react';
import { X, Search, Sparkles, Check, RefreshCw } from 'lucide-react';
import { useAlumBridge } from '../context/AlumBridgeContext';
import { institutionName } from '../lib/appConfig';
import { Alumnus, CareerGoalFilter } from '../types';

const CAREER_GOALS = [
  'Software Engineering & Distributed Systems',
  'AI, Machine Learning & Frontier Research',
  'Product Management & Strategy',
  'Hardware, Silicon & Robotics',
  'Human-Centered Design & UX Architecture',
  'Computational Biology & Genomics',
  'Quantitative Finance & Algorithmic Trading',
  'Tech Entrepreneurship & YC Strategy',
];

const POPULAR_COMPANIES = [
  'Google', 'DeepMind', 'Figma', 'Microsoft', 'Tesla', 'Synthetix AI', 'Genentech', 'Apple', 'Meta', 'WorldQuant',
];

const POPULAR_SKILLS = [
  'Distributed Systems', 'PyTorch', 'System Design', 'Go', 'Kubernetes',
  'Figma Prototyping', 'Design Systems', 'Deep Learning', 'Applied Math',
  'VLSI', 'Verilog', 'Bioinformatics', 'Stochastic Calculus', 'Startup Fundraising',
];

const MENTORSHIP_TOPICS = [
  'System Design Prep',
  'PhD Applications & Fellowships',
  'Portfolio Critique',
  'Early-Stage Founder Strategy',
  'Biotech Careers',
  'Quant Finance Recruitment',
  'Transitioning from SWE to PM',
];

export const CareerGoalFinderModal: React.FC = () => {
  const { isGoalFinderOpen, setIsGoalFinderOpen, calculateMatches, setActiveProfile, setRequestModalAlumni } = useAlumBridge();

  const [goal, setGoal] = useState('Software Engineering & Distributed Systems');
  const [targetCompany, setTargetCompany] = useState('');
  const [department, setDepartment] = useState('All');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['Distributed Systems', 'System Design']);
  const [mentorshipTopic, setMentorshipTopic] = useState('System Design Prep');
  const [mentorExperience, setMentorExperience] = useState('Any');

  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Alumnus[] | null>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isGoalFinderOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsGoalFinderOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGoalFinderOpen, setIsGoalFinderOpen]);

  useEffect(() => {
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, []);

  if (!isGoalFinderOpen) return null;

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);

    const filter: CareerGoalFilter = {
      goal,
      targetCompany,
      department,
      selectedSkills,
      mentorExperience,
      mentorshipTopic,
    };

    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      const matches = calculateMatches(filter);
      setResults(matches);
      setIsLoading(false);
    }, 300);
  };

  const handleReset = () => {
    setGoal('Software Engineering & Distributed Systems');
    setTargetCompany('');
    setDepartment('All');
    setSelectedSkills(['Distributed Systems']);
    setMentorshipTopic('');
    setMentorExperience('Any');
    setResults(null);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="goal-finder-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={() => setIsGoalFinderOpen(false)}
      />

      <div className="relative w-full max-w-4xl bg-[#0B0C10] border border-white/15 rounded-2xl shadow-2xl text-[#F5F5F7] overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#050507]">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/15 flex items-center justify-center text-[#F5F5F7]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 id="goal-finder-modal-title" className="text-lg font-medium text-[#F5F5F7] leading-tight">
                Career Goal &amp; Mentor Matcher
              </h2>
              <p className="text-xs text-[#9FA6B2] mt-0.5">
                Transparent multi-criteria matching against available alumni profile information
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsGoalFinderOpen(false)}
            aria-label="Close career goal finder"
            className="p-2 text-[#9FA6B2] hover:text-white rounded-full hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <form onSubmit={handleSearch} className="space-y-6">
            {/* Step 1: Career Ambition */}
            <div>
              <span className="block text-[11px] font-medium text-[#D4D8E1] uppercase tracking-[0.16em] mb-2.5">
                1. Your Primary Career Target
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CAREER_GOALS.map((cg) => (
                  <button
                    key={cg}
                    type="button"
                    onClick={() => setGoal(cg)}
                    className={`p-3 text-left rounded-xl text-xs font-normal border transition-all flex items-center justify-between cursor-pointer ${
                      goal === cg
                        ? 'bg-[#F5F5F7] border-[#F5F5F7] text-[#050507] font-medium'
                        : 'bg-white/[0.03] border-white/10 text-[#9FA6B2] hover:border-white/25 hover:text-white'
                    }`}
                  >
                    <span>{cg}</span>
                    {goal === cg && <Check className="w-4 h-4 text-[#050507] shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Target Company, Department & Experience */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label
                  htmlFor="matcher-target-company"
                  className="block text-[11px] font-medium text-[#D4D8E1] uppercase tracking-[0.16em] mb-2"
                >
                  2. Target Organization or Company
                </label>
                <input
                  id="matcher-target-company"
                  type="text"
                  value={targetCompany}
                  onChange={(e) => setTargetCompany(e.target.value)}
                  placeholder="e.g. Google, DeepMind, Tesla, YC"
                  className="w-full px-3.5 py-2.5 text-xs bg-white/[0.04] border border-white/15 rounded-xl text-[#F5F5F7] placeholder-neutral-500 focus:outline-none focus:border-white/45"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {POPULAR_COMPANIES.slice(0, 6).map((comp) => (
                    <button
                      key={comp}
                      type="button"
                      onClick={() => setTargetCompany(comp)}
                      className={`px-2.5 py-1 text-[11px] rounded-full border transition-colors cursor-pointer ${
                        targetCompany === comp
                          ? 'bg-[#F5F5F7] text-[#050507] border-[#F5F5F7] font-medium'
                          : 'bg-white/[0.03] border-white/10 text-[#9FA6B2] hover:text-white'
                      }`}
                    >
                      {comp}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="matcher-department"
                    className="block text-[11px] font-medium text-[#D4D8E1] uppercase tracking-[0.16em] mb-2"
                  >
                    3. University Academic Department
                  </label>
                  <select
                    id="matcher-department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#14161C] border border-white/15 rounded-xl text-[#F5F5F7] focus:outline-none focus:border-white/45"
                  >
                    <option value="All">All Disciplines (Cross-functional)</option>
                    <option value="CSE">CSE — Computer Science &amp; Engineering</option>
                    <option value="ECE">ECE — Electronics &amp; Communication</option>
                    <option value="CSAM">CSAM — CS &amp; Applied Mathematics</option>
                    <option value="CB">CB — Computational Biology</option>
                    <option value="HCD">HCD — Human-Centered Design</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="matcher-topic"
                      className="block text-[11px] text-[#9FA6B2] mb-1"
                    >
                      Preferred Mentorship Topic
                    </label>
                    <select
                      id="matcher-topic"
                      value={mentorshipTopic}
                      onChange={(e) => setMentorshipTopic(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#14161C] border border-white/15 rounded-xl text-[#F5F5F7] focus:outline-none focus:border-white/45"
                    >
                      <option value="">Any topic offered</option>
                      {MENTORSHIP_TOPICS.map((topic) => (
                        <option key={topic} value={topic}>
                          {topic}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="matcher-experience"
                      className="block text-[11px] text-[#9FA6B2] mb-1"
                    >
                      Mentor Seniority
                    </label>
                    <select
                      id="matcher-experience"
                      value={mentorExperience}
                      onChange={(e) => setMentorExperience(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#14161C] border border-white/15 rounded-xl text-[#F5F5F7] focus:outline-none focus:border-white/45"
                    >
                      <option value="Any">Any experience</option>
                      <option value="5+">5+ years</option>
                      <option value="7+">7+ years (Staff / Principal)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Skills Filter */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-[#D4D8E1] uppercase tracking-[0.16em]">
                  4. Relevant Skills &amp; Tech Stack ({selectedSkills.length} selected)
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedSkills([])}
                  className="text-[11px] text-[#9FA6B2] hover:text-white underline cursor-pointer"
                >
                  Clear all
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_SKILLS.map((skill) => {
                  const isSelected = selectedSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1 text-xs rounded-full border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#F5F5F7] text-[#050507] border-[#F5F5F7] font-medium'
                          : 'bg-white/[0.03] border-white/10 text-[#9FA6B2] hover:border-white/25 hover:text-white'
                      }`}
                    >
                      {isSelected ? `✓ ${skill}` : `+ ${skill}`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1.5 text-xs text-[#9FA6B2] hover:text-white px-3 py-2 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Criteria</span>
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2.5 text-xs font-medium tracking-wider uppercase text-[#050507] bg-[#F5F5F7] hover:bg-white rounded-full transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing Profiles...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Run Match Algorithm</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Results Area */}
          {results && (
            <div className="pt-6 border-t border-white/10">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-[#F5F5F7] uppercase tracking-wider">
                    Recommended Mentors ({results.length})
                  </span>
                  <span className="text-[11px] text-[#9FA6B2]">
                    Ranked by explainable alignment
                  </span>
                </div>
                <span className="text-[11px] text-[#9FA6B2]">Sample demonstration dataset</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.slice(0, 4).map((alum) => (
                  <div
                    key={alum.id}
                    className="p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/30 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={alum.avatar}
                            alt={alum.name}
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 rounded-lg object-cover border border-white/15"
                          />
                          <div>
                            <div className="text-sm font-medium text-[#F5F5F7]">{alum.name}</div>
                            <div className="text-xs text-[#9FA6B2]">
                              {alum.role} <span className="text-[#F5F5F7]">@ {alum.company}</span>
                            </div>
                            <div className="text-[11px] text-[#9FA6B2]/75">
                              {institutionName} {alum.department} · Class of {alum.batchYear || '—'}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-xs font-mono font-medium text-[#F5F5F7] tabular-nums">
                            {alum.matchScore}% Match
                          </div>
                          {alum.availableForMentorship ? (
                            <span className="text-[10px] text-emerald-300">Accepting</span>
                          ) : (
                            <span className="text-[10px] text-neutral-500">Paused</span>
                          )}
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-[#050507] border border-white/10 text-[11px] text-[#9FA6B2] mb-3">
                        <span className="text-[#E4E7EE] font-medium">Match Rationale: </span>
                        {alum.matchReasons?.join(' · ')}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => {
                          setIsGoalFinderOpen(false);
                          setActiveProfile(alum);
                        }}
                        className="py-1.5 text-xs text-center font-normal text-[#F5F5F7] bg-white/[0.06] hover:bg-white/[0.12] rounded-full transition-colors cursor-pointer"
                      >
                        Full Profile
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsGoalFinderOpen(false);
                          setRequestModalAlumni(alum);
                        }}
                        disabled={!alum.availableForMentorship}
                        className={`py-1.5 text-xs text-center font-medium rounded-full transition-colors ${
                          alum.availableForMentorship
                            ? 'text-[#050507] bg-[#F5F5F7] hover:bg-white cursor-pointer'
                            : 'text-neutral-500 bg-white/5 cursor-not-allowed'
                        }`}
                      >
                        {alum.availableForMentorship ? 'Request Mentorship' : 'Unavailable'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
