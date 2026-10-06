import React from 'react';

interface UserAvatarProps {
  name?: string;
  role?: 'patient' | 'caregiver' | string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const getInitials = (name?: string): string => {
  if (!name || !name.trim()) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name = 'User',
  role = 'patient',
  size = 'md',
  className = '',
}) => {
  const initials = getInitials(name);

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px] font-bold rounded-lg',
    sm: 'w-8 h-8 text-xs font-bold rounded-xl',
    md: 'w-10 h-10 text-xs sm:text-sm font-extrabold rounded-2xl',
    lg: 'w-12 h-12 text-sm sm:text-base font-extrabold rounded-2xl',
    xl: 'w-16 h-16 text-xl font-black rounded-3xl',
  }[size];

  // Distinct clean gradient based on healthcare role
  const roleClasses =
    role === 'caregiver'
      ? 'bg-gradient-to-tr from-teal-600 via-emerald-600 to-teal-500 text-white shadow-xs'
      : 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 text-white shadow-xs';

  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 select-none tracking-wider font-mono border border-white/20 dark:border-slate-800 ${sizeClasses} ${roleClasses} ${className}`}
      aria-label={`Avatar for ${name}`}
      title={name}
    >
      <span>{initials}</span>
    </div>
  );
};
