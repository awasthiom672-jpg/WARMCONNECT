import React, { useState, useRef, useEffect, useCallback, Suspense, lazy } from 'react';
import { ArrowUpRight, Compass, ShieldCheck, Sparkles, CheckCircle2, Award, Users } from 'lucide-react';
import { useAlumBridge } from '../context/AlumBridgeContext';
import { institutionName } from '../lib/appConfig';

const SphericalSculptureCanvas = lazy(() =>
  import('./SphericalSculptureCanvas').then((m) => ({ default: m.SphericalSculptureCanvas }))
);

export const HeroSection: React.FC = () => {
  const { setIsGoalFinderOpen, setActiveProfile, setRequestModalAlumni, alumni, isDemoMode } = useAlumBridge();
  const stageRef = useRef<HTMLDivElement>(null);

  const targetCoords = useRef({ x: 0, y: 0 });
  const currentCoords = useRef({ x: 0, y: 0 });
  const rafId = useRef<number | null>(null);
  const isAnimating = useRef(false);

  const [transformValues, setTransformValues] = useState({
    rotateX: 0,
    rotateY: 0,
    pointerX: 0,
    pointerY: 0,
    lightX: 50,
    lightY: 50,
  });

  const [hoveredCard, setHoveredCard] = useState<'main' | 'sat1' | 'sat2' | 'sat3' | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const checkCapabilities = () => {
      const isCoarse = window.matchMedia('(pointer: coarse)').matches;
      const isSmall = window.innerWidth < 1024;
      setIsTouchDevice(isCoarse || isSmall);

      const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(motionQuery.matches);
    };

    checkCapabilities();
    window.addEventListener('resize', checkCapabilities);
    return () => window.removeEventListener('resize', checkCapabilities);
  }, []);

  const updateLoop = useCallback(() => {
    if (prefersReducedMotion || isTouchDevice) {
      isAnimating.current = false;
      return;
    }

    const factor = 0.075;
    const dx = targetCoords.current.x - currentCoords.current.x;
    const dy = targetCoords.current.y - currentCoords.current.y;

    currentCoords.current.x += dx * factor;
    currentCoords.current.y += dy * factor;

    const maxRotY = 5.0;
    const maxRotX = 4.2;

    const rotY = currentCoords.current.x * maxRotY;
    const rotX = -currentCoords.current.y * maxRotX;

    const lightX = 50 + currentCoords.current.x * 20;
    const lightY = 50 + currentCoords.current.y * 20;

    setTransformValues({
      rotateX: Number(rotX.toFixed(3)),
      rotateY: Number(rotY.toFixed(3)),
      pointerX: Number(currentCoords.current.x.toFixed(3)),
      pointerY: Number(currentCoords.current.y.toFixed(3)),
      lightX: Number(lightX.toFixed(1)),
      lightY: Number(lightY.toFixed(1)),
    });

    const isStationary =
      Math.abs(dx) < 0.001 &&
      Math.abs(dy) < 0.001 &&
      Math.abs(targetCoords.current.x) === 0 &&
      Math.abs(targetCoords.current.y) === 0;

    if (!isStationary) {
      rafId.current = requestAnimationFrame(updateLoop);
    } else {
      isAnimating.current = false;
    }
  }, [prefersReducedMotion, isTouchDevice]);

  const startAnimation = () => {
    if (!isAnimating.current && !prefersReducedMotion && !isTouchDevice) {
      isAnimating.current = true;
      rafId.current = requestAnimationFrame(updateLoop);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isTouchDevice || prefersReducedMotion) return;
    if (!stageRef.current) return;

    const rect = stageRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const normX = Math.max(-1, Math.min(1, (clientX / rect.width) * 2 - 1));
    const normY = Math.max(-1, Math.min(1, (clientY / rect.height) * 2 - 1));

    targetCoords.current = { x: normX, y: normY };
    startAnimation();
  };

  const handlePointerLeave = () => {
    targetCoords.current = { x: 0, y: 0 };
    setHoveredCard(null);
    startAnimation();
  };

  useEffect(() => {
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  const topMatch = alumni[0];
  const sat1 = alumni[1];
  const sat2 = alumni[3];
  const sat3 = alumni[2];

  const { rotateX, rotateY, pointerX, pointerY, lightX, lightY } = transformValues;

  return (
    <section
      id="top"
      className="relative min-h-screen pt-28 pb-20 flex items-center bg-[#050507] overflow-hidden"
    >
      {/* Ambient Radial Studio Backdrop & 3D Spherical Sculpture Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 70% 60% at 68% 46%, rgba(255,255,255,0.06) 0%, rgba(20,22,28,0.45) 45%, #050507 82%)',
          }}
        />
        <div className="hidden lg:block absolute inset-y-0 right-0 w-[62%] opacity-90">
          <Suspense fallback={null}>
            <SphericalSculptureCanvas
              pointerX={pointerX}
              pointerY={pointerY}
              reducedMotion={prefersReducedMotion}
            />
          </Suspense>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-10 items-center">
          {/* Left Column: Museum Editorial Typography & CTAs */}
          <div className="lg:col-span-6 flex flex-col items-start text-left z-20">
            {/* Quiet Unboxed Gallery Kicker */}
            <div className="text-[11px] font-medium tracking-[0.26em] uppercase text-[#9FA6B2] mb-6">
              {institutionName} Alumni Network · Curated Mentorship
            </div>

            {/* Oversized Thin & Regular Editorial Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[4rem] font-extralight text-[#F5F5F7] tracking-[-0.025em] leading-[1.08] mb-7 [text-wrap:balance]">
              Your next opportunity might be one{' '}
              <span className="font-normal chrome-text">conversation away.</span>
            </h1>

            {/* Supporting Editorial Copy */}
            <p className="text-base sm:text-lg text-[#9FA6B2] font-light leading-relaxed mb-10 max-w-xl">
              Connect with alumni who understand your goals, share your discipline,
              and guide your next step across engineering, frontier research, design, and ventures.
            </p>

            {/* Minimal Luxury CTAs */}
            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto mb-12">
              <button
                type="button"
                onClick={() => setIsGoalFinderOpen(true)}
                className="w-full sm:w-auto px-8 py-3.5 text-xs font-medium tracking-[0.14em] uppercase text-[#050507] bg-[#F5F5F7] hover:bg-white active:scale-[0.98] rounded-full transition-all shadow-[0_12px_40px_rgba(255,255,255,0.12)] flex items-center justify-center gap-2.5 group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <span>Find My Mentor</span>
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>

              <a
                href="#alumni-explorer"
                className="w-full sm:w-auto px-7 py-3.5 text-xs font-normal tracking-[0.14em] uppercase text-[#F5F5F7] hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/15 hover:border-white/30 rounded-full transition-all flex items-center justify-center gap-2"
              >
                <Compass className="w-3.5 h-3.5 text-[#9FA6B2]" />
                <span>Explore Alumni</span>
              </a>
            </div>

            {/* Quiet Institutional Metadata */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-5 border-t border-white/10 w-full max-w-md text-xs text-[#9FA6B2]">
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#E4E7EE] shrink-0" />
                <span>Built for students. Powered by community.</span>
              </span>
              <span aria-hidden="true" className="hidden sm:inline text-white/25">·</span>
              <span className="font-mono text-[11px] tracking-wider uppercase text-[#9FA6B2]/80">
                Illustrative Network
              </span>
            </div>
          </div>

          {/* Right Column: Interactive 3D Alumni Matching Exhibition Stage */}
          <div
            ref={stageRef}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            data-testid="hero-3d-stage"
            className="lg:col-span-6 relative flex items-center justify-center min-h-[540px] sm:min-h-[600px] w-full py-20 sm:px-10"
            style={{ touchAction: 'pan-y' }}
          >
            {/* Mobile / Tablet Spherical Accent Backdrop (shown when desktop Three.js half-width layer is hidden) */}
            <div className="lg:hidden absolute inset-0 -z-10 opacity-75">
              <Suspense fallback={null}>
                <SphericalSculptureCanvas
                  pointerX={pointerX}
                  pointerY={pointerY}
                  reducedMotion={prefersReducedMotion}
                />
              </Suspense>
            </div>

            {/* 3D Perspective Stage Container */}
            <div
              data-testid="hero-3d-card-container"
              className="relative w-full max-w-[390px] transition-transform duration-300 ease-out"
              style={{
                perspective: '1300px',
                transformStyle: 'preserve-3d',
                transform:
                  !isTouchDevice && !prefersReducedMotion
                    ? `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
                    : 'none',
              }}
            >
              {topMatch ? (
                <>
              {/* SECONDARY CARD 1: Orbiting Above Right */}
              {sat1 && (
              <div
                onClick={() => setActiveProfile(sat1)}
                onMouseEnter={() => setHoveredCard('sat1')}
                onMouseLeave={() => setHoveredCard(null)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveProfile(sat1);
                  }
                }}
                aria-label={`View profile for ${sat1.name}`}
                className={`hidden sm:flex absolute bottom-[calc(100%+18px)] -right-6 lg:-right-10 items-center gap-3 p-3.5 rounded-2xl bg-[#111318]/95 backdrop-blur-md border text-[#F5F5F7] cursor-pointer select-none transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                  hoveredCard === 'sat1'
                    ? 'z-40 border-white/55 shadow-[0_24px_48px_rgba(0,0,0,0.85)] scale-[1.03]'
                    : 'z-20 border-white/15 shadow-[0_14px_32px_rgba(0,0,0,0.6)] hover:border-white/35'
                }`}
                style={{
                  transformStyle: 'preserve-3d',
                  transform:
                    !isTouchDevice && !prefersReducedMotion
                      ? `translate3d(${
                          rotateY * 2.2 + (hoveredCard === 'main' ? 10 : 0)
                        }px, ${
                          rotateX * 2.2 + (hoveredCard === 'main' ? -10 : 0)
                        }px, ${
                          hoveredCard === 'sat1' ? '92px' : '26px'
                        }) rotate(${hoveredCard === 'sat1' ? '0deg' : '1.8deg'})`
                      : 'none',
                  backfaceVisibility: 'hidden',
                }}
              >
                <img
                  src={sat1.avatar}
                  alt={sat1.name}
                  referrerPolicy="no-referrer"
                  className="w-11 h-11 rounded-xl object-cover border border-white/20 shrink-0"
                />
                <div className="text-left min-w-[155px]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-[#F5F5F7] tracking-tight">
                      {sat1.name}
                    </span>
                    <span className="text-[10px] font-mono text-[#E4E7EE] tabular-nums">
                      {sat1.matchScore != null ? `${sat1.matchScore}%` : 'Profile'}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#9FA6B2] truncate">
                    {sat1.role} · {sat1.company}
                  </div>
                  <div className="text-[10px] text-[#9FA6B2]/80 mt-0.5 font-mono">
                    {sat1.department} · Class of {sat1.batchYear || '—'}
                  </div>
                </div>
              </div>
              )}

              {/* SECONDARY CARD 2: Orbiting Below Left (Kabir Mehta) */}
              {sat2 && (
              <div
                onClick={() => setActiveProfile(sat2)}
                onMouseEnter={() => setHoveredCard('sat2')}
                onMouseLeave={() => setHoveredCard(null)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveProfile(sat2);
                  }
                }}
                aria-label={`View profile for ${sat2.name}`}
                className={`hidden sm:flex absolute top-[calc(100%+18px)] -left-8 lg:-left-12 items-center gap-3 p-3.5 rounded-2xl bg-[#111318]/95 backdrop-blur-md border text-[#F5F5F7] cursor-pointer select-none transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                  hoveredCard === 'sat2'
                    ? 'z-40 border-white/55 shadow-[0_24px_48px_rgba(0,0,0,0.85)] scale-[1.03]'
                    : 'z-20 border-white/15 shadow-[0_14px_32px_rgba(0,0,0,0.6)] hover:border-white/35'
                }`}
                style={{
                  transformStyle: 'preserve-3d',
                  transform:
                    !isTouchDevice && !prefersReducedMotion
                      ? `translate3d(${
                          rotateY * -2.2 + (hoveredCard === 'main' ? -10 : 0)
                        }px, ${
                          rotateX * -2.2 + (hoveredCard === 'main' ? 10 : 0)
                        }px, ${
                          hoveredCard === 'sat2' ? '92px' : '22px'
                        }) rotate(${hoveredCard === 'sat2' ? '0deg' : '-2deg'})`
                      : 'none',
                  backfaceVisibility: 'hidden',
                }}
              >
                <img
                  src={sat2.avatar}
                  alt={sat2.name}
                  referrerPolicy="no-referrer"
                  className="w-11 h-11 rounded-xl object-cover border border-white/20 shrink-0"
                />
                <div className="text-left min-w-[150px]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-[#F5F5F7] tracking-tight">
                      {sat2.name}
                    </span>
                    <span className="text-[10px] font-mono text-[#D4D8E1] tabular-nums">
                      {sat2.matchScore != null ? `${sat2.matchScore}%` : 'Profile'}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#9FA6B2] truncate">
                    {sat2.role} · {sat2.company}
                  </div>
                  <div className="text-[10px] text-[#9FA6B2]/80 mt-0.5 font-mono">
                    {sat2.department} · Class of {sat2.batchYear || '—'}
                  </div>
                </div>
              </div>
              )}

              {/* SECONDARY CARD 3: Orbiting Below Right (Ananya Das) */}
              {sat3 && (
              <div
                onClick={() => setActiveProfile(sat3)}
                onMouseEnter={() => setHoveredCard('sat3')}
                onMouseLeave={() => setHoveredCard(null)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveProfile(sat3);
                  }
                }}
                aria-label={`View profile for ${sat3.name}`}
                className={`hidden sm:flex absolute top-[calc(100%+26px)] -right-8 lg:-right-12 items-center gap-3 p-3 rounded-2xl bg-[#111318]/95 backdrop-blur-md border text-[#F5F5F7] cursor-pointer select-none transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                  hoveredCard === 'sat3'
                    ? 'z-40 border-white/55 shadow-[0_24px_48px_rgba(0,0,0,0.85)] scale-[1.03]'
                    : 'z-20 border-white/15 shadow-[0_14px_32px_rgba(0,0,0,0.6)] hover:border-white/35'
                }`}
                style={{
                  transformStyle: 'preserve-3d',
                  transform:
                    !isTouchDevice && !prefersReducedMotion
                      ? `translate3d(${
                          rotateY * 1.8 + (hoveredCard === 'main' ? 10 : 0)
                        }px, ${
                          rotateX * 1.8 + (hoveredCard === 'main' ? 10 : 0)
                        }px, ${
                          hoveredCard === 'sat3' ? '92px' : '24px'
                        }) rotate(${hoveredCard === 'sat3' ? '0deg' : '1.6deg'})`
                      : 'none',
                  backfaceVisibility: 'hidden',
                }}
              >
                <img
                  src={sat3.avatar}
                  alt={sat3.name}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-xl object-cover border border-white/20 shrink-0"
                />
                <div className="text-left min-w-[130px]">
                  <div className="text-xs font-medium text-[#F5F5F7] tracking-tight">
                    {sat3.name}
                  </div>
                  <div className="text-[11px] text-[#9FA6B2] truncate">
                    {sat3.role} · {sat3.company}
                  </div>
                  <div className="text-[10px] text-[#9FA6B2]/80 font-mono">
                    {sat3.department} · Class of {sat3.batchYear || '—'}
                  </div>
                </div>
              </div>
              )}

              {/* MAIN GALLERY MATCH CARD */}
              <div
                onMouseEnter={() => setHoveredCard('main')}
                onMouseLeave={() => setHoveredCard(null)}
                className={`relative bg-[#F7F7F5] rounded-2xl p-6 sm:p-7 text-[#0A0A0C] transition-all duration-300 border ${
                  hoveredCard === 'main'
                    ? 'z-40 border-white shadow-[0_38px_84px_-15px_rgba(0,0,0,0.88)]'
                    : 'z-30 border-white/70 shadow-[0_28px_64px_-12px_rgba(0,0,0,0.75)]'
                }`}
                style={{
                  transformStyle: 'preserve-3d',
                  transform:
                    !isTouchDevice && !prefersReducedMotion
                      ? `translate3d(0, 0, ${hoveredCard === 'main' ? '76px' : '50px'})`
                      : 'none',
                  backfaceVisibility: 'hidden',
                }}
              >
                {/* Dynamic Specular Sheen */}
                <div
                  className="absolute inset-0 rounded-2xl pointer-events-none opacity-45 transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(circle at ${lightX}% ${lightY}%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 65%)`,
                  }}
                />

                {/* Card Top Row */}
                <div className="relative z-10 flex items-center justify-between gap-4 pb-4 border-b border-black/10">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-full bg-[#0A0A0C] text-[#F5F5F7] flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5" />
                    </span>
                    <div>
                      <span className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#0A0A0C] block">
                        {isDemoMode ? 'Illustrative Match' : 'Featured Alumni Profile'}
                      </span>
                      <span className="text-[10px] text-neutral-500 font-normal block">
                        {isDemoMode ? 'Demonstration data only' : 'Approved alumni directory'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-[#0A0A0C] tabular-nums">
                    <CheckCircle2 className="w-3.5 h-3.5 text-neutral-700" />
                    <span>{isDemoMode && topMatch.matchScore != null ? `Example: ${topMatch.matchScore}%` : 'Approved profile'}</span>
                  </div>
                </div>

                {/* Profile Snapshot */}
                <div className="relative z-10 flex items-center gap-4 my-5">
                  <div className="relative shrink-0">
                    <img
                      src={topMatch.avatar}
                      alt={topMatch.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-xl object-cover border border-black/10 shadow-sm"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#0A0A0C] border border-white flex items-center justify-center">
                      <Award className="w-3 h-3 text-[#F5F5F7]" />
                    </div>
                  </div>

                  <div className="text-left flex-1 min-w-0">
                    <h2 className="text-lg font-medium text-[#0A0A0C] leading-tight truncate">
                      {topMatch.name}
                    </h2>
                    <p className="text-xs sm:text-sm font-normal text-neutral-600 mt-0.5 truncate">
                      {topMatch.role} <span className="text-[#0A0A0C] font-medium">@ {topMatch.company}</span>
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-neutral-500 mt-1">
                      <span>{institutionName} {topMatch.department}</span>
                      <span aria-hidden="true">·</span>
                      <span>Class of {topMatch.batchYear || '—'}</span>
                    </div>
                  </div>
                </div>

                {/* Clean Unboxed Skills Metadata */}
                <div className="relative z-10 text-xs text-neutral-600 mb-4 leading-relaxed">
                  {topMatch.skills.slice(0, 4).join(' · ')}
                </div>

                {/* Explainable Match Rationale Box */}
                <div className="relative z-10 p-3.5 rounded-xl bg-black/[0.04] border border-black/[0.08] text-xs text-neutral-700 mb-6 leading-relaxed">
                  <span className="font-semibold text-[#0A0A0C]">Match Rationale: </span>
                  {topMatch.matchReasons?.join(' · ') || 'Explore the profile and compare its listed skills, experience and mentorship topics with your goals.'}
                </div>

                {/* Interactive Card Action Buttons */}
                <div className="relative z-10 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveProfile(topMatch);
                    }}
                    className="w-full py-2.5 px-3 text-xs font-medium text-[#0A0A0C] bg-black/[0.06] hover:bg-black/[0.12] active:scale-[0.98] rounded-full transition-all cursor-pointer text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-black/40"
                  >
                    View Profile
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setRequestModalAlumni(topMatch);
                    }}
                    className="w-full py-2.5 px-3 text-xs font-medium text-[#F5F5F7] bg-[#0A0A0C] hover:bg-neutral-800 active:scale-[0.98] rounded-full transition-all cursor-pointer text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
                  >
                    Request Introduction
                  </button>
                </div>
              </div>
                </>
              ) : (
                <div className="relative z-10 w-full max-w-sm rounded-2xl border border-white/15 bg-[#111318]/90 p-7 text-center backdrop-blur">
                  <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10"><Users className="h-5 w-5 text-[#D4D8E1]" /></div>
                  <h2 className="text-sm font-medium text-[#F5F5F7]">Your alumni network starts here</h2>
                  <p className="mt-2 text-xs leading-relaxed text-[#9FA6B2]">Alumni profiles appear here after an AlumBridge administrator approves their submitted evidence.</p>
                  <button type="button" onClick={() => setIsGoalFinderOpen(true)} className="mt-5 rounded-full border border-white/20 px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-[#F5F5F7] hover:bg-white/5">Explore mentor matching</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
