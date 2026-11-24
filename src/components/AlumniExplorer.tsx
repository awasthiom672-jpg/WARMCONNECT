import React, { useState, useMemo } from 'react';
import { Search, RefreshCw, ArrowUpRight, Bookmark } from 'lucide-react';
import { useAlumBridge } from '../context/AlumBridgeContext';
import { institutionName } from '../lib/appConfig';

export const AlumniExplorer: React.FC = () => {
  const { alumni, savedAlumniIds, toggleSaveAlumnus, setActiveProfile, setRequestModalAlumni, dataLoading, dataError, hasMoreAlumni, loadingMoreAlumni, loadMoreAlumni, isDemoMode } = useAlumBridge();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [onlySaved, setOnlySaved] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<string>('All');
  const [batchRange, setBatchRange] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'relevance' | 'experience' | 'batch_desc'>('relevance');

  const allSkills = useMemo(() => {
    const set = new Set<string>();
    alumni.forEach((a) => a.skills.forEach((s) => set.add(s)));
    return Array.from(set).sort();
  }, [alumni]);

  const filteredAlumni = useMemo(() => {
    return alumni
      .filter((a) => {
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase().trim();
          const matchesName = a.name.toLowerCase().includes(query);
          const matchesRole = a.role.toLowerCase().includes(query);
          const matchesCompany = a.company.toLowerCase().includes(query);
          const matchesSkill = a.skills.some((s) => s.toLowerCase().includes(query));
          if (!matchesName && !matchesRole && !matchesCompany && !matchesSkill) {
            return false;
          }
        }

        if (selectedDept !== 'All' && a.department !== selectedDept) {
          return false;
        }

        if (onlyAvailable && !a.availableForMentorship) {
          return false;
        }

        if (onlySaved && !savedAlumniIds.includes(a.id)) {
          return false;
        }

        if (selectedSkill !== 'All' && !a.skills.includes(selectedSkill)) {
          return false;
        }

        if (batchRange === '2016-2018' && (a.batchYear < 2016 || a.batchYear > 2018)) {
          return false;
        }
        if (batchRange === '2019-2020' && (a.batchYear < 2019 || a.batchYear > 2020)) {
          return false;
        }
        if (batchRange === '2021+' && a.batchYear < 2021) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'experience') {
          return b.experienceYears - a.experienceYears;
        }
        if (sortBy === 'batch_desc') {
          return b.batchYear - a.batchYear;
        }
        return (b.matchScore ?? 0) - (a.matchScore ?? 0) || a.name.localeCompare(b.name);
      });
  }, [alumni, searchQuery, selectedDept, onlyAvailable, onlySaved, savedAlumniIds, selectedSkill, batchRange, sortBy]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedDept('All');
    setOnlyAvailable(false);
    setOnlySaved(false);
    setSelectedSkill('All');
    setBatchRange('All');
    setSortBy('relevance');
  };

  const hasActiveFilters =
    Boolean(searchQuery) ||
    selectedDept !== 'All' ||
    onlyAvailable ||
    onlySaved ||
    selectedSkill !== 'All' ||
    batchRange !== 'All';

  const departments = ['All', 'CSE', 'ECE', 'CSAM', 'CB', 'HCD'];

  return (
    <section id="alumni-explorer" className="py-28 bg-[#07080A] border-t border-white/10 text-[#F5F5F7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-8 border-b border-white/10">
          <div>
            <div className="text-[11px] font-medium tracking-[0.24em] uppercase text-[#9FA6B2] mb-3">
              Alumni Directory · Archive
            </div>
            <h2 className="text-3xl sm:text-5xl font-extralight text-[#F5F5F7] tracking-[-0.02em]">
              Explore Alumni &amp; <span className="font-normal chrome-text">Mentors</span>
            </h2>
            <p className="text-sm sm:text-base text-[#9FA6B2] font-light mt-3 max-w-xl">
              Discover staff engineers, researchers, founders, and designers across global technology leaders.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs text-[#9FA6B2] uppercase tracking-wider">Showing</span>
            <span className="text-sm font-mono font-medium text-[#F5F5F7] tabular-nums">
              {filteredAlumni.length} of {alumni.length} {hasMoreAlumni ? 'loaded profiles' : 'profiles'}
            </span>
          </div>
        </div>

        {/* Search & Filters Console */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#0B0C10] border border-white/10 mb-10 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            <div className="lg:col-span-6 relative">
              <Search className="w-4 h-4 text-[#9FA6B2] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <label htmlFor="alumni-search-input" className="sr-only">
                Search alumni by name, role, company, or skill
              </label>
              <input
                id="alumni-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, role, company (Google, DeepMind...), or skill..."
                className="w-full pl-10 pr-8 py-2.5 text-xs bg-white/[0.04] border border-white/12 rounded-xl text-[#F5F5F7] placeholder-neutral-500 focus:outline-none focus:border-white/45 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search query"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#9FA6B2] hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="lg:col-span-6 flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
              {departments.map((dept) => (
                <button
                  key={dept}
                  type="button"
                  onClick={() => setSelectedDept(dept)}
                  className={`px-3.5 py-2 text-xs font-medium rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                    selectedDept === dept
                      ? 'bg-[#F5F5F7] text-[#050507]'
                      : 'bg-white/[0.04] text-[#9FA6B2] hover:text-white hover:bg-white/[0.09] border border-white/10'
                  }`}
                >
                  {dept === 'All' ? 'All Branches' : dept}
                </button>
              ))}
            </div>
          </div>

          {/* Sub Filters Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10 text-xs text-[#9FA6B2]">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <label htmlFor="explorer-skill-select" className="text-[11px] uppercase tracking-wider">
                  Skill
                </label>
                <select
                  id="explorer-skill-select"
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value)}
                  className="bg-[#14161C] border border-white/15 text-[#F5F5F7] px-3 py-1.5 rounded-lg text-xs focus:outline-none focus:border-white/45"
                >
                  <option value="All">All Skills</option>
                  {allSkills.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="explorer-batch-select" className="text-[11px] uppercase tracking-wider">
                  Batch
                </label>
                <select
                  id="explorer-batch-select"
                  value={batchRange}
                  onChange={(e) => setBatchRange(e.target.value)}
                  className="bg-[#14161C] border border-white/15 text-[#F5F5F7] px-3 py-1.5 rounded-lg text-xs focus:outline-none focus:border-white/45"
                >
                  <option value="All">All Batches</option>
                  <option value="2016-2018">2016 – 2018 (Staff / Founders)</option>
                  <option value="2019-2020">2019 – 2020 (Senior)</option>
                  <option value="2021+">2021+ (Recent Graduates)</option>
                </select>
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none px-2 py-1 rounded hover:bg-white/5">
                <input
                  type="checkbox"
                  checked={onlyAvailable}
                  onChange={(e) => setOnlyAvailable(e.target.checked)}
                  className="rounded border-white/25 bg-white/5 text-[#F5F5F7] focus:ring-white/40"
                />
                <span className="text-[#D4D8E1]">Accepting Mentorship</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none px-2 py-1 rounded hover:bg-white/5">
                <input
                  type="checkbox"
                  checked={onlySaved}
                  onChange={(e) => setOnlySaved(e.target.checked)}
                  className="rounded border-white/25 bg-white/5 text-[#F5F5F7] focus:ring-white/40"
                />
                <span className="text-[#D4D8E1]">Shortlist ({savedAlumniIds.length})</span>
              </label>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label htmlFor="explorer-sort-select" className="text-[11px] uppercase tracking-wider">
                  Sort
                </label>
                <select
                  id="explorer-sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'relevance' | 'experience' | 'batch_desc')}
                  className="bg-[#14161C] border border-white/15 text-[#F5F5F7] px-3 py-1.5 rounded-lg text-xs focus:outline-none focus:border-white/45"
                >
                  <option value="relevance">{isDemoMode ? 'Example Match Relevance' : 'Name (A–Z)'}</option>
                  <option value="experience">Years of Experience</option>
                  <option value="batch_desc">Graduation Year</option>
                </select>
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-xs text-[#F5F5F7] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Alumni Grid */}
        {dataLoading ? (
          <div role="status" className="py-20 text-center text-sm text-[#9FA6B2]">Loading approved alumni profiles…</div>
        ) : dataError ? (
          <div role="alert" className="mx-auto max-w-lg rounded-2xl border border-red-300/15 bg-red-950/20 px-6 py-10 text-center text-sm text-red-200">The alumni directory could not be loaded. Please try again after checking the Supabase connection.</div>
        ) : filteredAlumni.length === 0 ? (
          <div className="text-center py-20 px-4 rounded-2xl bg-[#0B0C10] border border-white/10 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 text-[#9FA6B2]">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-medium text-[#F5F5F7] mb-2">No matching alumni found</h3>
            <p className="text-xs text-[#9FA6B2] font-light mb-6">
              Try adjusting your search criteria, selecting &ldquo;All Branches&rdquo;, or clearing active filters.
            </p>
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-6 py-2.5 text-xs font-medium tracking-wider uppercase text-[#050507] bg-[#F5F5F7] hover:bg-white rounded-full transition-colors cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAlumni.map((alum) => {
              const isSaved = savedAlumniIds.includes(alum.id);
              return (
                <div
                  key={alum.id}
                  className="p-6 rounded-2xl bg-[#0E1015] border border-white/10 hover:border-white/30 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start gap-4 mb-4">
                      <img
                        src={alum.avatar}
                        alt={alum.name}
                        referrerPolicy="no-referrer"
                        className="w-14 h-14 rounded-xl object-cover border border-white/15 shrink-0 grayscale-[20%] group-hover:grayscale-0 transition-all"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-base font-medium text-[#F5F5F7] truncate">
                            {alum.name}
                          </h3>
                          <button
                            type="button"
                            onClick={() => toggleSaveAlumnus(alum.id, alum.name)}
                            aria-label={isSaved ? `Remove ${alum.name} from shortlist` : `Save ${alum.name} to shortlist`}
                            aria-pressed={isSaved}
                            className={`p-1 rounded-md transition-colors cursor-pointer shrink-0 ${
                              isSaved
                                ? 'text-[#F5F5F7] bg-white/10'
                                : 'text-[#9FA6B2] hover:text-white hover:bg-white/5'
                            }`}
                          >
                            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                          </button>
                        </div>

                        <div className="text-xs text-[#9FA6B2] truncate mt-0.5">
                          {alum.role} <span className="text-[#E4E7EE] font-medium">@ {alum.company}</span>
                        </div>

                        {/* Unboxed Metadata */}
                        <div className="flex items-center flex-wrap gap-1.5 text-[11px] text-[#9FA6B2]/80 mt-1.5">
                          <span>{institutionName} {alum.department}</span>
                          <span aria-hidden="true">·</span>
                          <span>Class of {alum.batchYear}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">{alum.experienceYears}y exp</span>
                          <span aria-hidden="true">·</span>
                          <span className={alum.availableForMentorship ? 'text-emerald-300' : 'text-neutral-500'}>
                            {alum.availableForMentorship ? 'Available' : 'Paused'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-[#9FA6B2] font-light line-clamp-2 leading-relaxed mb-4">
                      {alum.bio}
                    </p>

                    <div className="text-[11px] text-[#D4D8E1]/85 leading-relaxed mb-5">
                      {alum.skills.slice(0, 4).join(' · ')}
                      {alum.skills.length > 4 && (
                        <span className="text-[#9FA6B2]/70"> · +{alum.skills.length - 4} more</span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 pt-4 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setActiveProfile(alum)}
                      className="py-2 px-3 text-xs font-normal text-center text-[#F5F5F7] bg-white/[0.04] hover:bg-white/[0.09] border border-white/12 rounded-full transition-colors cursor-pointer"
                    >
                      View Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => setRequestModalAlumni(alum)}
                      disabled={!alum.availableForMentorship}
                      className={`py-2 px-3 text-xs font-medium text-center rounded-full transition-colors flex items-center justify-center gap-1 ${
                        alum.availableForMentorship
                          ? 'text-[#050507] bg-[#F5F5F7] hover:bg-white cursor-pointer'
                          : 'text-neutral-500 bg-white/[0.04] border border-white/10 cursor-not-allowed'
                      }`}
                    >
                      <span>{alum.availableForMentorship ? 'Request' : 'Unavailable'}</span>
                      {alum.availableForMentorship && <ArrowUpRight className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {!dataLoading && !dataError && hasMoreAlumni && (
          <div className="mt-10 flex justify-center">
            <button type="button" onClick={() => void loadMoreAlumni()} disabled={loadingMoreAlumni} className="rounded-full border border-white/20 px-6 py-3 text-xs font-medium uppercase tracking-wider text-[#F5F5F7] transition hover:bg-white/5 disabled:cursor-wait disabled:opacity-50">
              {loadingMoreAlumni ? 'Loading more profiles…' : 'Load more alumni'}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
