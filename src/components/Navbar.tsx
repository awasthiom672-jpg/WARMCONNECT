import React, { useState, useEffect } from 'react';
import { Search, Menu, X, ArrowUpRight, Inbox, ShieldCheck, UserRound } from 'lucide-react';
import { useWarmConnect } from '../context/WarmConnectContext';
import { NotificationCenter } from './NotificationCenter';

interface NavbarProps {
  onOpenSearch?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSearch }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { setIsGoalFinderOpen, setIsTrackerOpen, requests, user, setIsAuthModalOpen, setIsAdminPanelOpen } = useWarmConnect();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const pendingRequestsCount = requests.filter(r => r.status === 'pending').length;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-[#050507]/90 backdrop-blur-md border-b border-white/10 py-3.5'
            : 'bg-transparent py-5 border-b border-white/5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-8">
            {/* Zone 1: Single-line Brand Wordmark */}
            <a
              href="#top"
              className="text-lg font-medium tracking-[0.14em] uppercase text-[#F5F5F7] whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 rounded px-1"
            >
              WARM<span className="font-light text-[#9FA6B2]">CONNECT</span>
            </a>

            {/* Zone 2: 4-5 Concise Single-line Navigation Links */}
            <nav aria-label="Primary Navigation" className="hidden lg:flex items-center gap-8 text-xs font-normal tracking-[0.12em] uppercase text-[#9FA6B2]">
              <a
                href="#alumni-explorer"
                className="hover:text-[#F5F5F7] transition-colors whitespace-nowrap shrink-0 relative py-1 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1px] after:bg-[#F5F5F7] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left"
              >
                Alumni
              </a>
              <a
                href="#how-it-works"
                className="hover:text-[#F5F5F7] transition-colors whitespace-nowrap shrink-0 relative py-1 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1px] after:bg-[#F5F5F7] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left"
              >
                Process
              </a>
              <a
                href="#network-graph"
                className="hover:text-[#F5F5F7] transition-colors whitespace-nowrap shrink-0 relative py-1 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1px] after:bg-[#F5F5F7] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left"
              >
                Network
              </a>
              <a
                href="#opportunities"
                className="hover:text-[#F5F5F7] transition-colors whitespace-nowrap shrink-0 relative py-1 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1px] after:bg-[#F5F5F7] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left"
              >
                Opportunities
              </a>
              <a
                href="#message-assistant"
                className="hover:text-[#F5F5F7] transition-colors whitespace-nowrap shrink-0 relative py-1 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1px] after:bg-[#F5F5F7] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left"
              >
                Outreach
              </a>
            </nav>

            {/* Zone 3: Primary Actions */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={onOpenSearch}
                aria-label="Search alumni"
                className="p-2 text-[#9FA6B2] hover:text-[#F5F5F7] rounded-full hover:bg-white/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                title="Search alumni directory"
              >
                <Search className="w-4 h-4" />
              </button>

              <NotificationCenter />
              <button
                type="button"
                onClick={() => setIsTrackerOpen(true)}
                aria-label={`View mentorship requests (${requests.length})`}
                className="hidden sm:flex items-center gap-2 px-3.5 py-2 text-xs font-normal tracking-wider uppercase text-[#D4D8E1] hover:text-white rounded-full border border-white/15 hover:border-white/35 hover:bg-white/5 transition-all whitespace-nowrap shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                <Inbox className="w-3.5 h-3.5 text-[#9FA6B2]" />
                <span>Requests</span>
                <span className="font-mono text-[11px] text-[#F5F5F7] tabular-nums">
                  {pendingRequestsCount > 0 ? `${pendingRequestsCount}/${requests.length}` : requests.length}
                </span>
              </button>

              {user?.role === 'admin' && (
                <button type="button" onClick={() => setIsAdminPanelOpen(true)} aria-label="Open alumni verification queue" className="hidden xl:inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3.5 py-2 text-xs uppercase tracking-wider text-[#D4D8E1] hover:border-white/35 hover:text-white">
                  <ShieldCheck className="h-3.5 w-3.5" /> Admin
                </button>
              )}
              <button type="button" onClick={() => setIsAuthModalOpen(true)} aria-label={user ? 'Open account settings' : 'Sign in or create an account'} className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3.5 py-2 text-xs uppercase tracking-wider text-[#D4D8E1] hover:border-white/35 hover:text-white">
                <UserRound className="h-3.5 w-3.5" /> {user ? 'Account' : 'Sign in'}
              </button>

              <button
                type="button"
                onClick={() => setIsGoalFinderOpen(true)}
                className="hidden sm:flex items-center gap-2 px-5 py-2 text-xs font-medium tracking-wider uppercase text-[#050507] bg-[#F5F5F7] hover:bg-white active:scale-[0.98] rounded-full transition-all whitespace-nowrap shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050507] focus-visible:ring-white"
              >
                <span>Find My Mentor</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>

              {/* Mobile menu button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle Navigation Menu"
                aria-expanded={mobileMenuOpen}
                className="lg:hidden p-2 text-[#9FA6B2] hover:text-white rounded-full hover:bg-white/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
          className="fixed inset-0 z-50 lg:hidden"
        >
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed right-0 top-0 bottom-0 w-full max-w-xs bg-[#0B0C10] border-l border-white/10 p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-white/10">
                <span className="text-base font-medium tracking-[0.14em] uppercase text-[#F5F5F7]">
                  WARM<span className="font-light text-[#9FA6B2]">CONNECT</span>
                </span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close navigation menu"
                  className="p-2 text-[#9FA6B2] hover:text-white rounded-full hover:bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="mt-6 flex flex-col gap-3 text-sm font-light tracking-wide">
                <a
                  href="#alumni-explorer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[#9FA6B2] hover:text-white py-2.5 border-b border-white/5"
                >
                  Alumni Archive
                </a>
                <a
                  href="#how-it-works"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[#9FA6B2] hover:text-white py-2.5 border-b border-white/5"
                >
                  Process
                </a>
                <a
                  href="#network-graph"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[#9FA6B2] hover:text-white py-2.5 border-b border-white/5"
                >
                  Network Graph
                </a>
                <a
                  href="#opportunities"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[#9FA6B2] hover:text-white py-2.5 border-b border-white/5"
                >
                  Opportunities & Referrals
                </a>
                <a
                  href="#message-assistant"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[#9FA6B2] hover:text-white py-2.5 border-b border-white/5"
                >
                  Outreach Assistant
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsTrackerOpen(true);
                  }}
                  className="text-left text-[#9FA6B2] hover:text-white py-2.5 border-b border-white/5 flex items-center justify-between"
                >
                  <span>My Mentorship Requests</span>
                  <span className="text-xs font-mono text-[#F5F5F7] tabular-nums">{requests.length}</span>
                </button>
              </nav>
            </div>

            <div className="pt-6 border-t border-white/10 flex flex-col gap-3">
              {user?.role === 'admin' && (
                <button type="button" onClick={() => { setMobileMenuOpen(false); setIsAdminPanelOpen(true); }} className="w-full rounded-full border border-white/15 py-3 text-center text-xs uppercase tracking-wider text-[#D4D8E1]">Open verification queue</button>
              )}
              <button type="button" onClick={() => { setMobileMenuOpen(false); setIsAuthModalOpen(true); }} className="w-full rounded-full border border-white/15 py-3 text-center text-xs uppercase tracking-wider text-[#D4D8E1]">{user ? 'Account settings' : 'Sign in / Create account'}</button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsGoalFinderOpen(true);
                }}
                className="w-full py-3 text-center text-xs font-medium tracking-wider uppercase text-[#050507] bg-[#F5F5F7] hover:bg-white rounded-full transition-colors"
              >
                Find My Mentor
              </button>
              <p className="text-center text-[11px] tracking-wider uppercase text-[#9FA6B2]/70">
                WARMCONNECT Alumni Network
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
