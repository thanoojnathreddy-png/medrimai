import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { storageService } from '../../services/storageService';
import { UserAvatar } from '../common/UserAvatar';
import { X, Check, ShieldCheck, UserPlus, ArrowRight, Loader2 } from 'lucide-react';

interface GoogleAccountChooserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
  defaultRole?: 'patient' | 'caregiver';
}

export const GoogleAccountChooserModal: React.FC<GoogleAccountChooserModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultRole = 'patient',
}) => {
  const [selectedRole, setSelectedRole] = useState<'patient' | 'caregiver'>(defaultRole);
  const [loading, setLoading] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [isAddingOther, setIsAddingOther] = useState(false);

  if (!isOpen) return null;

  const accounts = [
    {
      name: 'Thanooj Nath Reddy',
      email: 'thanoojnathreddy@gmail.com',
      badge: 'Verified Google Account',
    },
    {
      name: 'Eleanor Vance',
      email: 'eleanor.vance@gmail.com',
      badge: 'Demo Patient Profile',
    },
    {
      name: 'David Vance',
      email: 'david.vance@gmail.com',
      badge: 'Demo Caregiver Profile',
    },
  ];

  const handleSelectAccount = (account: { name: string; email: string }) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const googleUser: UserProfile = {
        id: `usr_g_${Date.now()}`,
        name: account.name,
        email: account.email,
        role: selectedRole,
        age: selectedRole === 'patient' ? 64 : 38,
        emergencyContact: {
          name: selectedRole === 'patient' ? 'Family Caregiver' : 'Assigned Patient',
          phone: '+1 (555) 789-0123',
          relation: selectedRole === 'patient' ? 'Next of Kin' : 'Patient',
        },
        authProvider: 'google',
      };

      storageService.setUser(googleUser);
      localStorage.setItem('medisync_authenticated', 'true');
      onSuccess(googleUser);
      onClose();
    }, 600);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim()) return;
    handleSelectAccount({
      name: customName.trim() || customEmail.split('@')[0],
      email: customEmail.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Google Header */}
        <div className="text-center pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
          {/* Authentic Google 'G' Logo */}
          <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center mx-auto shadow-xs mb-3">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          </div>
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
            Sign in with Google
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Choose an account to continue to <strong>MediSync Health</strong>
          </p>
        </div>

        {/* Role Toggle Selector before sign-in */}
        <div className="mb-4">
          <span className="text-[11px] font-bold text-slate-500 block mb-1.5 uppercase tracking-wider">
            Sign in as:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSelectedRole('patient')}
              className={`p-2 rounded-xl border text-xs font-bold text-center transition ${
                selectedRole === 'patient'
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              👤 Patient
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('caregiver')}
              className={`p-2 rounded-xl border text-xs font-bold text-center transition ${
                selectedRole === 'caregiver'
                  ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              👥 Caregiver
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 space-y-3">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Connecting Google Account...
            </p>
            <p className="text-[11px] text-slate-400">Verifying session tokens with MediSync.</p>
          </div>
        ) : isAddingOther ? (
          <form onSubmit={handleCustomSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Your Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Alex Miller"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Google Email Address</label>
              <input
                type="email"
                required
                placeholder="name@gmail.com"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
              >
                Sign In with this Google Account
              </button>
              <button
                type="button"
                onClick={() => setIsAddingOther(false)}
                className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
              >
                Back
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-2">
            {accounts.map((acc, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectAccount(acc)}
                className="w-full p-3 rounded-2xl border border-slate-200/90 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-slate-800/80 text-left transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <UserAvatar name={acc.name} size="md" />
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {acc.name}
                    </h4>
                    <p className="text-[11px] text-slate-500">{acc.email}</p>
                    <span className="text-[9px] font-semibold text-blue-600 dark:text-blue-400 block mt-0.5">
                      {acc.badge}
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition" />
              </button>
            ))}

            <button
              type="button"
              onClick={() => setIsAddingOther(true)}
              className="w-full p-3 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center justify-center gap-2 transition"
            >
              <UserPlus className="w-4 h-4 text-slate-400" />
              <span>Use another Google account</span>
            </button>
          </div>
        )}

        {/* Security / Terms Disclaimer */}
        <p className="mt-5 text-[10px] text-center text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
          To continue, Google will share your name, email address, language preference, and profile picture with MediSync. See our{' '}
          <span className="text-blue-600 dark:text-blue-400 underline cursor-pointer">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
};
