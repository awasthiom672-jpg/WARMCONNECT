import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { Alumnus, MentorshipRequest, CareerGoalFilter, LegalDocType, Opportunity } from '../types';
import { DEMO_ALUMNI, DEMO_OPPORTUNITIES } from '../data/mockData';
import { hasSupabaseConfig, supabase } from '../lib/supabase';
import { institutionName } from '../lib/appConfig';
import {
  type AppUser,
  type SignUpInput,
  type ProfileUpdateInput,
  type VerificationSubmission,
  type OpportunityInput,
  type AppNotification,
  type ReferralRequestItem,
  type ReferralStatusMap,
  fetchAlumni,
  fetchAppUser,
  fetchOpportunities,
  fetchUserRequests,
  fetchSavedAlumni,
  fetchReferralIds,
  fetchReferralStatusMap,
  fetchIncomingReferralRequests,
  updateReferralRequestStatus,
  signIn as signInService,
  signUp as signUpService,
  signOut as signOutService,
  sendPasswordReset,
  updatePassword,
  updateOwnProfile,
  createMentorshipRequest,
  updateMentorshipStatus,
  saveAlumni,
  unsaveAlumni,
  createReferralRequest,
  uploadAlumniVerification,
  fetchOwnVerification,
  createOpportunity as createOpportunityService,
  updateOpportunity as updateOpportunityService,
  deleteOpportunity as deleteOpportunityService,
  fetchUserNotifications,
  markUserNotificationRead,
} from '../services/alumBridgeService';

interface ToastData {
  message: string;
  type?: 'success' | 'info' | 'error';
}

interface AlumBridgeContextType {
  alumni: Alumnus[];
  opportunities: Opportunity[];
  notifications: AppNotification[];
  referralStatuses: ReferralStatusMap;
  incomingReferralRequests: ReferralRequestItem[];
  respondToReferralRequest: (id: string, status: 'acknowledged' | 'declined') => Promise<void>;
  refreshNotifications: () => Promise<void>;
  markNotificationRead: (notificationId: string) => Promise<void>;
  requests: MentorshipRequest[];
  requestedReferralIds: string[];
  savedAlumniIds: string[];
  activeProfile: Alumnus | null;
  setActiveProfile: (alumnus: Alumnus | null) => void;
  requestModalAlumni: Alumnus | null;
  setRequestModalAlumni: (alumnus: Alumnus | null) => void;
  isGoalFinderOpen: boolean;
  setIsGoalFinderOpen: (open: boolean) => void;
  isTrackerOpen: boolean;
  setIsTrackerOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isAdminPanelOpen: boolean;
  setIsAdminPanelOpen: (open: boolean) => void;
  legalDocModal: LegalDocType;
  setLegalDocModal: (doc: LegalDocType) => void;
  toast: ToastData | null;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  dismissToast: () => void;
  submitMentorshipRequest: (req: Omit<MentorshipRequest, 'id' | 'status' | 'createdAt'>) => Promise<boolean | string>;
  cancelMentorshipRequest: (id: string) => Promise<void>;
  respondToMentorshipRequest: (id: string, status: 'accepted' | 'declined') => Promise<void>;
  toggleReferralRequest: (opportunity: Opportunity) => Promise<boolean>;
  toggleSaveAlumnus: (alumniId: string, alumniName: string) => Promise<void>;
  calculateMatches: (filter: CareerGoalFilter) => Alumnus[];
  preselectedAlumnusForIntro: Alumnus | null;
  setPreselectedAlumnusForIntro: (alumnus: Alumnus | null) => void;
  isDemoMode: boolean;
  authConfigured: boolean;
  authLoading: boolean;
  dataLoading: boolean;
  dataError: string | null;
  hasMoreAlumni: boolean;
  loadingMoreAlumni: boolean;
  loadMoreAlumni: () => Promise<void>;
  user: AppUser | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: SignUpInput) => Promise<{ needsEmailConfirmation: boolean }>;
  signOut: () => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  setNewPassword: (password: string) => Promise<void>;
  updateProfile: (input: ProfileUpdateInput) => Promise<void>;
  verificationSubmission: VerificationSubmission | null;
  submitVerificationDocument: (file: File, notes: string) => Promise<void>;
  refreshDirectory: () => Promise<void>;
  createOpportunity: (input: OpportunityInput) => Promise<boolean>;
  updateOpportunity: (opportunityId: string, input: OpportunityInput) => Promise<boolean>;
  deleteOpportunity: (opportunityId: string) => Promise<boolean>;
}

