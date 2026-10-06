import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { storageService } from '../../services/storageService';
import { initialUser, initialCaregiverUser } from '../../data/mockData';
import {
  Lock,
  Mail,
  User,
  ShieldCheck,
  ArrowRight,
  Check,
  Sparkles,
  HeartPulse,
  Users2,
  Eye,
  EyeOff,
  ChevronLeft,
} from 'lucide-react';
import { GoogleSignInButton } from './GoogleSignInButton';
import { GoogleAccountChooserModal } from './GoogleAccountChooserModal';

interface AuthViewProps {
  initialMode?: 'login' | 'register';
  onSuccess: (user: UserProfile) => void;
  onBackToLanding: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  initialMode = 'login',
  onSuccess,
  onBackToLanding,
}) => {
  const [tab, setTab] = useState<'login' | 'register' | 'forgot'>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'patient' | 'caregiver'>('patient');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotSubmitted, setForgotSubmitted] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (tab === 'login') {
      if (!email.trim() || !password.trim()) {
        setError('Please enter both your email address and password.');
        return;
      }
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        const existing = storageService.getUser();
        let authedUser: UserProfile;

        // If email or password hints at caregiver, route to caregiver profile
        if (
          email.toLowerCase().includes('caregiver') ||
          email.toLowerCase().includes('david') ||
          role === 'caregiver'
        ) {
          authedUser = initialCaregiverUser;
        } else {
          authedUser = {
            ...existing,
            email,
            name: existing.name || email.split('@')[0],
          };
        }

        storageService.setUser(authedUser);
        localStorage.setItem('medisync_authenticated', 'true');
        onSuccess(authedUser);
      }, 500);
    } else if (tab === 'register') {
      if (!fullName.trim() || !email.trim() || !password.trim()) {
        setError('Please fill out all required fields.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please verify your confirm password.');
        return;
      }
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        const newUser: UserProfile = {
          id: `usr_${Date.now()}`,
          name: fullName.trim(),
          email: email.trim(),
          role,
          age: role === 'patient' ? 64 : 38,
          emergencyContact: {
            name: role === 'patient' ? 'Family Contact' : 'Assigned Patient',
            phone: '+1 (555) 345-6789',
            relation: role === 'patient' ? 'Caregiver' : 'Patient',
          },
        };

        storageService.setUser(newUser);
        localStorage.setItem('medisync_authenticated', 'true');
        onSuccess(newUser);
      }, 600);
    } else if (tab === 'forgot') {
      if (!email.trim()) {
        setError('Please provide your registered account email.');
        return;
      }
      setForgotSubmitted(true);
    }
  };

  const handleQuickDemoPatient = () => {
    storageService.setUser(initialUser);
    localStorage.setItem('medisync_authenticated', 'true');
    onSuccess(initialUser);
  };

  const handleQuickDemoCaregiver = () => {
    storageService.setUser(initialCaregiverUser);
    localStorage.setItem('medisync_authenticated', 'true');
    onSuccess(initialCaregiverUser);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Top Back Navigation */}
      <div className="max-w-md w-full mx-auto mb-4 flex items-center justify-between">
        <button
          onClick={onBackToLanding}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Landing Page</span>
        </button>

        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold uppercase tracking-wider">
          v2.4 Healthcare Edition
        </span>
      </div>

      <div className="max-w-md w-full mx-auto space-y-6">
        {/* Brand Header */}
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-teal-400 text-white flex items-center justify-center font-black text-2xl mx-auto shadow-xl shadow-blue-500/20 mb-3">
            M
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {tab === 'login' && 'Sign In to MediSync'}
            {tab === 'register' && 'Create Your MediSync Account'}
            {tab === 'forgot' && 'Reset Your Password'}
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {tab === 'login' && 'Access your prescriptions, personalized dosage schedule, and adherence logs.'}
            {tab === 'register' && 'Choose whether you are managing personal medicines or monitoring as a caregiver.'}
            {tab === 'forgot' && 'Enter your email address and we will dispatch a secure reset link.'}
          </p>
        </div>

        {/* Tab switchers */}
        {tab !== 'forgot' && (
          <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-slate-200/80 dark:bg-slate-800 text-xs font-bold">
            <button
              onClick={() => {
                setTab('login');
                setError('');
              }}
              className={`py-2 rounded-xl transition ${
                tab === 'login'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setTab('register');
                setError('');
              }}
              className={`py-2 rounded-xl transition ${
                tab === 'register'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Register New Account
            </button>
          </div>
        )}

        {/* Auth Card */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-xl shadow-slate-900/5">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400 font-medium">
              {error}
            </div>
          )}

          {forgotSubmitted ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 mx-auto flex items-center justify-center">
                <Check className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white">Reset Email Dispatched</h4>
              <p className="text-xs text-slate-500">
                We sent password recovery instructions to <strong className="text-slate-800 dark:text-slate-200">{email}</strong>.
              </p>
              <button
                onClick={() => {
                  setForgotSubmitted(false);
                  setTab('login');
                }}
                className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs"
              >
                Return to Sign In
              </button>
            </div>
          ) : (
            <div>
              {/* Google Sign In Banner Button */}
              <div className="mb-5 space-y-3">
                <GoogleSignInButton
                  onClick={() => setShowGoogleModal(true)}
                  text={tab === 'register' ? 'Sign up with Google' : 'Sign in with Google'}
                />

                <div className="relative flex items-center justify-center my-4">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                  <span className="bg-white dark:bg-slate-900 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider absolute">
                    or with email
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
              {tab === 'register' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Full Legal Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Eleanor Vance"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Role Selection */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Select Account Role *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setRole('patient')}
                        className={`p-3 rounded-xl border text-xs font-bold text-left transition ${
                          role === 'patient'
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span>👤 Patient</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-normal block">
                          Manage my prescriptions & doses
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRole('caregiver')}
                        className={`p-3 rounded-xl border text-xs font-bold text-left transition ${
                          role === 'caregiver'
                            ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span>👥 Caregiver</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-normal block">
                          Monitor a family member or patient
                        </span>
                      </button>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {tab !== 'forgot' && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Password *
                    </label>
                    {tab === 'login' && (
                      <button
                        type="button"
                        onClick={() => setTab('forgot')}
                        className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              )}

              {tab === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {tab === 'login' && (
                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Remember my session</span>
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 text-xs font-bold shadow-md shadow-blue-600/25 active:scale-98 transition"
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : tab === 'login' ? (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : tab === 'register' ? (
                  <>
                    <span>Complete Registration</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <span>Send Password Reset Email</span>
                )}
              </button>
            </form>
          </div>
          )}

          {/* 1-Click Instant Demo Accounts */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block text-center mb-2.5">
              Instant 1-Click Demo Profiles
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleQuickDemoPatient}
                className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 border border-blue-200/80 dark:border-blue-900 text-[11px] font-bold text-blue-700 dark:text-blue-300 transition"
              >
                👤 Patient (Eleanor)
              </button>
              <button
                type="button"
                onClick={handleQuickDemoCaregiver}
                className="p-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 dark:hover:bg-teal-900/60 border border-teal-200/80 dark:border-teal-900 text-[11px] font-bold text-teal-700 dark:text-teal-300 transition"
              >
                👥 Caregiver (David)
              </button>
            </div>
          </div>
        </div>

        {/* Privacy Note */}
        <p className="text-[11px] text-center text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Patient data is privately encrypted and strictly confidential.</span>
        </p>
      </div>

      {/* Google Account Chooser Modal */}
      <GoogleAccountChooserModal
        isOpen={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        onSuccess={onSuccess}
        defaultRole={role}
      />
    </div>
  );
};
