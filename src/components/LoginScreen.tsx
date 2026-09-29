import React, { useState } from 'react';
import { User } from '../types';
import { getUsers, saveUser } from '../services/storage';
import { Shield, BookOpen, UserCheck, Lock, KeyRound, AlertCircle, Sparkles, CheckCircle2, Building2 } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
  users: User[];
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, users }) => {
  const crestLogo = 'https://fedpolyukana.edu.ng/wp-content/uploads/2026/07/Logo-150x150-removebg-preview.png';

  const [roleTab, setRoleTab] = useState<'student' | 'lecturer' | 'admin'>('student');
  const [regNoOrEmail, setRegNoOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('Science Laboratory Technology');
  const [errorMessage, setErrorMessage] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const departmentsList = [
    'Science Laboratory Technology',
    'Computer Science',
    'Statistics & Mathematics',
    'Civil Engineering Technology',
    'Electrical/Electronic Engineering',
    'Business Administration & Management',
    'Accountancy',
    'Mass Communication',
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const inputClean = regNoOrEmail.trim().toLowerCase();
    const allUsers = getUsers();

    // Match candidate or staff by matric number, email, or username
    let matchedUser = allUsers.find(
      (u) =>
        u.role === roleTab &&
        (u.email.toLowerCase() === inputClean ||
          u.studentId?.toLowerCase() === inputClean ||
          u.fullName.toLowerCase().includes(inputClean))
    );

    // If not found in role tab, check globally
    if (!matchedUser) {
      matchedUser = allUsers.find(
        (u) =>
          u.email.toLowerCase() === inputClean ||
          u.studentId?.toLowerCase() === inputClean
      );
    }

    if (matchedUser) {
      onLoginSuccess(matchedUser);
      return;
    }

    // If student enters a new matriculation number, register candidate on the fly
    if (roleTab === 'student' && regNoOrEmail.trim().length >= 4) {
      const newStudentName = fullName.trim() || `Candidate ${regNoOrEmail.trim().toUpperCase()}`;
      const newStudent: User = {
        id: `usr-std-${Date.now()}`,
        email: `${regNoOrEmail.trim().toLowerCase().replace(/[^a-z0-9]/g, '')}@student.fedpolyukana.edu.ng`,
        fullName: newStudentName,
        role: 'student',
        department: department,
        studentId: regNoOrEmail.trim().toUpperCase(),
        status: true,
        createdAt: new Date().toISOString(),
      };
      saveUser(newStudent);
      onLoginSuccess(newStudent);
      return;
    }

    setErrorMessage('Invalid credentials. Please verify your Registration Number/Staff ID or use a Quick Demo Login.');
  };

  // Demo auto-fill handlers
  const fillDemoStudent = () => {
    const student = users.find((u) => u.role === 'student') || {
      studentId: '2025/ND/SLT/001',
      fullName: 'Arit Okon Effiong',
    };
    setRoleTab('student');
    setRegNoOrEmail(student.studentId || '2025/ND/SLT/001');
    setPassword('ukana123');
    setFullName(student.fullName);
    setErrorMessage('');
  };

  const fillDemoLecturer = () => {
    const lecturer = users.find((u) => u.role === 'lecturer') || {
      email: 'bassey@fedpolyukana.edu.ng',
    };
    setRoleTab('lecturer');
    setRegNoOrEmail(lecturer.email);
    setPassword('ukana123');
    setErrorMessage('');
  };

  const fillDemoAdmin = () => {
    const admin = users.find((u) => u.role === 'admin') || {
      email: 'admin@fedpolyukana.edu.ng',
    };
    setRoleTab('admin');
    setRegNoOrEmail(admin.email);
    setPassword('ukana123');
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between relative overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950 via-slate-900 to-slate-950">
      
      {/* Background Decorative Crest Overlay */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-700/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Federal Ribbon */}
      <div className="bg-[#004822] border-b border-emerald-800/60 py-2 px-4 text-center text-xs text-emerald-200 font-medium tracking-wide shadow-md">
        <span className="font-bold text-white uppercase">Federal Polytechnic Ukana</span> · Directorate of General Studies (GNS) CBT Portal · 2025/2026 Academic Session
      </div>

      {/* Main Login Card */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="w-full max-w-lg bg-slate-800/90 border border-emerald-900/60 rounded-3xl shadow-2xl backdrop-blur-md overflow-hidden">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-green-900 p-6 sm:p-8 text-center text-white relative">
            <div className="w-20 h-20 bg-white rounded-2xl p-1 mx-auto mb-3.5 shadow-xl border-2 border-emerald-400/40 flex items-center justify-center">
              <img
                src={crestLogo}
                alt="Federal Polytechnic Ukana Crest"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold uppercase tracking-tight text-emerald-100">
              FEDERAL POLYTECHNIC UKANA
            </h1>
            <p className="text-xs font-semibold text-amber-300 mt-1 uppercase tracking-wider">
              Directorate of General Studies (GNS)
            </p>
            <p className="text-[11px] text-emerald-200/90 mt-0.5">
              Computer-Based Examination & Authentication System
            </p>
          </div>

          {/* Quick Demo Login Chips */}
          <div className="bg-slate-900/80 px-6 py-3 border-b border-slate-700/60 flex items-center justify-between gap-2 overflow-x-auto">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 shrink-0 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Demo Quick Access:
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={fillDemoStudent}
                className="px-2.5 py-1 bg-emerald-900/60 hover:bg-emerald-800 border border-emerald-700/50 text-emerald-200 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Candidate
              </button>
              <button
                type="button"
                onClick={fillDemoLecturer}
                className="px-2.5 py-1 bg-blue-900/60 hover:bg-blue-800 border border-blue-700/50 text-blue-200 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Lecturer
              </button>
              <button
                type="button"
                onClick={fillDemoAdmin}
                className="px-2.5 py-1 bg-amber-900/60 hover:bg-amber-800 border border-amber-700/50 text-amber-200 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer"
              >
                HOD / Admin
              </button>
            </div>
          </div>

          {/* Role Tabs */}
          <div className="grid grid-cols-3 border-b border-slate-700/80 text-xs font-semibold bg-slate-900/40">
            <button
              onClick={() => {
                setRoleTab('student');
                setErrorMessage('');
              }}
              className={`py-3 flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                roleTab === 'student'
                  ? 'border-emerald-500 text-emerald-300 bg-slate-800/80 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>Candidate</span>
            </button>
            <button
              onClick={() => {
                setRoleTab('lecturer');
                setErrorMessage('');
              }}
              className={`py-3 flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                roleTab === 'lecturer'
                  ? 'border-blue-500 text-blue-300 bg-slate-800/80 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-4 h-4 text-blue-400" />
              <span>Lecturer</span>
            </button>
            <button
              onClick={() => {
                setRoleTab('admin');
                setErrorMessage('');
              }}
              className={`py-3 flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                roleTab === 'admin'
                  ? 'border-amber-500 text-amber-300 bg-slate-800/80 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Shield className="w-4 h-4 text-amber-400" />
              <span>HOD / Admin</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="p-6 sm:p-8 space-y-4">
            
            {/* Identity Field */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                {roleTab === 'student' ? 'Matric / Registration Number' : 'Staff Email / Official ID'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder={
                    roleTab === 'student'
                      ? 'e.g. 2025/ND/SLT/001'
                      : 'e.g. bassey@fedpolyukana.edu.ng'
                  }
                  value={regNoOrEmail}
                  onChange={(e) => setRegNoOrEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-900/90 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white placeholder:text-slate-500 transition-all font-mono"
                />
              </div>
            </div>

            {/* Candidate Name field if student wants to auto-register */}
            {roleTab === 'student' && (
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Candidate Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Arit Okon Effiong"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-900/90 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white placeholder:text-slate-500 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Department Selection for Candidate */}
            {roleTab === 'student' && (
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Academic Department
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-900/90 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white transition-all cursor-pointer"
                  >
                    {departmentsList.map((d) => (
                      <option key={d} value={d} className="bg-slate-800 text-white">
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Password / Access PIN
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-900/90 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white placeholder:text-slate-500 transition-all"
                />
              </div>
            </div>

            {/* Error Display */}
            {errorMessage && (
              <div className="p-3 bg-red-950/80 border border-red-800/80 rounded-xl flex items-start gap-2.5 text-xs text-red-200">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg hover:shadow-emerald-900/50 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Sign In to CBT Portal</span>
            </button>

            <div className="flex items-center justify-between pt-2 text-xs text-slate-400">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500"
                />
                <span>Remember Workstation</span>
              </label>
              <span className="text-emerald-400/80 font-mono text-[11px]">Server: ONLINE</span>
            </div>

          </form>

          {/* Footer inside Card */}
          <div className="bg-slate-900/90 p-4 border-t border-slate-700/60 text-center text-[11px] text-slate-400 font-mono">
            P.M.B. 2014, Ikot Ekpene, Akwa Ibom State, Nigeria
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="py-3 text-center text-xs text-slate-400 border-t border-slate-800/60 bg-slate-950 font-mono">
        © 2025/2026 Federal Polytechnic Ukana · Directorate of General Studies (GNS) CBT System
      </footer>

    </div>
  );
};
