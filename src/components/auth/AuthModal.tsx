import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { storageService } from '../../services/storageService';
import { initialUser, initialCaregiverUser } from '../../data/mockData';
import { Lock, Mail, User, X, Check, ArrowRight, ShieldCheck } from 'lucide-react';
import { GoogleSignInButton } from './GoogleSignInButton';
import { GoogleAccountChooserModal } from './GoogleAccountChooserModal';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register' | 'forgot';
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'reset-confirm'>(initialMode);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'patient' | 'caregiver'>('patient');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'login') {
      if (!email.trim() || !password.trim()) {
        setError('Please enter your email and password.');
        return;
      }
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        const existing = storageService.getUser();
        // If email matches caregiver
        if (email.toLowerCase().includes('caregiver') || email.toLowerCase().includes('david')) {
          storageService.setUser(initialCaregiverUser);
          onSuccess(initialCaregiverUser);
        } else {
          storageService.setUser(existing);
          onSuccess(existing);
        }
      }, 500);
    } else if (mode === 'register') {
      if (!fullName.trim() || !email.trim() || !password.trim()) {
        setError('Please fill in all required fields.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        const newUser: UserProfile = {
          id: `usr_${Date.now()}`,
          name: fullName,
          email,
          role,
          emergencyContact: {
            name: role === 'patient' ? 'Family Contact' : 'Assigned Patient',
            phone: '+1 (555) 000-0000',
            relation: role === 'patient' ? 'Next of Kin' : 'Patient',
          },
        };
        storageService.setUser(newUser);
        onSuccess(newUser);
      }, 600);
    } else if (mode === 'forgot') {
      if (!email.trim()) {
        setError('Please enter your email address.');
        return;
      }
      setForgotSent(true);
    }
  };

  const handleQuickDemoPatient = () => {
    storageService.setUser(initialUser);
    onSuccess(initialUser);
  };

  const handleQuickDemoCaregiver = () => {
    storageService.setUser(initialCaregiverUser);
    onSuccess(initialCaregiverUser);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-teal-400 text-white flex items-center justify-center font-black text-xl mx-auto shadow-md shadow-blue-500/25 mb-3">
            M
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
            {mode === 'login' && 'Sign in to MediSync'}
            {mode === 'register' && 'Create your MediSync account'}
            {mode === 'forgot' && 'Reset your password'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {mode === 'login' && 'Enter your credentials to access your medication routine.'}
            {mode === 'register' && 'Join MediSync as a patient or caregiver.'}
            {mode === 'forgot' && "We'll send you instructions to reset your password."}
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400 font-medium">
            {error}
          </div>
        )}

        {forgotSent ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 mx-auto flex items-center justify-center">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white">Check your email</h4>
            <p className="text-xs text-slate-500">
              We have dispatched a password reset link to <strong className="text-slate-700 dark:text-slate-200">{email}</strong>.
            </p>
            <button
              onClick={() => {
                setForgotSent(false);
                setMode('login');
              }}
              className="mt-4 w-full py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <div>
            {/* Google Sign In option */}
            {mode !== 'forgot' && (
              <div className="mb-4">
                <GoogleSignInButton
                  onClick={() => setShowGoogleModal(true)}
                  text={mode === 'register' ? 'Sign up with Google' : 'Sign in with Google'}
                />
                <div className="relative flex items-center justify-center my-3.5">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                  <span className="bg-white dark:bg-slate-900 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider absolute">
                    or with email
                  </span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Eleanor Vance"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Role Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Select Your Role
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('patient')}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition ${
                        role === 'patient'
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      Patient
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('caregiver')}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition ${
                        role === 'caregiver'
                          ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      Caregiver
                    </button>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 text-xs font-bold shadow-md shadow-blue-600/25 transition active:scale-98"
            >
              {loading ? (
                <span>Processing...</span>
              ) : mode === 'login' ? (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              ) : mode === 'register' ? (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              ) : (
                <span>Send Reset Link</span>
              )}
            </button>
          </form>
          </div>
        )}

        {/* 1-Click Fast Demo Logins */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-2">
            Instant Demo Profiles
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleQuickDemoPatient}
              className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-900 text-[11px] font-bold text-blue-700 dark:text-blue-300 hover:bg-blue-100 transition"
            >
              👤 Patient (Eleanor)
            </button>
            <button
              type="button"
              onClick={handleQuickDemoCaregiver}
              className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200/80 dark:border-teal-900 text-[11px] font-bold text-teal-700 dark:text-teal-300 hover:bg-teal-100 transition"
            >
              👥 Caregiver (David)
            </button>
          </div>
        </div>

        {/* Switch mode links */}
        <div className="mt-5 text-center text-xs text-slate-500">
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>

      {/* Google Account Selector Dialog */}
      <GoogleAccountChooserModal
        isOpen={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        onSuccess={(googleUser) => {
          setShowGoogleModal(false);
          onSuccess(googleUser);
          onClose();
        }}
        defaultRole={role}
      />
    </div>
  );
};
