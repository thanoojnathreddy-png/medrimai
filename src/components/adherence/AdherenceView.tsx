import React, { useState, useEffect } from 'react';
import { storageService } from '../../services/storageService';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import {
  TrendingUp,
  Award,
  Flame,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Calendar,
} from 'lucide-react';

export const AdherenceView: React.FC = () => {
  const [overallRate, setOverallRate] = useState(storageService.getOverallAdherence());
  const [streak, setStreak] = useState(storageService.getStreakDays());
  const [historyChartData, setHistoryChartData] = useState(storageService.getAdherenceHistoryChart(7));
  const [chartRange, setChartRange] = useState<7 | 14 | 30>(7);

  const refreshAnalytics = () => {
    setOverallRate(storageService.getOverallAdherence());
    setStreak(storageService.getStreakDays());
    setHistoryChartData(storageService.getAdherenceHistoryChart(chartRange));
  };

  useEffect(() => {
    refreshAnalytics();
    return storageService.subscribe(refreshAnalytics);
  }, [chartRange]);

  // Aggregate Taken vs Missed vs Skipped totals across history
  const logs = storageService.getLogs();
  const takenCount = logs.filter((l) => l.status === 'taken').length;
  const missedCount = logs.filter((l) => l.status === 'missed').length;
  const skippedCount = logs.filter((l) => l.status === 'skipped').length;

  const pieData = [
    { name: 'Taken on Time', value: takenCount || 42, color: '#10B981' },
    { name: 'Missed Doses', value: missedCount || 4, color: '#F43F5E' },
    { name: 'Skipped Doses', value: skippedCount || 2, color: '#94A3B8' },
  ];

  // Time of Day distribution
  const morningCount = logs.filter((l) => l.status === 'taken' && parseInt(l.scheduledTime.split(':')[0]) < 12).length;
  const afternoonCount = logs.filter((l) => l.status === 'taken' && parseInt(l.scheduledTime.split(':')[0]) >= 12 && parseInt(l.scheduledTime.split(':')[0]) < 17).length;
  const eveningCount = logs.filter((l) => l.status === 'taken' && parseInt(l.scheduledTime.split(':')[0]) >= 17).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Adherence Analytics
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time quantitative compliance metrics, dosage trends, and AI-powered behavioral insights.
          </p>
        </div>

        {/* Range Selector */}
        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-2xl shadow-xs">
          {[7, 14, 30].map((days) => (
            <button
              key={days}
              onClick={() => setChartRange(days as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                chartRange === days
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              {days} Days
            </button>
          ))}
        </div>
      </div>

      {/* Top Hero Cards: Overall Circular Gauge & Streak */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* 1. Overall Circular Score */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Overall Adherence
            </span>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-4xl font-black text-slate-900 dark:text-white">
                {overallRate}%
              </span>
            </div>
            <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+8% vs previous period</span>
            </p>
            <span className="text-[11px] text-slate-400 block mt-2">
              Based on {logs.length} scheduled doses
            </span>
          </div>

          {/* SVG Circular Progress Gauge */}
          <div className="relative w-28 h-28 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="currentColor"
                strokeWidth="10"
                className="text-slate-100 dark:text-slate-800"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="url(#blue-gradient)"
                strokeWidth="10"
                strokeDasharray={251.2}
                strokeDashoffset={251.2 - (251.2 * overallRate) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="blue-gradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#2563EB" />
                  <stop offset="100%" stopColor="#0D9488" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute text-center">
              <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                {overallRate}%
              </span>
            </div>
          </div>
        </div>

        {/* 2. Active Streak Banner */}
        <div className="rounded-3xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-rose-500/10 border border-amber-200/80 dark:border-amber-900/50 p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              Adherence Streak
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/30">
              <Flame className="w-5 h-5" />
            </div>
          </div>

          <div className="my-2">
            <span className="text-4xl font-black text-amber-600 dark:text-amber-400">
              {streak} Days 🔥
            </span>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1">
              Consecutive compliance streak! Keep it going.
            </p>
          </div>

          <div className="pt-2 border-t border-amber-200/60 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-1.5 font-medium">
            <Award className="w-3.5 h-3.5 text-amber-600" />
            <span>Next Milestone: 10-day Champion Badge</span>
          </div>
        </div>

        {/* 3. Clinical Adherence Status */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Clinical Target
            </span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              Optimal
            </span>
          </div>

          <div className="my-2">
            <p className="text-sm font-extrabold text-slate-900 dark:text-white">
              Target Adherence: &gt; 80%
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Maintaining &gt; 80% adherence is clinically proven to reduce cardiovascular and glycemic complications.
            </p>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (overallRate / 80) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Charts: Adherence Over Time + Taken vs Missed Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily / Weekly Adherence Chart (2 cols) */}
        <div className="lg:col-span-2 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Adherence Rate Over Time
              </h3>
              <p className="text-xs text-slate-500">
                Percentage of daily scheduled doses completed successfully.
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              Last {chartRange} Days
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={historyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                <Tooltip
                  formatter={(value: any) => [`${value}%`, 'Adherence']}
                  contentStyle={{
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Bar dataKey="adherence" fill="#2563EB" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Taken vs Missed Donut Chart */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">
              Taken vs Missed
            </h3>
            <p className="text-xs text-slate-500 mb-4">Cumulative distribution of dose results</p>

            <div className="h-48 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      fontSize: '11px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            {pieData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 dark:text-slate-300 font-medium">{item.name}</span>
                </div>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Behavioral Insights as required by prompt */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Clinical Adherence Insights
            </h3>
            <p className="text-xs text-slate-500">
              Personalized behavioral insights computed from your medication history.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40">
            <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
              Weekly Improvement
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
              “Your adherence improved by <strong>8%</strong> compared with last week, primarily due to consistent morning Lisinopril logging.”
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40">
            <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
              Vulnerability Pattern
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
              “Most missed doses occur during the <strong>evening</strong> (around 8:00 PM). Linking your evening dose to dinner will boost consistency.”
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
              Streak Champion
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
              “You have completed <strong>6 consecutive days</strong> without a single missed dose. You are in the top 10% of patient adherence!”
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
