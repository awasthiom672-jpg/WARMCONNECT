/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { lazy, Suspense } from 'react';
import { WarmConnectProvider } from './context/WarmConnectContext';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { FeatureStrip } from './components/FeatureStrip';
import { HowItWorks } from './components/HowItWorks';
import { AlumniExplorer } from './components/AlumniExplorer';
import { NetworkVisualization } from './components/NetworkVisualization';
import { SmartIntroAssistant } from './components/SmartIntroAssistant';
import { OpportunitySection } from './components/OpportunitySection';
import { CareerJourneyTimeline } from './components/CareerJourneyTimeline';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';
import { useWarmConnect } from './context/WarmConnectContext';

const CareerGoalFinderModal = lazy(() => import('./components/CareerGoalFinderModal').then((module) => ({ default: module.CareerGoalFinderModal })));
const AlumniProfileModal = lazy(() => import('./components/AlumniProfileModal').then((module) => ({ default: module.AlumniProfileModal })));
const MentorshipRequestModal = lazy(() => import('./components/MentorshipRequestModal').then((module) => ({ default: module.MentorshipRequestModal })));
const MentorshipTrackerDrawer = lazy(() => import('./components/MentorshipTrackerDrawer').then((module) => ({ default: module.MentorshipTrackerDrawer })));
const LegalDocModal = lazy(() => import('./components/LegalDocModal').then((module) => ({ default: module.LegalDocModal })));
const AuthModal = lazy(() => import('./components/AuthModal').then((module) => ({ default: module.AuthModal })));
const AdminReviewPanel = lazy(() => import('./components/AdminReviewPanel').then((module) => ({ default: module.AdminReviewPanel })));

function AppContent() {
  const {
    isDemoMode,
    dataError,
    dataLoading,
    isGoalFinderOpen,
    activeProfile,
    requestModalAlumni,
    isTrackerOpen,
    legalDocModal,
    isAuthModalOpen,
    isAdminPanelOpen,
  } = useWarmConnect();
  const handleOpenSearch = () => {
    const explorerEl = document.getElementById('alumni-explorer');
    if (explorerEl) {
      explorerEl.scrollIntoView({ behavior: 'smooth' });
      const searchInput = explorerEl.querySelector('input');
      if (searchInput) window.setTimeout(() => searchInput.focus(), 500);
    }
  };

  return (
    <div className="min-h-screen bg-[#050507] text-[#F5F5F7] antialiased selection:bg-[#F5F5F7] selection:text-[#050507] flex flex-col font-sans">
      <Navbar onOpenSearch={handleOpenSearch} />
      {isDemoMode ? (
        <div role="status" className="mt-[76px] border-b border-amber-200/10 bg-[#14120D] px-4 py-2 text-center text-[11px] text-[#D7C69A]">
          Preview mode: sample profiles and listings are illustrative only. Configure Supabase for real accounts and persistent data.
        </div>
      ) : dataError ? (
        <div role="alert" className="mt-[76px] border-b border-red-300/15 bg-red-950/40 px-4 py-2 text-center text-[11px] text-red-200">
          Directory data is temporarily unavailable. Check your Supabase setup and network connection.
        </div>
      ) : dataLoading ? (
        <div className="mt-[76px] border-b border-white/10 bg-[#0B0C10] px-4 py-2 text-center text-[11px] text-[#9FA6B2]">Connecting to WARMCONNECT…</div>
      ) : null}

      <main className="flex-1">
        <HeroSection />
        <FeatureStrip />
        <HowItWorks />
        <AlumniExplorer />
        <NetworkVisualization />
        <SmartIntroAssistant />
        <OpportunitySection />
        <CareerJourneyTimeline />
      </main>
      <Footer />
      <Suspense fallback={null}>
        {isGoalFinderOpen && <CareerGoalFinderModal />}
        {activeProfile && <AlumniProfileModal />}
        {requestModalAlumni && <MentorshipRequestModal />}
        {isTrackerOpen && <MentorshipTrackerDrawer />}
        {legalDocModal && <LegalDocModal />}
        {isAuthModalOpen && <AuthModal />}
        {isAdminPanelOpen && <AdminReviewPanel />}
      </Suspense>
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <WarmConnectProvider>
      <AppContent />
    </WarmConnectProvider>
  );
}
