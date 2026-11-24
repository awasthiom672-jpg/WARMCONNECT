import React, { useEffect, useMemo, useState } from 'react';
import { X, UserRound, ShieldCheck, Upload, LogOut, Eye, EyeOff } from 'lucide-react';
import { useAlumBridge } from '../context/AlumBridgeContext';
import { supabase } from '../lib/supabase';

 type AuthMode = 'sign-in' | 'sign-up' | 'reset' | 'recovery' | 'account';

const fieldClass = 'w-full rounded-xl border border-white/15 bg-white/[0.04] px-3.5 py-3 text-sm text-[#F5F5F7] placeholder:text-[#747B87] outline-none transition focus:border-white/45';
const labelClass = 'mb-2 block text-[11px] font-medium uppercase tracking-[0.14em] text-[#D4D8E1]';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen, setIsAuthModalOpen, user, signIn, signUp, signOut,
    sendPasswordResetEmail, setNewPassword, updateProfile,
    verificationSubmission, submitVerificationDocument,
  } = useAlumBridge();
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'student' | 'alumni'>('student');
  const [department, setDepartment] = useState('CSE');
  const [graduationYear, setGraduationYear] = useState('');
  const [degree, setDegree] = useState('');
  const [company, setCompany] = useState('');
  const [currentTitle, setCurrentTitle] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState('');
  const [experienceYears, setExperienceYears] = useState('0');
  const [mentorshipTopics, setMentorshipTopics] = useState('');
  const [availableForMentorship, setAvailableForMentorship] = useState(false);
  const [verificationFile, setVerificationFile] = useState<File | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');

  useEffect(() => {
    if (!user) return;
    setEmail(user.email);
    setFullName(user.fullName);
    setRole(user.role === 'alumni' ? 'alumni' : 'student');
    setDepartment(user.department || 'CSE');
    setGraduationYear(user.graduationYear ? String(user.graduationYear) : '');
    setDegree(user.degree);
    setBio(user.bio);
    setLocation(user.location);
    setSkills(user.skills.join(', '));
    setCompany(user.company);
    setCurrentTitle(user.currentTitle);
    setExperienceYears(String(user.experienceYears));
    setMentorshipTopics(user.mentorshipTopics.join(', '));
    setAvailableForMentorship(user.availableForMentorship);
    // A recovery callback creates a session too. Preserve the recovery form
    // instead of letting the account hydration race switch it to profile mode.
    if (mode !== 'recovery') setMode('account');
  }, [user, mode]);

  useEffect(() => {
    if (!supabase) return;
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setMode('recovery');
        setIsAuthModalOpen(true);
      }
    });
    return () => data.subscription.unsubscribe();
  }, [setIsAuthModalOpen]);

  useEffect(() => {
    if (isAuthModalOpen && !user && mode === 'account') setMode('sign-in');
    if (!isAuthModalOpen) {
      setError('');
      setNotice('');
    }
  }, [isAuthModalOpen, user, mode]);

  const title = useMemo(() => ({
    'sign-in': 'Welcome back',
    'sign-up': 'Create your account',
    reset: 'Reset your password',
    recovery: 'Choose a new password',
    account: 'Your AlumBridge account',
  }[mode]), [mode]);

  if (!isAuthModalOpen) return null;

  const close = () => {
    setIsAuthModalOpen(false);
    setError('');
    setNotice('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setNotice('');
    setLoading(true);
    try {
      if (['sign-in', 'sign-up', 'reset'].includes(mode)) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) throw new Error('Enter a valid email address.');
      }
      if (mode === 'sign-in') {
        if (!password) throw new Error('Enter your password.');
        await signIn(email, password);
      } else if (mode === 'sign-up') {
        if (fullName.trim().length < 2) throw new Error('Enter your full name.');
        if (graduationYear && (!Number.isInteger(Number(graduationYear)) || Number(graduationYear) < 1950 || Number(graduationYear) > 2100)) throw new Error('Enter a valid graduation year.');
        if (password.length < 8) throw new Error('Use a password with at least 8 characters.');
        if (password !== confirmPassword) throw new Error('The passwords do not match.');
        const result = await signUp({
          fullName,
          email,
          password,
          role,
          department,
          graduationYear: graduationYear ? Number(graduationYear) : undefined,
          degree,
          currentTitle,
          company,
        });
        if (result.needsEmailConfirmation) {
          setMode('sign-in');
          setPassword('');
          setConfirmPassword('');
          setNotice('Your account has been created. Confirm your email address using the link we sent, then sign in.');
        } else {
          close();
        }
      } else if (mode === 'reset') {
        await sendPasswordResetEmail(email);
        setNotice('If an account exists for this address, password reset instructions have been sent.');
      } else if (mode === 'recovery') {
        if (password.length < 8) throw new Error('Use a password with at least 8 characters.');
        if (password !== confirmPassword) throw new Error('The passwords do not match.');
        await setNewPassword(password);
        close();
      } else if (mode === 'account') {
        await updateProfile({
          fullName,
          department,
          graduationYear: graduationYear ? Number(graduationYear) : null,
          degree,
          bio,
          location,
          skills: skills.split(',').map((item) => item.trim()).filter(Boolean),
          currentTitle,
          company,
          experienceYears: Math.max(0, Math.min(70, Number(experienceYears) || 0)),
          mentorshipTopics: mentorshipTopics.split(',').map((item) => item.trim()).filter(Boolean),
          availableForMentorship,
        });
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'The request could not be completed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      close();
    } catch (signOutError) {
      setError(signOutError instanceof Error ? signOutError.message : 'Could not sign out.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!verificationFile) {
      setError('Choose a PDF, PNG or JPG document first.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await submitVerificationDocument(verificationFile, verificationNotes);
      setVerificationFile(null);
      setVerificationNotes('');
      const fileInput = document.getElementById('alumni-verification-file') as HTMLInputElement | null;
      if (fileInput) fileInput.value = '';
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Verification could not be submitted.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6" role="presentation">
      <button type="button" aria-label="Close account dialog" className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={close} />
      <section role="dialog" aria-modal="true" aria-labelledby="auth-modal-title" className="relative z-10 max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-white/15 bg-[#0B0C10] text-[#F5F5F7] shadow-2xl">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#0B0C10]/95 px-6 py-5 backdrop-blur">
          <div>
            <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-[#9FA6B2]">AlumBridge · Secure access</p>
            <h2 id="auth-modal-title" className="text-xl font-medium">{title}</h2>
          </div>
          <button type="button" onClick={close} aria-label="Close account dialog" className="rounded-full p-2 text-[#9FA6B2] hover:bg-white/5 hover:text-white"><X className="h-5 w-5" /></button>
        </header>

        {!supabase && (
          <div className="mx-6 mt-5 rounded-xl border border-amber-400/25 bg-amber-300/[0.06] p-3 text-xs leading-relaxed text-amber-100/90">
            Supabase is not configured in this local copy. The site is running with illustrative demo records and session-only interactions. Add the Supabase URL and publishable key to enable accounts and persistent data.
          </div>
        )}

        <div className="space-y-4 p-6" onKeyDown={(event) => {
          if (event.key === 'Enter' && (event.target as HTMLElement).tagName !== 'TEXTAREA') {
            event.preventDefault();
            void handleSubmit(event as unknown as React.FormEvent);
          }
        }}>
          {mode === 'account' ? (
            <>
              <div className="flex items-start justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="rounded-full bg-white/10 p-2.5"><UserRound className="h-5 w-5" /></div>
                  <div className="min-w-0"><p className="truncate text-sm font-medium">{user?.fullName}</p><p className="truncate text-xs text-[#9FA6B2]">{user?.email}</p></div>
                </div>
                <span className="shrink-0 rounded-full border border-white/15 px-2.5 py-1 text-[10px] uppercase tracking-wider text-[#D4D8E1]">{user?.role}</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className={labelClass} htmlFor="account-full-name">Full name</label><input id="account-full-name" className={fieldClass} value={fullName} onChange={(e) => setFullName(e.target.value)} required /></div>
                <div><label className={labelClass} htmlFor="account-department">Department</label><select id="account-department" className={fieldClass} value={department} onChange={(e) => setDepartment(e.target.value)}><option>CSE</option><option>ECE</option><option>CSAM</option><option>CB</option><option>HCD</option></select></div>
                <div><label className={labelClass} htmlFor="account-grad-year">Graduation year</label><input id="account-grad-year" className={fieldClass} type="number" min="1950" max="2100" value={graduationYear} onChange={(e) => setGraduationYear(e.target.value)} /></div>
                <div><label className={labelClass} htmlFor="account-location">Location</label><input id="account-location" className={fieldClass} value={location} onChange={(e) => setLocation(e.target.value)} /></div>
              </div>
              <div><label className={labelClass} htmlFor="account-bio">Short bio</label><textarea id="account-bio" rows={3} maxLength={2000} className={fieldClass} value={bio} onChange={(e) => setBio(e.target.value)} /></div>
              <div><label className={labelClass} htmlFor="account-skills">Skills (comma separated)</label><input id="account-skills" className={fieldClass} value={skills} onChange={(e) => setSkills(e.target.value)} /></div>
              {user?.role === 'alumni' && (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div><label className={labelClass} htmlFor="account-degree">Degree</label><input id="account-degree" className={fieldClass} value={degree} onChange={(e) => setDegree(e.target.value)} maxLength={160} /></div>
                    <div><label className={labelClass} htmlFor="account-title">Current title</label><input id="account-title" className={fieldClass} value={currentTitle} onChange={(e) => setCurrentTitle(e.target.value)} /></div>
                    <div><label className={labelClass} htmlFor="account-company">Company</label><input id="account-company" className={fieldClass} value={company} onChange={(e) => setCompany(e.target.value)} /></div>
                    <div><label className={labelClass} htmlFor="account-experience">Years of experience</label><input id="account-experience" className={fieldClass} type="number" min="0" max="70" value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} /></div>
                  </div>
                  <div><label className={labelClass} htmlFor="account-mentorship-topics">Mentorship topics (comma separated)</label><input id="account-mentorship-topics" className={fieldClass} value={mentorshipTopics} onChange={(e) => setMentorshipTopics(e.target.value)} /></div>
                  <label className="flex items-center gap-2 text-xs text-[#D4D8E1]"><input type="checkbox" checked={availableForMentorship} onChange={(e) => setAvailableForMentorship(e.target.checked)} className="accent-white" /> Available for mentorship requests</label>
                </>
              )}
              <button type="button" onClick={(event) => void handleSubmit(event as unknown as React.FormEvent)} disabled={loading} className="w-full rounded-full bg-[#F5F5F7] py-3 text-xs font-semibold uppercase tracking-wider text-[#050507] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60">{loading ? 'Saving…' : 'Save profile'}</button>
              {user?.role === 'alumni' && (
                <div className="space-y-3 rounded-xl border border-white/10 bg-white/[0.025] p-4">
                  <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#D4D8E1]" /><h3 className="text-sm font-medium">Alumni verification</h3></div>
                  {verificationSubmission ? (
                    <p className="text-xs leading-relaxed text-[#D4D8E1]">Latest submission: <strong className="capitalize">{verificationSubmission.status}</strong>{verificationSubmission.reviewNote ? ` · ${verificationSubmission.reviewNote}` : ''}</p>
                  ) : <p className="text-xs leading-relaxed text-[#9FA6B2]">Submit a university or employment record. Documents are stored privately and are visible only to you and authorized administrators.</p>}
                  {verificationSubmission?.status === 'approved' ? (
                    <p className="text-xs leading-relaxed text-emerald-100">Your alumni profile has been approved by an AlumBridge administrator. No further document submission is needed.</p>
                  ) : verificationSubmission?.status !== 'pending' && (
                    <form onSubmit={handleVerification} className="space-y-3">
                      <label htmlFor="alumni-verification-file" className={labelClass}>Supporting document (PDF, PNG or JPG, max 10 MB)</label>
                      <input id="alumni-verification-file" type="file" accept="application/pdf,image/png,image/jpeg" onChange={(e) => setVerificationFile(e.target.files?.[0] ?? null)} className="block w-full text-xs text-[#9FA6B2] file:mr-3 file:rounded-full file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-xs file:text-[#F5F5F7]" />
                      <textarea rows={2} maxLength={1500} placeholder="Optional context for the reviewer" value={verificationNotes} onChange={(e) => setVerificationNotes(e.target.value)} className={fieldClass} />
                      <button type="submit" disabled={loading || !verificationFile} className="flex w-full items-center justify-center gap-2 rounded-full border border-white/20 py-2.5 text-xs font-medium uppercase tracking-wider hover:bg-white/5 disabled:opacity-50"><Upload className="h-3.5 w-3.5" />{loading ? 'Uploading…' : 'Submit for review'}</button>
                    </form>
                  )}
                </div>
              )}
              <button type="button" onClick={handleSignOut} disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-full border border-white/15 py-3 text-xs font-medium uppercase tracking-wider text-[#D4D8E1] hover:bg-white/5 disabled:opacity-50"><LogOut className="h-3.5 w-3.5" />Sign out</button>
            </>
          ) : (
            <>
              {mode === 'sign-up' && (
                <>
                  <div><label className={labelClass} htmlFor="auth-full-name">Full name</label><input id="auth-full-name" className={fieldClass} value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" required minLength={2} maxLength={120} /></div>
                  <div><label className={labelClass} htmlFor="auth-role">I am joining as</label><select id="auth-role" className={fieldClass} value={role} onChange={(e) => setRole(e.target.value as 'student' | 'alumni')}><option value="student">Student</option><option value="alumni">Alumni</option></select></div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div><label className={labelClass} htmlFor="auth-department">Department</label><select id="auth-department" className={fieldClass} value={department} onChange={(e) => setDepartment(e.target.value)}><option>CSE</option><option>ECE</option><option>CSAM</option><option>CB</option><option>HCD</option></select></div>
                    <div><label className={labelClass} htmlFor="auth-graduation-year">Graduation year</label><input id="auth-graduation-year" className={fieldClass} type="number" min="1950" max="2100" value={graduationYear} onChange={(e) => setGraduationYear(e.target.value)} /></div>
                  </div>
                  {role === 'alumni' && <div><label className={labelClass} htmlFor="auth-degree">Degree</label><input id="auth-degree" className={fieldClass} value={degree} onChange={(e) => setDegree(e.target.value)} maxLength={160} placeholder="e.g. B.Tech in Computer Science" /></div>}
                  {role === 'alumni' && <div className="grid gap-4 sm:grid-cols-2"><div><label className={labelClass} htmlFor="auth-title">Current title</label><input id="auth-title" className={fieldClass} value={currentTitle} onChange={(e) => setCurrentTitle(e.target.value)} maxLength={120} /></div><div><label className={labelClass} htmlFor="auth-company">Company</label><input id="auth-company" className={fieldClass} value={company} onChange={(e) => setCompany(e.target.value)} maxLength={120} /></div></div>}
                </>
              )}
              <div><label className={labelClass} htmlFor="auth-email">Email address</label><input id="auth-email" type="email" autoComplete="email" className={fieldClass} value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={254} /></div>
              {mode !== 'reset' && <div><label className={labelClass} htmlFor="auth-password">{mode === 'recovery' ? 'New password' : 'Password'}</label><div className="relative"><input id="auth-password" type={showPassword ? 'text' : 'password'} autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'} className={`${fieldClass} pr-12`} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={mode === 'sign-in' ? 1 : 8} /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9FA6B2]">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>}
              {(mode === 'sign-up' || mode === 'recovery') && <div><label className={labelClass} htmlFor="auth-confirm-password">Confirm password</label><input id="auth-confirm-password" type="password" autoComplete="new-password" className={fieldClass} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={8} /></div>}
              <button type="button" onClick={(event) => void handleSubmit(event as unknown as React.FormEvent)} disabled={loading || !supabase} className="w-full rounded-full bg-[#F5F5F7] py-3 text-xs font-semibold uppercase tracking-wider text-[#050507] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50">{loading ? 'Please wait…' : ({ 'sign-in': 'Sign in', 'sign-up': 'Create account', reset: 'Send reset link', recovery: 'Update password' }[mode])}</button>
              {notice && <p role="status" className="rounded-lg border border-emerald-400/20 bg-emerald-400/[0.06] p-3 text-xs leading-relaxed text-emerald-100">{notice}</p>}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 text-xs text-[#9FA6B2]">
                {mode === 'sign-in' && <><button type="button" onClick={() => { setMode('reset'); setNotice(''); setError(''); }} className="hover:text-white">Forgot password?</button><button type="button" onClick={() => { setMode('sign-up'); setNotice(''); setError(''); }} className="hover:text-white">Create an account</button></>}
                {mode === 'sign-up' && <button type="button" onClick={() => { setMode('sign-in'); setNotice(''); setError(''); }} className="hover:text-white">Already have an account? Sign in</button>}
                {(mode === 'reset' || mode === 'recovery') && <button type="button" onClick={() => { setMode('sign-in'); setNotice(''); setError(''); }} className="hover:text-white">Back to sign in</button>}
              </div>
            </>
          )}
          {error && <p role="alert" className="rounded-lg border border-red-400/25 bg-red-400/[0.07] p-3 text-xs leading-relaxed text-red-200">{error}</p>}
        </div>
        {mode === 'account' && <p className="px-6 pb-5 text-[10px] leading-relaxed text-[#818895]">Your email address is managed by Supabase Auth and is not exposed as part of the public alumni directory.</p>}
      </section>
    </div>
  );
};
