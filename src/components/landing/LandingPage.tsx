import React from 'react';
import {
  Bell,
  CheckCircle2,
  Clock,
  FileText,
  ShieldCheck,
  Users2,
  Bot,
  ArrowRight,
  Sparkles,
  Smartphone,
  Pill,
  Lock,
  HeartPulse,
  Flame,
  Check,
} from 'lucide-react';
import { PWAInstallButton } from '../common/PWAInstallButton';
import { GoogleSignInButton } from '../auth/GoogleSignInButton';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
  onGoogleSignIn?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin, onGoogleSignIn }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-blue-500/20">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-500 to-teal-400 text-white flex items-center justify-center font-black text-xl shadow-md shadow-blue-500/25">
              M
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                MediSync
              </span>
              <span className="text-[10px] ml-1.5 px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold uppercase tracking-wider">
                Health SaaS
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
              How It Works
            </a>
            <a href="#benefits" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
              Benefits
            </a>
            <a href="#security" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
              Security
            </a>
          </div>

          <div className="flex items-center gap-3">
            <PWAInstallButton compact />
            <button
              onClick={onLogin}
              className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 transition"
            >
              Sign In
            </button>
            <button
              onClick={onGetStarted}
              className="text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 shadow-sm shadow-blue-600/25 hover:shadow-md transition active:scale-95"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-6 overflow-hidden">
        {/* Soft background glows */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-blue-400/15 via-teal-400/10 to-indigo-400/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-900 text-xs font-semibold text-blue-700 dark:text-blue-300 mb-6 animate-in fade-in">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Next-Generation Medication Adherence & Management</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            Smart medication management, <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500 bg-clip-text text-transparent">
              made simple.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Organize your medicines, never miss a dose, and stay on top of your medication routine with intelligent reminders and adherence tracking.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 text-base font-bold shadow-lg shadow-blue-600/30 hover:shadow-xl transition-all active:scale-98"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#features"
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl border border-slate-300 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-slate-800 dark:text-slate-200 px-7 py-3.5 text-base font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Explore Features
            </a>
          </div>

          {/* Quick Google Sign In Hero integration */}
          <div className="mt-4 flex flex-col items-center justify-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Quick access with
            </span>
            <div className="w-full max-w-xs">
              <GoogleSignInButton
                onClick={onGoogleSignIn || onLogin}
                text="Continue with Google"
                compact
              />
            </div>
          </div>

          {/* Realistic Browser Mockup Frame with Dashboard Preview */}
          <div className="mt-14 max-w-4xl mx-auto rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/90 p-2 sm:p-3 shadow-2xl shadow-blue-900/10 backdrop-blur-md">
            {/* Browser top chrome */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-400" />
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>
              <div className="flex items-center gap-2 px-4 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-500">
                <Lock className="w-3 h-3 text-emerald-500" />
                https://app.medisync.health/dashboard
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Sync Active
              </div>
            </div>

            {/* Dashboard Mockup Content */}
            <div className="bg-slate-50 dark:bg-slate-950 rounded-b-2xl p-4 sm:p-6 text-left">
              {/* Mockup Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-slate-800">
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Good morning, Eleanor Vance 👋
                  </h3>
                  <p className="text-xs text-slate-500">Here’s your medication overview for today.</p>
                </div>
                <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-xl">
                  <Flame className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    87% Adherence
                  </span>
                </div>
              </div>

              {/* Mockup Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 font-medium">Today's Progress</span>
                  <p className="text-lg font-bold text-blue-600">75%</p>
                  <span className="text-[10px] text-slate-500">3 of 4 completed</span>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 font-medium">Today's Medicines</span>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">4</p>
                  <span className="text-[10px] text-slate-500">Active regimens</span>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 font-medium">Taken</span>
                  <p className="text-lg font-bold text-emerald-600">3</p>
                  <span className="text-[10px] text-emerald-500">On time</span>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 font-medium">Missed</span>
                  <p className="text-lg font-bold text-rose-500">1</p>
                  <span className="text-[10px] text-rose-400">Needs review</span>
                </div>
              </div>

              {/* Sample Timeline cards */}
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-slate-500">9:00 AM</span>
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                      💊
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-900 dark:text-white">Metformin 500 mg</p>
                      <p className="text-[11px] text-slate-400">1 tablet · After breakfast</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    ✅ Taken
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/60 shadow-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-blue-600">1:00 PM</span>
                    <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">
                      💊
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-900 dark:text-white">Vitamin D3</p>
                      <p className="text-[11px] text-slate-400">1 capsule · After lunch</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold px-2 py-1 rounded-lg bg-blue-100 text-blue-700">
                      ⏳ Upcoming
                    </span>
                    <button
                      onClick={onGetStarted}
                      className="text-[11px] font-bold px-3 py-1 rounded-lg bg-emerald-600 text-white"
                    >
                      Mark as Taken
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-white dark:bg-slate-900 border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Comprehensive Medical Routine Engine
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
              Everything you need for worry-free medication management
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
              Engineered for patients, families, and caregivers with clinical precision and effortless usability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Bell,
                color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/80',
                title: 'Smart Medication Reminders',
                desc: 'Precise audio chimes, native push notifications, and customizable snooze intervals tailored to your breakfast, lunch, and dinner routine.',
              },
              {
                icon: FileText,
                color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/80',
                title: 'Prescription Management',
                desc: 'Upload doctor prescriptions, track active refills, and maintain high-resolution digital records always within arm’s reach.',
              },
              {
                icon: Clock,
                color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/80',
                title: 'Medication History',
                desc: 'A permanent digital log of every dose taken, missed, or skipped. Filter by date, range, or drug to share with your physician.',
              },
              {
                icon: ShieldCheck,
                color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/80',
                title: 'Adherence Tracking',
                desc: 'Interactive Recharts analytics, weekly completion trends, circular adherence metrics, and real-time clinical streak rewards.',
              },
              {
                icon: Users2,
                color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/80',
                title: 'Caregiver Monitoring',
                desc: 'Generate secure invite codes for family or nurses. Caregivers receive automated alerts for repeated missed doses without compromising privacy.',
              },
              {
                icon: Bot,
                color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/80',
                title: 'AI Assistance & OCR',
                desc: 'Natural language queries grounded in your live schedule, alongside AI-assisted camera extraction from complex paper prescriptions.',
              },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-6 hover:shadow-xl hover:-translate-y-1 transition duration-200"
                >
                  <div className={`w-12 h-12 rounded-2xl ${feature.color} flex items-center justify-center mb-5 shadow-xs`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Seamless Workflow
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
              How MediSync works in 4 easy steps
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Add your medicines',
                desc: 'Enter names, tablet forms, dosages, and instructions or snap a prescription photo.',
              },
              {
                step: '02',
                title: 'Set your schedule',
                desc: 'Configure flexible daily reminders, meal timings (before, with, or after food), and intervals.',
              },
              {
                step: '03',
                title: 'Receive reminders',
                desc: 'Get prompt audio chimes, notifications, and instant one-tap Taken or Snooze buttons.',
              },
              {
                step: '04',
                title: 'Track your adherence',
                desc: 'Watch your adherence percentage climb, build streaks, and keep caregivers synced.',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6"
              >
                <div className="text-3xl font-extrabold text-blue-600/30 dark:text-blue-500/20 font-mono mb-3">
                  {item.step}
                </div>
                <h4 className="font-bold text-base text-slate-900 dark:text-white mb-2">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 px-6 bg-slate-100/70 dark:bg-slate-900/40 border-t border-slate-200/80 dark:border-slate-800">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Clinical & Personal Peace of Mind
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2 leading-tight">
                Designed to eliminate medication anxiety and confusion
              </h2>
              <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
                Managing multiple chronic prescriptions shouldn’t be a source of stress. MediSync ensures clarity, safety, and accountability every single day.
              </p>

              <div className="mt-6 space-y-3.5">
                {[
                  {
                    title: 'Reduce missed doses',
                    desc: 'Timely reminders with smart snoozes minimize forgotten tablets by over 92%.',
                  },
                  {
                    title: 'Organize prescriptions',
                    desc: 'Centralize paper doctor notes and digital files in an organized pharmacy vault.',
                  },
                  {
                    title: 'Monitor medication routines',
                    desc: 'Identify patterns, like missed evening doses, with actionable analytics.',
                  },
                  {
                    title: 'Keep caregivers informed',
                    desc: 'Loved ones can view your adherence dashboard remotely and check in when needed.',
                  },
                ].map((b, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{b.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual card */}
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-8 shadow-xl relative overflow-hidden">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-600 flex items-center justify-center">
                  <HeartPulse className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-slate-900 dark:text-white">
                    Patient Routine Health
                  </h4>
                  <p className="text-xs text-slate-400">Active monitoring enabled</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span>Weekly Adherence Target</span>
                    <span className="text-emerald-600 font-bold">87% Achieved</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[87%] rounded-full" />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400">Current Consecutive Streak</span>
                    <p className="font-extrabold text-base text-slate-900 dark:text-white">
                      6 Days Strong 🔥
                    </p>
                  </div>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-950 px-3 py-1.5 rounded-xl">
                    Gold Tier
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Privacy Section */}
      <section id="security" className="py-20 px-6">
        <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-br from-slate-900 to-blue-950 text-white p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-300 shrink-0">
              <Lock className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold tracking-wider uppercase text-blue-300">
                Security & Data Privacy
              </span>
              <h3 className="text-2xl font-bold mt-1">Your health data is private and strictly protected</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                MediSync enforces rigorous user-specific data boundaries. Prescriptions and medication logs are private to the patient. Caregivers can only view adherence statistics and missed alerts that you explicitly authorize. We do not sell or monetize personal health information.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Take control of your medication routine.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Join thousands of individuals and families who rely on MediSync for timely reminders, stress-free prescriptions, and proactive care.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto rounded-2xl bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 font-bold shadow-lg shadow-blue-600/30 transition active:scale-95"
            >
              Get Started Now
            </button>
            <button
              onClick={onLogin}
              className="w-full sm:w-auto rounded-2xl border border-slate-300 dark:border-slate-700 px-6 py-3.5 font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Log In to Existing Account
            </button>
          </div>

          <div className="mt-4 flex justify-center">
            <div className="w-full max-w-xs">
              <GoogleSignInButton
                onClick={onGoogleSignIn || onLogin}
                text="Continue with Google"
                compact
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
              M
            </div>
            <span className="font-extrabold text-base text-slate-900 dark:text-white">MediSync</span>
            <span className="text-xs text-slate-400">© 2026 MediSync Systems Inc. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-500 font-medium">
            <a href="#about" className="hover:text-blue-600">About</a>
            <a href="#features" className="hover:text-blue-600">Features</a>
            <a href="#privacy" className="hover:text-blue-600">Privacy Policy</a>
            <a href="#terms" className="hover:text-blue-600">Terms of Service</a>
            <a href="#contact" className="hover:text-blue-600">Contact Support</a>
          </div>
        </div>

        <p className="mt-6 text-[11px] text-center text-slate-400 max-w-2xl mx-auto">
          Medical Disclaimer: MediSync is a medication management and reminder tool, not a medical diagnosis or treatment system. Always consult a qualified healthcare provider for clinical advice or before altering any medication dosages.
        </p>
      </footer>
    </div>
  );
};