const AlumBridgeContext = createContext<AlumBridgeContextType | undefined>(undefined);

export const AlumBridgeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isDemoMode = !hasSupabaseConfig;
  const [alumni, setAlumni] = useState<Alumnus[]>(isDemoMode ? DEMO_ALUMNI : []);
  const [opportunities, setOpportunities] = useState<Opportunity[]>(isDemoMode ? DEMO_OPPORTUNITIES : []);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [referralStatuses, setReferralStatuses] = useState<ReferralStatusMap>({});
  const [incomingReferralRequests, setIncomingReferralRequests] = useState<ReferralRequestItem[]>([]);
  const [requests, setRequests] = useState<MentorshipRequest[]>([]);
  const [requestedReferralIds, setRequestedReferralIds] = useState<string[]>([]);
  const [savedAlumniIds, setSavedAlumniIds] = useState<string[]>([]);
  const [activeProfile, setActiveProfile] = useState<Alumnus | null>(null);
  const [requestModalAlumni, setRequestModalAlumni] = useState<Alumnus | null>(null);
  const [isGoalFinderOpen, setIsGoalFinderOpen] = useState(false);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [legalDocModal, setLegalDocModal] = useState<LegalDocType>(null);
  const [preselectedAlumnusForIntro, setPreselectedAlumnusForIntro] = useState<Alumnus | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [authLoading, setAuthLoading] = useState(hasSupabaseConfig);
  const [dataLoading, setDataLoading] = useState(hasSupabaseConfig);
  const [dataError, setDataError] = useState<string | null>(null);
  const [hasMoreAlumni, setHasMoreAlumni] = useState(false);
  const [loadingMoreAlumni, setLoadingMoreAlumni] = useState(false);
  const [verificationSubmission, setVerificationSubmission] = useState<VerificationSubmission | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 4500);
  }, []);

  const dismissToast = useCallback(() => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = null;
    setToast(null);
  }, []);

  const refreshDirectory = useCallback(async () => {
    if (isDemoMode) {
      setAlumni(DEMO_ALUMNI.map((alum) => ({
        ...alum,
        bio: alum.bio.replaceAll('GLA University', institutionName),
        pastMilestones: alum.pastMilestones.map((milestone) => ({ ...milestone, organization: milestone.organization.replaceAll('GLA University', institutionName) })),
      })));
      setOpportunities(DEMO_OPPORTUNITIES.map((opportunity) => ({
        ...opportunity,
        description: opportunity.description.replaceAll('GLA University', institutionName),
      })));
      setDataError(null);
      setHasMoreAlumni(false);
      setDataLoading(false);
      return;
    }
    setDataLoading(true);
    setDataError(null);
    try {
      const [alumniRows, opportunityRows] = await Promise.all([fetchAlumni(), fetchOpportunities()]);
      setAlumni(alumniRows);
      setHasMoreAlumni(alumniRows.length === 50);
      setOpportunities(opportunityRows);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load directory data.';
      setDataError(message);
      setAlumni([]);
      setHasMoreAlumni(false);
      setOpportunities([]);
    } finally {
      setDataLoading(false);
    }
  }, [isDemoMode]);

  const loadMoreAlumni = useCallback(async () => {
    if (isDemoMode || !hasMoreAlumni || loadingMoreAlumni) return;
    setLoadingMoreAlumni(true);
    try {
      const nextPage = await fetchAlumni(alumni.length, 50);
      setAlumni((current) => [...current, ...nextPage]);
      setHasMoreAlumni(nextPage.length === 50);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'More alumni profiles could not be loaded.', 'error');
    } finally {
      setLoadingMoreAlumni(false);
    }
  }, [isDemoMode, hasMoreAlumni, loadingMoreAlumni, alumni.length, showToast]);

  useEffect(() => {
    void refreshDirectory();
  }, [refreshDirectory]);

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    let active = true;
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (active) setSession(nextSession);
    });

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) showToast(`Authentication session could not be restored: ${error.message}`, 'error');
      setSession(data.session);
      setAuthLoading(false);
    }).catch((error: unknown) => {
      if (!active) return;
      setAuthLoading(false);
      showToast(error instanceof Error ? error.message : 'Authentication could not be initialized.', 'error');
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, [showToast]);

  const refreshNotifications = useCallback(async () => {
    if (!user || isDemoMode) {
      setNotifications([]);
      return;
    }
    try {
      setNotifications(await fetchUserNotifications(user.id));
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Notifications could not be loaded.', 'error');
    }
  }, [user, isDemoMode, showToast]);

  const markNotificationRead = useCallback(async (notificationId: string) => {
    if (!user || isDemoMode) return;
    try {
      await markUserNotificationRead(user.id, notificationId);
      setNotifications((current) => current.map((item) => item.id === notificationId ? { ...item, readAt: new Date().toISOString() } : item));
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Notification could not be marked as read.', 'error');
    }
  }, [user, isDemoMode, showToast]);

  const refreshUserData = useCallback(async (activeUser: AppUser) => {
    const [userRequests, savedIds, referralIds, statuses, incomingReferrals, verification, userNotifications] = await Promise.all([
      fetchUserRequests(activeUser, alumni),
      activeUser.role === 'student' ? fetchSavedAlumni(activeUser.id) : Promise.resolve([]),
      activeUser.role === 'student' ? fetchReferralIds(activeUser.id) : Promise.resolve([]),
      activeUser.role === 'student' ? fetchReferralStatusMap(activeUser.id) : Promise.resolve({}),
      activeUser.role === 'alumni' ? fetchIncomingReferralRequests(activeUser.id) : Promise.resolve([]),
      activeUser.role === 'alumni' ? fetchOwnVerification(activeUser.id) : Promise.resolve(null),
      fetchUserNotifications(activeUser.id),
    ]);
    setRequests(userRequests);
    setSavedAlumniIds(savedIds);
    setRequestedReferralIds(referralIds);
    setReferralStatuses(statuses);
    setIncomingReferralRequests(incomingReferrals);
    setVerificationSubmission(verification);
    setNotifications(userNotifications);
  }, [alumni]);

  useEffect(() => {
    let active = true;
    if (!session) {
      setUser(null);
      setRequests([]);
      setSavedAlumniIds([]);
      setRequestedReferralIds([]);
      setVerificationSubmission(null);
      setNotifications([]);
      setReferralStatuses({});
      setIncomingReferralRequests([]);
      return () => { active = false; };
    }

    setAuthLoading(true);
    void fetchAppUser(session).then(async (appUser) => {
      if (!active) return;
      setUser(appUser);
      await refreshUserData(appUser);
      if (active) setAuthLoading(false);
    }).catch((error: unknown) => {
      if (!active) return;
      setAuthLoading(false);
      setDataError(error instanceof Error ? error.message : 'Your account profile could not be loaded.');
      showToast('Your session is active, but your profile could not be loaded. Check the profile trigger and database migration.', 'error');
    });

    return () => { active = false; };
  }, [session, refreshUserData, showToast]);

  useEffect(() => () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    await signInService(email, password);
    showToast('Signed in successfully.', 'success');
    setIsAuthModalOpen(false);
  }, [showToast]);

  const signUp = useCallback(async (input: SignUpInput) => {
    const result = await signUpService(input);
    const needsEmailConfirmation = !result.session;
    if (needsEmailConfirmation) {
      showToast('Account created. Check your email to confirm your address before signing in.', 'info');
    } else {
      showToast(input.role === 'alumni'
        ? 'Account created. Your alumni profile remains pending until an administrator verifies it.'
        : 'Account created successfully.', 'success');
    }
    return { needsEmailConfirmation };
  }, [showToast]);

  const signOut = useCallback(async () => {
    await signOutService();
    setActiveProfile(null);
    setRequests([]);
    setSavedAlumniIds([]);
    setRequestedReferralIds([]);
    setNotifications([]);
    setReferralStatuses({});
    setIncomingReferralRequests([]);
    showToast('You have been signed out.', 'info');
  }, [showToast]);

  const sendPasswordResetEmail = useCallback(async (email: string) => {
    await sendPasswordReset(email);
    showToast('Password reset instructions have been sent if the account exists.', 'info');
  }, [showToast]);

  const setNewPassword = useCallback(async (password: string) => {
    await updatePassword(password);
    showToast('Your password has been updated.', 'success');
  }, [showToast]);

  const updateProfile = useCallback(async (input: ProfileUpdateInput) => {
    if (!user) throw new Error('Sign in before editing your profile.');
    await updateOwnProfile(user.id, input);
    const refreshed = await fetchAppUser(session!);
    setUser(refreshed);
    showToast('Profile updated successfully.', 'success');
    await refreshDirectory();
  }, [user, session, showToast, refreshDirectory]);

  const createOpportunity = useCallback(async (input: OpportunityInput): Promise<boolean> => {
    if (!user || user.role !== 'alumni') {
      setIsAuthModalOpen(true);
      showToast('Sign in with an alumni account to publish an opportunity.', 'info');
      return false;
    }
    if (user.verificationStatus !== 'approved') {
      showToast('Your alumni profile must be approved by an AlumBridge administrator before publishing opportunities.', 'error');
      return false;
    }
    try {
      await createOpportunityService(user.id, input);
      await refreshDirectory();
      showToast('Opportunity published successfully.', 'success');
      return true;
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'The opportunity could not be published.', 'error');
      return false;
    }
  }, [user, showToast, refreshDirectory]);

  const updateOpportunity = useCallback(async (opportunityId: string, input: OpportunityInput): Promise<boolean> => {
    if (!user || user.role !== 'alumni' || user.verificationStatus !== 'approved') {
      showToast('Only approved alumni can edit their opportunities.', 'error');
      return false;
    }
    try {
      await updateOpportunityService(user.id, opportunityId, input);
      await refreshDirectory();
      showToast('Opportunity updated successfully.', 'success');
      return true;
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'The opportunity could not be updated.', 'error');
      return false;
    }
  }, [user, showToast, refreshDirectory]);

  const deleteOpportunity = useCallback(async (opportunityId: string): Promise<boolean> => {
    if (!user || user.role !== 'alumni' || user.verificationStatus !== 'approved') {
      showToast('Only approved alumni can close their opportunities.', 'error');
      return false;
    }
    try {
      await deleteOpportunityService(user.id, opportunityId);
      await refreshDirectory();
      showToast('Opportunity closed.', 'info');
      return true;
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'The opportunity could not be removed.', 'error');
      return false;
    }
  }, [user, showToast, refreshDirectory]);

  const submitVerificationDocument = useCallback(async (file: File, notes: string) => {
    if (!user || user.role !== 'alumni') throw new Error('Only alumni accounts can submit verification documents.');
    await uploadAlumniVerification(user.id, file, notes);
    const refreshed = await fetchOwnVerification(user.id);
    setVerificationSubmission(refreshed);
    showToast('Verification submitted. Your profile will remain hidden until an administrator approves it.', 'success');
  }, [user, showToast]);

  const submitMentorshipRequest = useCallback(async (reqData: Omit<MentorshipRequest, 'id' | 'status' | 'createdAt'>): Promise<boolean | string> => {
    if (!isDemoMode && !user) {
      setIsAuthModalOpen(true);
      showToast('Sign in as a student to send a mentorship request.', 'info');
      return false;
    }
    if (!isDemoMode && user?.role !== 'student') {
      showToast('Only student accounts can send mentorship requests.', 'error');
      return false;
    }
    if (!isDemoMode) {
      const duplicate = requests.some((request) => request.alumniId === reqData.alumniId && request.status === 'pending');
      if (duplicate) {
        showToast('You already have a pending mentorship request with this alumnus.', 'info');
        return 'You already have a pending mentorship request with this alumnus.';
      }
      try {
        await createMentorshipRequest(user!.id, reqData.alumniId, reqData);
        setRequests(await fetchUserRequests(user!, alumni));
        setNotifications(await fetchUserNotifications(user!.id));
        showToast(`Mentorship request sent to ${reqData.alumniName}.`, 'success');
        return true;
      } catch (error) {
        showToast(error instanceof Error ? error.message : 'The mentorship request could not be saved.', 'error');
        return false;
      }
    }

    const duplicate = requests.some((request) => request.alumniId === reqData.alumniId && request.status === 'pending');
    if (duplicate) {
      showToast('You already have a pending mentorship request with this alumnus.', 'info');
      return 'You already have a pending mentorship request with this alumnus.';
    }
    const newRequest: MentorshipRequest = {
      ...reqData,
      id: `demo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setRequests((previous) => [newRequest, ...previous]);
    showToast(`Demo mentorship request created for ${reqData.alumniName}.`, 'success');
    return true;
  }, [isDemoMode, user, requests, showToast, alumni]);

  const cancelMentorshipRequest = useCallback(async (id: string) => {
    if (isDemoMode) {
      setRequests((previous) => previous.filter((request) => request.id !== id));
      showToast('Demo request withdrawn.', 'info');
      return;
    }
    try {
      await updateMentorshipStatus(id, 'withdrawn');
      if (user) setRequests(await fetchUserRequests(user, alumni));
      showToast('Mentorship request withdrawn.', 'info');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'The request could not be withdrawn.', 'error');
    }
  }, [isDemoMode, user, alumni, showToast]);

  const respondToMentorshipRequest = useCallback(async (id: string, status: 'accepted' | 'declined') => {
    if (isDemoMode || user?.role !== 'alumni') {
      showToast('Only authenticated alumni can respond to mentorship requests.', 'error');
      return;
    }
    try {
      await updateMentorshipStatus(id, status);
      setRequests(await fetchUserRequests(user, alumni));
      setNotifications(await fetchUserNotifications(user.id));
      showToast(`Mentorship request ${status}.`, 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'The request could not be updated.', 'error');
    }
  }, [isDemoMode, user, alumni, showToast]);

  const toggleReferralRequest = useCallback(async (opportunity: Opportunity): Promise<boolean> => {
    if (!isDemoMode && !user) {
      setIsAuthModalOpen(true);
      showToast('Sign in as a student to request a referral.', 'info');
      return false;
    }
    if (!isDemoMode && user?.role !== 'student') {
      showToast('Only student accounts can submit referral inquiries.', 'error');
      return false;
    }
    if (requestedReferralIds.includes(opportunity.id)) {
      showToast(`A referral inquiry for ${opportunity.company} is already recorded.`, 'info');
      return false;
    }
    if (!isDemoMode) {
      try {
        await createReferralRequest(user!.id, opportunity);
        setRequestedReferralIds(await fetchReferralIds(user!.id));
        setReferralStatuses(await fetchReferralStatusMap(user!.id));
        setNotifications(await fetchUserNotifications(user!.id));
        showToast(`Referral inquiry sent to ${opportunity.postedByAlumniName}.`, 'success');
        return true;
      } catch (error) {
        showToast(error instanceof Error ? error.message : 'The referral inquiry could not be saved.', 'error');
        return false;
      }
    }
    setRequestedReferralIds((previous) => [...previous, opportunity.id]);
    showToast(`Demo referral inquiry recorded for ${opportunity.company}.`, 'success');
    return true;
  }, [isDemoMode, user, requestedReferralIds, showToast]);

  const respondToReferralRequest = useCallback(async (id: string, status: 'acknowledged' | 'declined') => {
    if (!user || user.role !== 'alumni' || isDemoMode) {
      showToast('Only authenticated alumni can respond to referral inquiries.', 'error');
      return;
    }
    try {
      await updateReferralRequestStatus(id, status);
      setIncomingReferralRequests(await fetchIncomingReferralRequests(user.id));
      setNotifications(await fetchUserNotifications(user.id));
      showToast(`Referral inquiry ${status}.`, 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'The referral inquiry could not be updated.', 'error');
    }
  }, [user, isDemoMode, showToast]);

  const toggleSaveAlumnus = useCallback(async (alumniId: string, alumniName: string) => {
    if (!isDemoMode && !user) {
      setIsAuthModalOpen(true);
      showToast('Sign in as a student to save mentors.', 'info');
      return;
    }
    if (!isDemoMode && user?.role !== 'student') {
      showToast('Only student accounts can save mentors.', 'error');
      return;
    }
    const exists = savedAlumniIds.includes(alumniId);
    if (!isDemoMode) {
      try {
        if (exists) await unsaveAlumni(user!.id, alumniId);
        else await saveAlumni(user!.id, alumniId);
        setSavedAlumniIds(await fetchSavedAlumni(user!.id));
        showToast(exists ? `Removed ${alumniName} from saved mentors.` : `Saved ${alumniName} to your shortlist.`, 'success');
      } catch (error) {
        showToast(error instanceof Error ? error.message : 'The saved mentor list could not be updated.', 'error');
      }
      return;
    }
    setSavedAlumniIds((previous) => exists ? previous.filter((id) => id !== alumniId) : [...previous, alumniId]);
    showToast(exists ? `Removed ${alumniName} from the demo shortlist.` : `Saved ${alumniName} in the demo shortlist.`, 'success');
  }, [isDemoMode, user, savedAlumniIds, showToast]);

  const calculateMatches = useCallback((filter: CareerGoalFilter): Alumnus[] => {
    return alumni.map((alum) => {
      let score = 0;
      const reasons: string[] = [];
      const goal = filter.goal.trim().toLowerCase();
      const role = alum.role.toLowerCase();
      const bio = alum.bio.toLowerCase();
      if (goal) {
        const goalTerms = goal.split(/[^a-z0-9+#]+/).filter((term) => term.length > 2);
        const haystack = `${role} ${bio} ${alum.mentorshipTopics.join(' ')}`.toLowerCase();
        const matchedTerms = goalTerms.filter((term) => haystack.includes(term));
        if (matchedTerms.length) {
          score += Math.min(30, Math.round((matchedTerms.length / goalTerms.length) * 30));
          reasons.push(`Career-goal overlap: ${matchedTerms.slice(0, 3).join(', ')}`);
        }
      }
      if (filter.targetCompany.trim() && alum.company.toLowerCase().includes(filter.targetCompany.trim().toLowerCase())) {
        score += 20;
        reasons.push(`Experience at ${alum.company}`);
      }
      if (filter.department && filter.department !== 'All' && alum.department === filter.department) {
        score += 15;
        reasons.push(`${alum.department} department match`);
      }
      if (filter.mentorExperience === '7+' && alum.experienceYears >= 7) {
        score += 10;
        reasons.push(`${alum.experienceYears} years of experience`);
      } else if (filter.mentorExperience === '5+' && alum.experienceYears >= 5) {
        score += 7;
        reasons.push(`${alum.experienceYears} years of experience`);
      }
      const selectedSkills = filter.selectedSkills.map((skill) => skill.toLowerCase());
      const matchedSkills = alum.skills.filter((skill) => selectedSkills.includes(skill.toLowerCase()));
      if (selectedSkills.length && matchedSkills.length) {
        score += Math.min(20, Math.round((matchedSkills.length / selectedSkills.length) * 20));
        reasons.push(`Shared skills: ${matchedSkills.slice(0, 3).join(', ')}`);
      }
      if (filter.mentorshipTopic) {
        const matchesTopic = alum.mentorshipTopics.some((topic) => topic.toLowerCase().includes(filter.mentorshipTopic.toLowerCase()));
        if (matchesTopic) {
          score += 10;
          reasons.push(`Mentorship topic: ${filter.mentorshipTopic}`);
        }
      }
      if (alum.availableForMentorship) {
        score += 5;
        reasons.push('Currently available for mentorship');
      }
      return { ...alum, matchScore: Math.min(100, score), matchReasons: reasons };
    }).sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0) || a.name.localeCompare(b.name));
  }, [alumni]);

  return (
    <AlumBridgeContext.Provider value={{
      alumni,
      opportunities,
      notifications,
      referralStatuses,
      incomingReferralRequests,
      respondToReferralRequest,
      refreshNotifications,
      markNotificationRead,
      requests,
      requestedReferralIds,
      savedAlumniIds,
      activeProfile,
      setActiveProfile,
      requestModalAlumni,
      setRequestModalAlumni,
      isGoalFinderOpen,
      setIsGoalFinderOpen,
      isTrackerOpen,
      setIsTrackerOpen,
      isAuthModalOpen,
      setIsAuthModalOpen,
      isAdminPanelOpen,
      setIsAdminPanelOpen,
      legalDocModal,
      setLegalDocModal,
      toast,
      showToast,
      dismissToast,
      submitMentorshipRequest,
      cancelMentorshipRequest,
      respondToMentorshipRequest,
      toggleReferralRequest,
      toggleSaveAlumnus,
      calculateMatches,
      preselectedAlumnusForIntro,
      setPreselectedAlumnusForIntro,
      isDemoMode,
      authConfigured: hasSupabaseConfig,
      authLoading,
      dataLoading,
      dataError,
      hasMoreAlumni,
      loadingMoreAlumni,
      loadMoreAlumni,
      user,
      signIn,
      signUp,
      signOut,
      sendPasswordResetEmail,
      setNewPassword,
      updateProfile,
      verificationSubmission,
      submitVerificationDocument,
      refreshDirectory,
      createOpportunity,
      updateOpportunity,
      deleteOpportunity,
    }}>
      {children}
    </AlumBridgeContext.Provider>
  );
};

export const useAlumBridge = () => {
  const context = useContext(AlumBridgeContext);
  if (!context) throw new Error('useAlumBridge must be used within an AlumBridgeProvider');
  return context;
};
