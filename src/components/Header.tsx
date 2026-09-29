import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { RefreshCw, ArrowRightLeft, Shield, BookOpen, Clock, CheckCircle2, UserCheck, Database, LogOut } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  currentUser: User;
  users: User[];
  onSwitchUser: (user: User) => void;
  onResetData: () => void;
  activeView: string;
  setActiveView: (view: string) => void;
  onOpenSupabase: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  users,
  onSwitchUser,
  onResetData,
  activeView,
  setActiveView,
  onOpenSupabase,
  onLogout,
}) => {
  const crestLogo = 'https://fedpolyukana.edu.ng/wp-content/uploads/2026/07/Logo-150x150-removebg-preview.png';
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-300 font-semibold px-2 py-0.5 rounded text-[11px]">
            <Shield className="w-3 h-3 text-amber-700" /> HOD / Admin
          </span>
        );
      case 'lecturer':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-900 border border-blue-300 font-semibold px-2 py-0.5 rounded text-[11px]">
            <BookOpen className="w-3 h-3 text-blue-700" /> Course Examiner
          </span>
        );
      case 'student':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-900 border border-emerald-300 font-semibold px-2 py-0.5 rounded text-[11px]">
            <UserCheck className="w-3 h-3 text-emerald-700" /> Candidate
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Official Federal Top Ribbon */}
      <div className="bg-[#005a2b] text-white text-[11px] font-medium tracking-wide py-1.5 px-4 sm:px-8 border-b border-[#004822]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold uppercase tracking-wider text-emerald-100">
              Federal Republic of Nigeria
            </span>
            <span className="text-emerald-300">·</span>
            <span className="font-semibold text-white">FEDERAL POLYTECHNIC UKANA</span>
            <span className="text-emerald-300 hidden sm:inline">·</span>
            <span className="text-emerald-100 hidden sm:inline">
              P.M.B. 2014, Ikot Ekpene, Akwa Ibom State
            </span>
          </div>

          <div className="flex items-center gap-3 text-emerald-100 text-[11px]">
            <span className="hidden md:inline">Directorate of General Studies (GNS)</span>
            <span className="text-emerald-300 hidden md:inline">·</span>
            <span className="bg-[#004320] px-2 py-0.5 rounded border border-[#00361a] text-emerald-200 font-mono text-[10px]">
              2025/2026 Academic Session
            </span>
            <span className="text-emerald-300">·</span>
            <span className="font-mono text-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              {currentTime || 'CBT Server Active'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Institutional Identity Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 gap-3">
          
          {/* Institutional Crest & Titles */}
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 bg-white rounded-lg border-2 border-emerald-900/10 p-0.5 flex items-center justify-center shrink-0 shadow-xs">
              <img
                src={crestLogo}
                alt="Federal Polytechnic Ukana Crest"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight tracking-tight uppercase">
                  FEDERAL POLYTECHNIC UKANA
                </h1>
              </div>
              <p className="text-xs font-semibold text-emerald-800 tracking-tight">
                DIRECTORATE OF GENERAL STUDIES (GNS)
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                Online Computer-Based Examination System · CBT Processing Directorate
              </p>
            </div>
          </div>

          {/* User Profile Bar & Role Switcher */}
          <div className="flex flex-wrap items-center justify-between md:justify-end gap-2.5 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-md text-xs">
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{currentUser.fullName}</span>
                  {getRoleBadge(currentUser.role)}
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  {currentUser.role === 'student' ? (
                    <span>
                      Matric: <strong className="text-slate-800 font-semibold">{currentUser.studentId}</strong> · {currentUser.department}
                    </span>
                  ) : (
                    <span>{currentUser.department} ({currentUser.workstation || 'Terminal 01'})</span>
                  )}
                </div>
              </div>

              {/* Fast User Switcher */}
              <div className="border-l border-slate-200 pl-2.5 ml-1">
                <label className="sr-only">Switch User Role</label>
                <select
                  value={currentUser.id}
                  onChange={(e) => {
                    const target = users.find((u) => u.id === e.target.value);
                    if (target) onSwitchUser(target);
                  }}
                  title="Switch user role to test student or examiner views"
                  className="bg-white border border-slate-300 text-slate-800 font-medium text-xs py-1 px-2.5 rounded focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer shadow-2xs hover:border-slate-400"
                >
                  <optgroup label="Academic Staff & Admins">
                    {users
                      .filter((u) => u.role !== 'student')
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.fullName} ({u.role.toUpperCase()})
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="Candidates (Students)">
                    {users
                      .filter((u) => u.role === 'student')
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.fullName} ({u.studentId})
                        </option>
                      ))}
                  </optgroup>
                </select>
              </div>
            </div>

            {/* PWA Install Button */}
            <PWAInstallButton />

            {/* Connect Supabase Button */}
            <button
              onClick={onOpenSupabase}
              title="Connect Supabase Cloud Database"
              className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-md border border-emerald-300 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Database className="w-3.5 h-3.5 text-emerald-700" />
              <span>Supabase DB</span>
            </button>

            {/* Reset Data to Seed Button */}
            <button
              onClick={onResetData}
              title="Reset records to default institutional state"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md border border-slate-200 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            {/* Sign Out Button */}
            <button
              onClick={onLogout}
              title="Sign out of CBT Portal"
              className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-md border border-red-200 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-red-600" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>

        </div>

        {/* Academic Staff Directorate Navigation Tabs */}
        {currentUser.role !== 'student' && (
          <nav className="flex items-center gap-6 border-t border-slate-200 text-xs font-semibold pt-0 overflow-x-auto">
            <button
              onClick={() => setActiveView('dashboard')}
              className={`py-2.5 transition-colors border-b-2 -mb-[1px] whitespace-nowrap cursor-pointer ${
                activeView === 'dashboard'
                  ? 'border-emerald-700 text-emerald-800 font-bold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Overview & Live Proctor
            </button>
            <button
              onClick={() => setActiveView('exams')}
              className={`py-2.5 transition-colors border-b-2 -mb-[1px] whitespace-nowrap cursor-pointer ${
                activeView === 'exams'
                  ? 'border-emerald-700 text-emerald-800 font-bold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              GNS Examinations Schedule
            </button>
            <button
              onClick={() => setActiveView('questions')}
              className={`py-2.5 transition-colors border-b-2 -mb-[1px] whitespace-nowrap cursor-pointer ${
                activeView === 'questions'
                  ? 'border-emerald-700 text-emerald-800 font-bold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Item Bank & Test Items
            </button>
            <button
              onClick={() => setActiveView('results')}
              className={`py-2.5 transition-colors border-b-2 -mb-[1px] whitespace-nowrap cursor-pointer ${
                activeView === 'results'
                  ? 'border-emerald-700 text-emerald-800 font-bold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Results & Broadsheet Center
            </button>
            <button
              onClick={() => setActiveView('audit')}
              className={`py-2.5 transition-colors border-b-2 -mb-[1px] whitespace-nowrap cursor-pointer ${
                activeView === 'audit'
                  ? 'border-emerald-700 text-emerald-800 font-bold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Proctor Audit & Anti-Malpractice
            </button>
          </nav>
        )}
      </div>
    </header>
  );
};
