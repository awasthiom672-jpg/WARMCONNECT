import type { Session } from '@supabase/supabase-js';
import type { Alumnus, MentorshipRequest, Opportunity, RequestStatus } from '../types';
import { supabase } from '../lib/supabase';
import { localDateKey } from '../lib/date';

export type AppRole = 'student' | 'alumni' | 'admin';

export interface AppUser {
  id: string;
  email: string;
  fullName: string;
  role: AppRole;
  department: string | null;
  graduationYear: number | null;
  degree: string;
  bio: string;
  location: string;
  skills: string[];
  currentTitle: string;
  company: string;
  experienceYears: number;
  mentorshipTopics: string[];
  availableForMentorship: boolean;
  verificationStatus: 'pending' | 'approved' | 'rejected' | null;
}

export interface SignUpInput {
  fullName: string;
  email: string;
  password: string;
  role: 'student' | 'alumni';
  department?: string;
  graduationYear?: number;
  degree?: string;
  currentTitle?: string;
  company?: string;
}

export interface OpportunityInput {
  title: string;
  company: string;
  description: string;
  type: Opportunity['type'];
  department: string;
  location: string;
  compensation: string;
  deadline: string;
  applicationUrl?: string;
  skills: string[];
}

export interface ProfileUpdateInput {
  fullName: string;
  department?: string;
  graduationYear?: number | null;
  degree?: string;
  bio?: string;
  location?: string;
  skills?: string[];
  currentTitle?: string;
  company?: string;
  experienceYears?: number;
  mentorshipTopics?: string[];
  availableForMentorship?: boolean;
}

export interface VerificationSubmission {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewNote: string | null;
  createdAt: string;
}

export interface AdminVerificationItem extends VerificationSubmission {
  userId: string;
  fullName: string;
  documentPath: string;
  department: string | null;
  company: string | null;
  currentTitle: string | null;
}

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  readAt: string | null;
  createdAt: string;
}

export interface ReferralRequestItem {
  id: string;
  opportunityId: string;
  opportunityTitle: string;
  company: string;
  studentName: string;
  studentDepartment: string;
  message: string;
  status: 'pending' | 'acknowledged' | 'declined' | 'withdrawn';
  createdAt: string;
}

export type ReferralStatusMap = Record<string, ReferralRequestItem['status']>;

function requireClient() {
  if (!supabase) throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and a publishable key to .env.local.');
  return supabase;
}

function stringOr(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function normalizeHttpUrl(value: string | undefined): string | null {
  const candidate = value?.trim();
  if (!candidate) return null;
  let parsed: URL;
  try { parsed = new URL(candidate); } catch { throw new Error('Enter a valid application URL beginning with https:// or http://.'); }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    throw new Error('Application links must use http:// or https://.');
  }
  return parsed.toString();
}

function mapAlumnus(row: Record<string, unknown>): Alumnus {
  const detail = (row.alumni_profiles && typeof row.alumni_profiles === 'object'
    ? row.alumni_profiles
    : {}) as Record<string, unknown>;
  const milestones = Array.isArray(detail.past_milestones)
    ? detail.past_milestones as Alumnus['pastMilestones']
    : [];
  return {
    id: stringOr(row.id),
    name: stringOr(row.full_name, 'Alumni member'),
    avatar: stringOr(row.avatar_url),
    role: stringOr(detail.current_title, 'Professional'),
    company: stringOr(detail.company, 'Company not provided'),
    department: (stringOr(row.department, 'CSE') as Alumnus['department']),
    degree: stringOr(detail.degree, 'Degree not provided'),
    batchYear: typeof row.graduation_year === 'number' ? row.graduation_year : 0,
    location: stringOr(row.location, 'Location not provided'),
    skills: stringArray(row.skills),
    mentorshipTopics: stringArray(detail.mentorship_topics),
    bio: stringOr(row.bio),
    experienceYears: typeof detail.experience_years === 'number' ? detail.experience_years : 0,
    availableForMentorship: detail.available_for_mentorship === true,
    pastMilestones: milestones,
    adviceSnippet: stringOr(detail.advice_snippet),
    verificationStatus: stringOr(detail.verification_status, 'pending') as Alumnus['verificationStatus'],
  };
}

export async function fetchAlumni(offset = 0, pageSize = 50): Promise<Alumnus[]> {
  const client = requireClient();
  const { data, error } = await client
    .from('profiles')
    .select('id, full_name, avatar_url, department, graduation_year, bio, location, skills, alumni_profiles!alumni_profiles_user_id_fkey!inner(current_title, company, degree, experience_years, mentorship_topics, available_for_mentorship, verification_status, past_milestones, advice_snippet)')
    .eq('role', 'alumni')
    .eq('alumni_profiles.verification_status', 'approved')
    .order('full_name', { ascending: true })
    .range(offset, offset + pageSize - 1);
  if (error) throw error;
  return (data ?? []).map((row) => mapAlumnus(row as unknown as Record<string, unknown>));
}

export async function fetchOpportunities(): Promise<Opportunity[]> {
  const client = requireClient();
  const { data, error } = await client
    .from('opportunities')
    .select('id, title, company, opportunity_type, department, location, compensation, application_deadline, application_url, skills, description, posted_by, status, alumni_profiles!opportunities_posted_by_fkey(profiles!alumni_profiles_user_id_fkey(full_name, graduation_year))')
    .eq('status', 'published')
    .gte('application_deadline', localDateKey())
    .order('application_deadline', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((item) => {
    const row = item as unknown as Record<string, unknown>;
    const alumniProfile = (row.alumni_profiles && typeof row.alumni_profiles === 'object' ? row.alumni_profiles : {}) as Record<string, unknown>;
    const owner = (alumniProfile.profiles && typeof alumniProfile.profiles === 'object' ? alumniProfile.profiles : {}) as Record<string, unknown>;
    return {
      id: stringOr(row.id),
      title: stringOr(row.title),
      company: stringOr(row.company),
      type: stringOr(row.opportunity_type, 'Internship') as Opportunity['type'],
      department: stringOr(row.department, 'All'),
      location: stringOr(row.location, 'Not specified'),
      compensation: stringOr(row.compensation, 'Not specified'),
      deadline: stringOr(row.application_deadline),
      postedByAlumniName: stringOr(owner.full_name, 'Alumni member'),
      postedByAlumniBatch: typeof owner.graduation_year === 'number' ? String(owner.graduation_year) : '—',
      postedByAlumniId: stringOr(row.posted_by),
      skills: stringArray(row.skills),
      description: stringOr(row.description),
      applicationUrl: typeof row.application_url === 'string' ? row.application_url : undefined,
    } satisfies Opportunity;
  });
}

export async function fetchAppUser(session: Session): Promise<AppUser> {
  const client = requireClient();
  const { data, error } = await client
    .from('profiles')
    .select('id, full_name, role, department, graduation_year, bio, location, skills, alumni_profiles(degree, current_title, company, experience_years, mentorship_topics, available_for_mentorship, verification_status)')
    .eq('id', session.user.id)
    .single();
  if (error) throw error;
  const row = data as unknown as Record<string, unknown>;
  const alumniDetails = (row.alumni_profiles && typeof row.alumni_profiles === 'object' ? row.alumni_profiles : {}) as Record<string, unknown>;
  return {
    id: stringOr(row.id),
    email: session.user.email ?? '',
    fullName: stringOr(row.full_name, 'Account'),
    role: stringOr(row.role, 'student') as AppRole,
    department: typeof row.department === 'string' ? row.department : null,
    graduationYear: typeof row.graduation_year === 'number' ? row.graduation_year : null,
    degree: stringOr(alumniDetails.degree),
    bio: stringOr(row.bio),
    location: stringOr(row.location),
    skills: stringArray(row.skills),
    currentTitle: stringOr(alumniDetails.current_title),
    company: stringOr(alumniDetails.company),
    experienceYears: typeof alumniDetails.experience_years === 'number' ? alumniDetails.experience_years : 0,
    mentorshipTopics: stringArray(alumniDetails.mentorship_topics),
    availableForMentorship: alumniDetails.available_for_mentorship === true,
    verificationStatus: typeof alumniDetails.verification_status === 'string' ? alumniDetails.verification_status as AppUser['verificationStatus'] : null,
  };
}

export async function signIn(email: string, password: string) {
  const client = requireClient();
  const { data, error } = await client.auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw error;
  return data;
}

export async function signUp(input: SignUpInput) {
  const client = requireClient();
  const { data, error } = await client.auth.signUp({
    email: input.email.trim(),
    password: input.password,
    options: {
      data: {
        full_name: input.fullName.trim(),
        role: input.role,
        department: input.department || null,
        graduation_year: input.graduationYear || null,
        degree: input.degree || null,
        current_title: input.currentTitle || null,
        company: input.company || null,
      },
    },
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const client = requireClient();
  const { error } = await client.auth.signOut();
  if (error) throw error;
}

export async function sendPasswordReset(email: string) {
  const client = requireClient();
  const { error } = await client.auth.resetPasswordForEmail(email.trim(), { redirectTo: window.location.origin });
  if (error) throw error;
}

export async function updatePassword(password: string) {
  const client = requireClient();
  const { error } = await client.auth.updateUser({ password });
  if (error) throw error;
}

export async function updateOwnProfile(userId: string, input: ProfileUpdateInput) {
  const client = requireClient();
  const profileUpdate = {
    full_name: input.fullName.trim(),
    department: input.department || null,
    graduation_year: input.graduationYear ?? null,
    bio: input.bio ?? '',
    location: input.location ?? '',
    skills: input.skills ?? [],
  };
  const { data: updatedProfile, error: profileError } = await client.from('profiles')
    .update(profileUpdate).eq('id', userId).select('id').maybeSingle();
  if (profileError) throw profileError;
  if (!updatedProfile) throw new Error('Your profile was not found or could not be updated.');

  const { data: userProfile, error: roleError } = await client.from('profiles').select('role').eq('id', userId).single();
  if (roleError) throw roleError;
  if ((userProfile as { role?: string }).role === 'alumni') {
    const { data: updatedAlumni, error } = await client.from('alumni_profiles').update({
      degree: input.degree ?? null,
      current_title: input.currentTitle ?? null,
      company: input.company ?? null,
      experience_years: input.experienceYears ?? 0,
      mentorship_topics: input.mentorshipTopics ?? [],
      available_for_mentorship: input.availableForMentorship ?? false,
    }).eq('user_id', userId).select('user_id').maybeSingle();
    if (error) throw error;
    if (!updatedAlumni) throw new Error('Your alumni profile was not found or could not be updated.');
  }
}

export async function fetchUserRequests(user: AppUser, alumni: Alumnus[]): Promise<MentorshipRequest[]> {
  const client = requireClient();
  const query = client.from('mentorship_requests').select('id, student_id, alumni_id, topic, message, preferred_cadence, status, created_at');
  const { data, error } = user.role === 'alumni'
    ? await query.eq('alumni_id', user.id).neq('status', 'withdrawn').order('created_at', { ascending: false })
    : await query.eq('student_id', user.id).neq('status', 'withdrawn').order('created_at', { ascending: false });
  if (error) throw error;

  const rows = (data ?? []) as unknown as Array<Record<string, unknown>>;
  const otherIds = [...new Set(rows.map((row) => stringOr(user.role === 'alumni' ? row.student_id : row.alumni_id)))];
  const names = new Map<string, Record<string, unknown>>();
  if (otherIds.length) {
    const { data: profiles, error: profilesError } = await client.from('profiles')
      .select('id, full_name, avatar_url, department, graduation_year, alumni_profiles(current_title, company)')
      .in('id', otherIds);
    if (profilesError) throw profilesError;
    for (const profile of profiles ?? []) names.set(stringOr((profile as Record<string, unknown>).id), profile as unknown as Record<string, unknown>);
  }
  const alumniById = new Map(alumni.map((person) => [person.id, person]));

  return rows.map((row) => {
    const contactId = stringOr(user.role === 'alumni' ? row.student_id : row.alumni_id);
    const person = names.get(contactId);
    const nested = person?.alumni_profiles && typeof person.alumni_profiles === 'object'
      ? person.alumni_profiles as Record<string, unknown>
      : {};
    const knownAlumnus = alumniById.get(stringOr(row.alumni_id));
    const isStudentView = user.role !== 'alumni';
    return {
      id: stringOr(row.id),
      alumniId: stringOr(row.alumni_id),
      alumniName: isStudentView ? (knownAlumnus?.name ?? stringOr(person?.full_name, 'Alumni member')) : user.fullName,
      alumniRole: isStudentView ? (knownAlumnus?.role ?? '') : '',
      alumniCompany: isStudentView ? (knownAlumnus?.company ?? '') : '',
      alumniAvatar: isStudentView ? (knownAlumnus?.avatar ?? '') : stringOr(person?.avatar_url),
      topic: stringOr(row.topic),
      message: stringOr(row.message),
      preferredCadence: stringOr(row.preferred_cadence),
      status: stringOr(row.status, 'pending') as RequestStatus,
      createdAt: stringOr(row.created_at),
      studentName: isStudentView ? undefined : stringOr(person?.full_name, 'Student'),
      studentDepartment: isStudentView ? undefined : stringOr(person?.department),
    };
  });
}

export async function createMentorshipRequest(userId: string, alumniId: string, input: Omit<MentorshipRequest, 'id' | 'status' | 'createdAt'>) {
  const client = requireClient();
  const { error } = await client.from('mentorship_requests').insert({
    student_id: userId,
    alumni_id: alumniId,
    topic: input.topic,
    message: input.message,
    preferred_cadence: input.preferredCadence,
  });
  if (error) throw error;
}

export async function updateMentorshipStatus(id: string, status: 'accepted' | 'declined' | 'withdrawn') {
  const client = requireClient();
  const { data, error } = await client.from('mentorship_requests').update({ status }).eq('id', id).select('id').maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('The mentorship request was not found or you do not have permission to update it.');
}

export async function fetchSavedAlumni(userId: string): Promise<string[]> {
  const client = requireClient();
  const { data, error } = await client.from('saved_alumni').select('alumni_id').eq('student_id', userId);
  if (error) throw error;
  return (data ?? []).map((item) => stringOr((item as { alumni_id?: unknown }).alumni_id));
}

export async function saveAlumni(userId: string, alumniId: string) {
  const client = requireClient();
  const { error } = await client.from('saved_alumni').upsert({ student_id: userId, alumni_id: alumniId }, { onConflict: 'student_id,alumni_id', ignoreDuplicates: true });
  if (error) throw error;
}

export async function unsaveAlumni(userId: string, alumniId: string) {
  const client = requireClient();
  const { error } = await client.from('saved_alumni').delete().eq('student_id', userId).eq('alumni_id', alumniId);
  if (error) throw error;
}


export async function createOpportunity(userId: string, input: OpportunityInput) {
  const client = requireClient();
  const { error } = await client.from('opportunities').insert({
    title: input.title.trim(),
    company: input.company.trim(),
    description: input.description.trim(),
    opportunity_type: input.type,
    department: input.department.trim() || 'All',
    location: input.location.trim() || 'Not specified',
    compensation: input.compensation.trim() || 'Not specified',
    application_deadline: input.deadline,
    application_url: normalizeHttpUrl(input.applicationUrl),
    skills: input.skills.map((skill) => skill.trim()).filter(Boolean),
    posted_by: userId,
    status: 'published',
  });
  if (error) throw error;
}

export async function updateOpportunity(userId: string, opportunityId: string, input: OpportunityInput) {
  const client = requireClient();
  const { data, error } = await client.from('opportunities').update({
    title: input.title.trim(),
    company: input.company.trim(),
    description: input.description.trim(),
    opportunity_type: input.type,
    department: input.department.trim() || 'All',
    location: input.location.trim() || 'Not specified',
    compensation: input.compensation.trim() || 'Not specified',
    application_deadline: input.deadline,
    application_url: normalizeHttpUrl(input.applicationUrl),
    skills: input.skills.map((skill) => skill.trim()).filter(Boolean),
  }).eq('id', opportunityId).eq('posted_by', userId).select('id').maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('The opportunity was not found or you do not have permission to edit it.');
}

export async function deleteOpportunity(userId: string, opportunityId: string) {
  const client = requireClient();
  // Close rather than hard-delete so existing referral inquiries retain their history.
  const { data, error } = await client.from('opportunities').update({ status: 'closed' })
    .eq('id', opportunityId).eq('posted_by', userId).select('id').maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('The opportunity was not found or you do not have permission to close it.');
}

export async function fetchReferralIds(userId: string): Promise<string[]> {
  const client = requireClient();
  const { data, error } = await client.from('referral_requests').select('opportunity_id').eq('student_id', userId);
  if (error) throw error;
  return (data ?? []).map((item) => stringOr((item as { opportunity_id?: unknown }).opportunity_id));
}

export async function fetchReferralStatusMap(userId: string): Promise<ReferralStatusMap> {
  const client = requireClient();
  const { data, error } = await client.from('referral_requests')
    .select('opportunity_id, status')
    .eq('student_id', userId);
  if (error) throw error;
  return Object.fromEntries((data ?? []).map((item) => {
    const row = item as { opportunity_id?: unknown; status?: unknown };
    return [stringOr(row.opportunity_id), stringOr(row.status, 'pending') as ReferralRequestItem['status']];
  }));
}

export async function fetchIncomingReferralRequests(userId: string): Promise<ReferralRequestItem[]> {
  const client = requireClient();
  const { data, error } = await client.from('referral_requests')
    .select('id, opportunity_id, message, status, created_at, profiles!referral_requests_student_id_fkey(full_name, department), opportunities(title, company)')
    .eq('alumni_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((item) => {
    const row = item as unknown as Record<string, unknown>;
    const profile = (row.profiles && typeof row.profiles === 'object' ? row.profiles : {}) as Record<string, unknown>;
    const opportunity = (row.opportunities && typeof row.opportunities === 'object' ? row.opportunities : {}) as Record<string, unknown>;
    return {
      id: stringOr(row.id),
      opportunityId: stringOr(row.opportunity_id),
      opportunityTitle: stringOr(opportunity.title, 'Opportunity'),
      company: stringOr(opportunity.company),
      studentName: stringOr(profile.full_name, 'Student'),
      studentDepartment: stringOr(profile.department),
      message: stringOr(row.message),
      status: stringOr(row.status, 'pending') as ReferralRequestItem['status'],
      createdAt: stringOr(row.created_at),
    };
  });
}

export async function updateReferralRequestStatus(requestId: string, status: 'acknowledged' | 'declined') {
  const client = requireClient();
  const { data, error } = await client.from('referral_requests').update({ status }).eq('id', requestId).select('id').maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('The referral inquiry was not found or you do not have permission to update it.');
}

export async function createReferralRequest(userId: string, opportunity: Opportunity, message = '') {
  if (!opportunity.postedByAlumniId) throw new Error('This opportunity does not have a valid alumni owner for referral requests.');
  const client = requireClient();
  const { error } = await client.from('referral_requests').insert({
    student_id: userId,
    opportunity_id: opportunity.id,
    alumni_id: opportunity.postedByAlumniId,
    message: message.trim() || null,
  });
  if (error) throw error;
}

export async function uploadAlumniVerification(userId: string, file: File, notes: string) {
  const client = requireClient();
  const existing = await fetchOwnVerification(userId);
  if (existing?.status === 'pending') throw new Error('Your verification is already awaiting review. Please wait for the current decision before submitting another document.');
  if (existing?.status === 'approved') throw new Error('Your alumni profile has already been approved. Contact an administrator if your status needs review.');
  const allowed = ['application/pdf', 'image/png', 'image/jpeg'];
  if (!allowed.includes(file.type)) throw new Error('Upload a PDF, PNG or JPG verification document.');
  if (file.size > 10 * 1024 * 1024) throw new Error('The verification document must be 10 MB or smaller.');
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-100);
  const path = `${userId}/${crypto.randomUUID()}-${safeName}`;
  const { error: uploadError } = await client.storage.from('alumni-verification').upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (uploadError) throw uploadError;
  const { error: insertError } = await client.from('alumni_verification_submissions').insert({
    user_id: userId,
    document_path: path,
    notes: notes.trim() || null,
  });
  if (insertError) {
    await client.storage.from('alumni-verification').remove([path]);
    throw insertError;
  }
}

export async function fetchOwnVerification(userId: string): Promise<VerificationSubmission | null> {
  const client = requireClient();
  const { data, error } = await client.from('alumni_verification_submissions')
    .select('id, status, review_note, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const row = data as unknown as Record<string, unknown>;
  return {
    id: stringOr(row.id),
    status: stringOr(row.status, 'pending') as VerificationSubmission['status'],
    reviewNote: typeof row.review_note === 'string' ? row.review_note : null,
    createdAt: stringOr(row.created_at),
  };
}

export async function fetchPendingVerifications(): Promise<AdminVerificationItem[]> {
  const client = requireClient();
  const { data, error } = await client.from('alumni_verification_submissions')
    .select('id, user_id, document_path, status, review_note, created_at, profiles!alumni_verification_submissions_user_id_fkey(full_name, department, alumni_profiles(company, current_title))')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((item) => {
    const row = item as unknown as Record<string, unknown>;
    const profile = (row.profiles && typeof row.profiles === 'object' ? row.profiles : {}) as Record<string, unknown>;
    const alumniProfile = (profile.alumni_profiles && typeof profile.alumni_profiles === 'object' ? profile.alumni_profiles : {}) as Record<string, unknown>;
    return {
      id: stringOr(row.id),
      userId: stringOr(row.user_id),
      documentPath: stringOr(row.document_path),
      fullName: stringOr(profile.full_name, 'Alumni applicant'),
      department: typeof profile.department === 'string' ? profile.department : null,
      company: typeof alumniProfile.company === 'string' ? alumniProfile.company : null,
      currentTitle: typeof alumniProfile.current_title === 'string' ? alumniProfile.current_title : null,
      status: 'pending',
      reviewNote: typeof row.review_note === 'string' ? row.review_note : null,
      createdAt: stringOr(row.created_at),
    };
  });
}

export async function createVerificationDocumentUrl(path: string): Promise<string> {
  const client = requireClient();
  const { data, error } = await client.storage.from('alumni-verification').createSignedUrl(path, 60);
  if (error) throw error;
  return data.signedUrl;
}

export async function reviewAlumniVerification(id: string, status: 'approved' | 'rejected', reviewNote = '') {
  const client = requireClient();
  const { data, error } = await client.from('alumni_verification_submissions').update({ status, review_note: reviewNote.trim() || null }).eq('id', id).eq('status', 'pending').select('id').maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('This submission is no longer pending or you do not have administrator permission. Refresh the queue and try again.');
}

export async function fetchUserNotifications(userId: string): Promise<AppNotification[]> {
  const client = requireClient();
  const { data, error } = await client.from('notifications')
    .select('id, notification_type, title, message, read_at, created_at')
    .eq('recipient_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);
  if (error) throw error;
  return (data ?? []).map((item) => {
    const row = item as unknown as Record<string, unknown>;
    return {
      id: stringOr(row.id),
      type: stringOr(row.notification_type),
      title: stringOr(row.title),
      message: stringOr(row.message),
      readAt: typeof row.read_at === 'string' ? row.read_at : null,
      createdAt: stringOr(row.created_at),
    };
  });
}

export async function markUserNotificationRead(userId: string, notificationId: string) {
  const client = requireClient();
  const { data, error } = await client.from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId)
    .eq('recipient_id', userId)
    .select('id')
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('The notification was not found or does not belong to this account.');
}
