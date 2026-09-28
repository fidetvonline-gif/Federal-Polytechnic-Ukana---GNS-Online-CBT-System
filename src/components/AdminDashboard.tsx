import React, { useState } from 'react';
import {
  Examination,
  Question,
  ExaminationSession,
  User,
  AuditLog,
  GNSCourseCategory,
} from '../types';
import { QuestionManager } from './QuestionManager';
import {
  Plus,
  Edit2,
  Trash2,
  Download,
  Printer,
  Search,
  Save,
  X,
  SlidersHorizontal,
  Clock,
  CheckCircle,
} from 'lucide-react';

interface AdminDashboardProps {
  examinations: Examination[];
  questions: Question[];
  sessions: ExaminationSession[];
  users: User[];
  auditLogs: AuditLog[];
  onSaveExamination: (exam: Examination) => void;
  onDeleteExamination: (id: string) => void;
  onSaveQuestion: (q: Question) => void;
  onDeleteQuestion: (id: string) => void;
  onSaveUser: (u: User) => void;
  onDeleteUser: (id: string) => void;
  onExportCSV: (examId: string) => void;
  onViewBroadsheet: (exam: Examination) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  examinations,
  questions,
  sessions,
  users,
  auditLogs,
  onSaveExamination,
  onDeleteExamination,
  onSaveQuestion,
  onDeleteQuestion,
  onSaveUser,
  onDeleteUser,
  onExportCSV,
  onViewBroadsheet,
  activeTab,
  setActiveTab,
}) => {
  // Modal states
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Partial<Examination> | null>(null);

  // Search & Filters
  const [selectedResultExamId, setSelectedResultExamId] = useState<string>(examinations[0]?.id || '');
  const [resultSearchQuery, setResultSearchQuery] = useState('');
  const [passThresholdFilter, setPassThresholdFilter] = useState<number>(50);

  // Stats computation
  const studentUsers = users.filter((u) => u.role === 'student');
  const totalStudents = studentUsers.length;
  const totalExams = examinations.length;
  const totalQuestions = questions.length;
  const totalSubmittedSessions = sessions.filter((s) => s.status === 'submitted').length;
  const totalInProgressSessions = sessions.filter((s) => s.status === 'in_progress').length;

  // Selected Exam for Results tab
  const selectedResultExam = examinations.find((e) => e.id === selectedResultExamId);
  const selectedSessions = sessions.filter((s) => s.examinationId === selectedResultExamId);
  const filteredSessions = selectedSessions.filter(
    (s) =>
      s.studentName.toLowerCase().includes(resultSearchQuery.toLowerCase()) ||
      s.studentRegNo.toLowerCase().includes(resultSearchQuery.toLowerCase())
  );

  // Exam Modal handlers
  const handleOpenAddExam = () => {
    setEditingExam({
      id: `exam-gns-${Date.now()}`,
      title: '',
      courseCode: 'GNS 10',
      courseCategory: 'english',
      creditUnits: 2,
      semester: 'First Semester',
      academicSession: '2025/2026',
      department: 'Directorate of General Studies',
      durationMinutes: 45,
      totalMarks: 50,
      passThresholdPercentage: 50,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
      status: 'active',
      createdBy: 'Dr. Okon E. Bassey (HOD)',
      createdAt: new Date().toISOString(),
      instructions: '1. Read each question carefully.\n2. Answers save continuously in real time.\n3. Automatic submission on expiration.',
      releaseResultsImmediately: true,
      shuffleQuestions: true,
      shuffleOptions: true,
      allowReview: true,
    });
    setIsExamModalOpen(true);
  };

  const handleOpenEditExam = (e: Examination) => {
    setEditingExam({ ...e });
    setIsExamModalOpen(true);
  };

  const handleSaveExamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExam || !editingExam.title || !editingExam.courseCode) return;
    onSaveExamination(editingExam as Examination);
    setIsExamModalOpen(false);
    setEditingExam(null);
  };

  const calculateGrade = (pct: number) => {
    if (pct >= 75) return { grade: 'A', remark: 'Distinction' };
    if (pct >= 70) return { grade: 'AB', remark: 'Very Good' };
    if (pct >= 65) return { grade: 'B', remark: 'Upper Credit' };
    if (pct >= 60) return { grade: 'BC', remark: 'Good' };
    if (pct >= 50) return { grade: 'C', remark: 'Lower Credit' };
    if (pct >= 45) return { grade: 'CD', remark: 'Pass' };
    if (pct >= 40) return { grade: 'D', remark: 'Fair' };
    return { grade: 'F', remark: 'Fail' };
  };

  return (
    <div className="space-y-6">
      
      {/* Directorate KPI Metric Ribbon */}
      <div className="bg-white border border-slate-300 rounded shadow-xs overflow-hidden">
        <div className="grid grid-cols-2 lg:grid-cols-5 divide-x divide-y lg:divide-y-0 divide-slate-200 text-xs">
          
          <div className="p-4 space-y-1">
            <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block">
              Registered Candidates
            </span>
            <div className="text-2xl font-bold font-mono text-slate-900">{totalStudents}</div>
            <span className="text-[11px] text-slate-500 font-sans">Across Poly Departments</span>
          </div>

          <div className="p-4 space-y-1">
            <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block">
              GNS Courses Configured
            </span>
            <div className="text-2xl font-bold font-mono text-slate-900">{totalExams}</div>
            <span className="text-[11px] text-slate-500 font-sans">English & Citizenship Units</span>
          </div>

          <div className="p-4 space-y-1">
            <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block">
              Question Bank Items
            </span>
            <div className="text-2xl font-bold font-mono text-slate-900">{totalQuestions}</div>
            <span className="text-[11px] text-slate-500 font-sans">Objective Items Stored</span>
          </div>

          <div className="p-4 space-y-1">
            <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block">
              Completed Submissions
            </span>
            <div className="text-2xl font-bold font-mono text-[#006633]">{totalSubmittedSessions}</div>
            <span className="text-[11px] text-slate-500 font-sans">Graded & Recorded</span>
          </div>

          <div className="p-4 space-y-1 col-span-2 lg:col-span-1">
            <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block">
              Active In-Hall Sessions
            </span>
            <div className="text-2xl font-bold font-mono text-amber-700">{totalInProgressSessions}</div>
            <span className="text-[11px] text-slate-500 font-sans">Live Examination Terminals</span>
          </div>

        </div>
      </div>

      {/* VIEW 1: OVERVIEW & LIVE HALL MONITOR */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          
          {/* Live CBT Terminals Monitor */}
          <div className="bg-white border border-slate-300 rounded shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Live Examination Hall Monitor
                </h3>
                <p className="text-xs text-slate-500">
                  Real-time status of candidate workstations and active GNS testing sessions.
                </p>
              </div>
              <span className="text-xs font-mono font-medium text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded">
                Centre: CBT Lab 02 · Hall A
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 uppercase text-[11px] border-b border-slate-200">
                    <th className="p-3">Matric No</th>
                    <th className="p-3 font-sans font-semibold">Candidate Name</th>
                    <th className="p-3">Department</th>
                    <th className="p-3">Course Code</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-center">Progress / Score</th>
                    <th className="p-3 text-right">Time Elapsed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sessions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-slate-400 font-sans">
                        No active or completed examination sessions recorded today.
                      </td>
                    </tr>
                  ) : (
                    sessions.map((sess) => {
                      const exam = examinations.find((e) => e.id === sess.examinationId);
                      const isComplete = sess.status === 'submitted';
                      const mins = Math.floor(sess.timeSpentSeconds / 60);

                      return (
                        <tr key={sess.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 font-bold text-slate-900">{sess.studentRegNo}</td>
                          <td className="p-3 font-sans font-medium text-slate-800">{sess.studentName}</td>
                          <td className="p-3 text-slate-600 text-[11px]">{sess.department}</td>
                          <td className="p-3 font-bold text-[#006633]">{exam?.courseCode || 'GNS'}</td>
                          <td className="p-3 text-center">
                            {isComplete ? (
                              <span className="text-[#006633] font-semibold flex items-center justify-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5" /> Submitted
                              </span>
                            ) : (
                              <span className="text-amber-700 font-semibold flex items-center justify-center gap-1">
                                <Clock className="w-3.5 h-3.5" /> In Progress
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-center font-bold text-slate-800">
                            {isComplete ? `${sess.score} / ${exam?.totalMarks || 50} (${sess.percentage}%)` : `${Object.keys(sess.answers).length} Answered`}
                          </td>
                          <td className="p-3 text-right text-slate-500">
                            {mins} Mins
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Departmental Course Roster Quick Overview */}
          <div className="bg-white border border-slate-300 rounded shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Configured GNS Department Courses
              </h3>
              <button
                onClick={() => setActiveTab('exams')}
                className="text-xs text-[#006633] hover:underline font-semibold"
              >
                Manage Examinations →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {examinations.map((exam) => {
                const examSess = sessions.filter((s) => s.examinationId === exam.id);
                const countSubmitted = examSess.filter((s) => s.status === 'submitted').length;
                const countQuestions = questions.filter((q) => q.examinationId === exam.id).length;

                return (
                  <div key={exam.id} className="p-4 border border-slate-200 rounded bg-slate-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-[#006633]">{exam.courseCode}</span>
                      <span className="text-[11px] font-mono text-slate-500">{exam.creditUnits} Units</span>
                    </div>
                    <h4 className="font-semibold text-xs text-slate-900 leading-snug">{exam.title}</h4>
                    <div className="text-[11px] text-slate-500 font-mono pt-1 border-t border-slate-200 flex justify-between">
                      <span>{countQuestions} Items</span>
                      <span>{countSubmitted} Submissions</span>
                      <span>{exam.durationMinutes} Mins</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* VIEW 2: COURSE EXAMINATIONS MANAGEMENT */}
      {activeTab === 'exams' && (
        <div className="space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                General Studies Examinations Configuration
              </h2>
              <p className="text-xs text-slate-500">
                Setup course parameters, time allocations, pass marks, and result publication rules.
              </p>
            </div>
            <button
              onClick={handleOpenAddExam}
              className="bg-[#006633] hover:bg-[#005229] text-white text-xs font-semibold px-4 py-2 rounded transition-colors inline-flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" /> Add Examination
            </button>
          </div>

          <div className="bg-white border border-slate-300 rounded overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 font-mono text-[11px] uppercase text-slate-600">
                    <th className="p-3.5">Code</th>
                    <th className="p-3.5">Course Title</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5 text-center">Units</th>
                    <th className="p-3.5 text-center">Duration</th>
                    <th className="p-3.5 text-center">Items</th>
                    <th className="p-3.5 text-center">Pass %</th>
                    <th className="p-3.5 text-center">Release Mode</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-sans">
                  {examinations.map((exam) => {
                    const examQuestions = questions.filter((q) => q.examinationId === exam.id);

                    return (
                      <tr key={exam.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-slate-900">{exam.courseCode}</td>
                        <td className="p-3.5">
                          <div className="font-semibold text-slate-900">{exam.title}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{exam.semester} · {exam.academicSession}</div>
                        </td>
                        <td className="p-3.5 text-slate-600 capitalize">
                          {exam.courseCategory} Unit
                        </td>
                        <td className="p-3.5 text-center font-mono font-semibold text-slate-700">
                          {exam.creditUnits || 2}
                        </td>
                        <td className="p-3.5 text-center font-mono text-slate-700">
                          {exam.durationMinutes} Mins
                        </td>
                        <td className="p-3.5 text-center font-mono font-semibold text-slate-900">
                          {examQuestions.length}
                        </td>
                        <td className="p-3.5 text-center font-mono text-slate-700">
                          {exam.passThresholdPercentage}%
                        </td>
                        <td className="p-3.5 text-center font-mono text-[11px]">
                          {exam.releaseResultsImmediately ? (
                            <span className="text-[#006633] font-semibold">Immediate</span>
                          ) : (
                            <span className="text-amber-700 font-semibold">Board Approval</span>
                          )}
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditExam(exam)}
                              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded border border-slate-200"
                              title="Edit Parameters"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteExamination(exam.id)}
                              className="p-1.5 text-slate-600 hover:text-red-700 hover:bg-red-50 rounded border border-slate-200"
                              title="Delete Course Examination"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* VIEW 3: QUESTION BANK */}
      {activeTab === 'questions' && (
        <QuestionManager
          examinations={examinations}
          questions={questions}
          onSaveQuestion={onSaveQuestion}
          onDeleteQuestion={onDeleteQuestion}
        />
      )}

      {/* VIEW 4: RESULTS & OFFICIAL BROADSHEET */}
      {activeTab === 'results' && (
        <div className="space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Examination Results & Broadsheet Center
              </h2>
              <p className="text-xs text-slate-500">
                Grade candidate scores, adjust pass thresholds, export CSV spreadsheets, and generate Senate Broadsheets.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <select
                value={selectedResultExamId}
                onChange={(e) => setSelectedResultExamId(e.target.value)}
                className="bg-white border border-slate-300 text-xs font-medium rounded py-1.5 px-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer"
              >
                {examinations.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.courseCode} - {e.title}
                  </option>
                ))}
              </select>

              {selectedResultExam && (
                <>
                  <button
                    onClick={() => onExportCSV(selectedResultExam.id)}
                    className="bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium px-3 py-1.5 rounded border border-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> CSV
                  </button>
                  <button
                    onClick={() => onViewBroadsheet(selectedResultExam)}
                    className="bg-[#006633] hover:bg-[#005229] text-white text-xs font-semibold px-3.5 py-1.5 rounded flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" /> Official Broadsheet
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Filtering and Pass Mark Threshold Tool */}
          <div className="bg-white border border-slate-300 rounded p-3 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative w-full md:w-80">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search candidate name or matric number..."
                value={resultSearchQuery}
                onChange={(e) => setResultSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div className="flex items-center gap-3 font-mono">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span>Pass Benchmark: <strong className="text-[#006633]">{passThresholdFilter}%</strong></span>
              <input
                type="range"
                min="35"
                max="75"
                step="5"
                value={passThresholdFilter}
                onChange={(e) => setPassThresholdFilter(parseInt(e.target.value))}
                className="accent-[#006633] cursor-pointer"
              />
            </div>
          </div>

          {/* Candidate Results Table */}
          <div className="bg-white border border-slate-300 rounded overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 font-mono text-[11px] uppercase text-slate-600">
                    <th className="p-3 w-12 text-center">S/N</th>
                    <th className="p-3">Matriculation No</th>
                    <th className="p-3">Candidate Full Name</th>
                    <th className="p-3">Department / Programme</th>
                    <th className="p-3 text-center">Score</th>
                    <th className="p-3 text-center">Percentage</th>
                    <th className="p-3 text-center">Grade</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-sans">
                  {filteredSessions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400 font-mono">
                        No examination submissions found for {selectedResultExam?.courseCode}.
                      </td>
                    </tr>
                  ) : (
                    filteredSessions.map((sess, idx) => {
                      const isPassed = sess.percentage >= passThresholdFilter;
                      const grade = calculateGrade(sess.percentage);

                      return (
                        <tr key={sess.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 text-center font-mono text-slate-400">{idx + 1}</td>
                          <td className="p-3 font-mono font-bold text-slate-900">{sess.studentRegNo}</td>
                          <td className="p-3 font-medium text-slate-800">{sess.studentName}</td>
                          <td className="p-3 text-slate-600 text-[11px]">{sess.department}</td>
                          <td className="p-3 text-center font-mono font-bold text-slate-900">
                            {sess.score} / {selectedResultExam?.totalMarks || 50}
                          </td>
                          <td className="p-3 text-center font-mono font-bold text-slate-900">
                            {sess.percentage}%
                          </td>
                          <td className="p-3 text-center font-mono font-bold text-slate-800">
                            {grade.grade}
                          </td>
                          <td className="p-3 text-center">
                            <span
                              className={`font-mono text-[11px] font-bold uppercase ${
                                isPassed ? 'text-[#006633]' : 'text-red-700'
                              }`}
                            >
                              {isPassed ? 'PASSED' : 'FAILED'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* VIEW 5: AUDIT TRAIL & INTEGRITY */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Examination Proctoring & System Audit Trail
              </h2>
              <p className="text-xs text-slate-500">
                Chronological security log of candidate logins, test starts, focus-switch events, and submissions.
              </p>
            </div>
            <span className="font-mono text-xs text-slate-600 bg-slate-100 border border-slate-200 px-2 py-1 rounded">
              {auditLogs.length} Events Logged
            </span>
          </div>

          <div className="bg-white border border-slate-300 rounded overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 uppercase text-[11px] border-b border-slate-200">
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">User</th>
                    <th className="p-3">Action Type</th>
                    <th className="p-3">Audit Details</th>
                    <th className="p-3 text-right">IP / Host</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="p-3 text-slate-400">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="p-3 font-semibold text-slate-900">{log.userName}</td>
                      <td className="p-3">
                        <span
                          className={`font-semibold ${
                            log.action.includes('LOSS') || log.action.includes('WARNING')
                              ? 'text-amber-800'
                              : 'text-slate-800'
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3 text-slate-700">{log.description}</td>
                      <td className="p-3 text-right text-slate-400">{log.ipAddress}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Examination Modal */}
      {isExamModalOpen && editingExam && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded border border-slate-300 max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                {editingExam.id?.includes('-new') || !editingExam.title ? 'Configure New GNS Examination' : 'Edit Examination Configuration'}
              </h3>
              <button
                onClick={() => setIsExamModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExamSubmit} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Course Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingExam.courseCode || ''}
                    onChange={(e) => setEditingExam({ ...editingExam, courseCode: e.target.value })}
                    placeholder="e.g. GNS 101"
                    className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    GNS Course Category *
                  </label>
                  <select
                    value={editingExam.courseCategory || 'english'}
                    onChange={(e) => setEditingExam({ ...editingExam, courseCategory: e.target.value as GNSCourseCategory })}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-600 focus:outline-none bg-white"
                  >
                    <option value="english">Use of English Unit</option>
                    <option value="citizenship">Citizenship Education Unit</option>
                    <option value="communication">Communication in English</option>
                    <option value="entrepreneurship">Entrepreneurship Development</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Course Examination Title *
                </label>
                <input
                  type="text"
                  required
                  value={editingExam.title || ''}
                  onChange={(e) => setEditingExam({ ...editingExam, title: e.target.value })}
                  placeholder="e.g. Use of English I"
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Credit Units
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={editingExam.creditUnits || 2}
                    onChange={(e) => setEditingExam({ ...editingExam, creditUnits: parseInt(e.target.value) || 2 })}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Duration (Mins)
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={180}
                    value={editingExam.durationMinutes || 45}
                    onChange={(e) => setEditingExam({ ...editingExam, durationMinutes: parseInt(e.target.value) || 45 })}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Pass Mark %
                  </label>
                  <input
                    type="number"
                    min={30}
                    max={80}
                    value={editingExam.passThresholdPercentage || 50}
                    onChange={(e) => setEditingExam({ ...editingExam, passThresholdPercentage: parseInt(e.target.value) || 50 })}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingExam.releaseResultsImmediately ?? true}
                    onChange={(e) => setEditingExam({ ...editingExam, releaseResultsImmediately: e.target.checked })}
                    className="text-[#006633] focus:ring-[#006633] rounded"
                  />
                  <span>Display candidate result slip immediately upon submission</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingExam.shuffleQuestions ?? true}
                    onChange={(e) => setEditingExam({ ...editingExam, shuffleQuestions: e.target.checked })}
                    className="text-[#006633] focus:ring-[#006633] rounded"
                  />
                  <span>Randomize question sequence per candidate session</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsExamModalOpen(false)}
                  className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#006633] hover:bg-[#005229] text-white px-4 py-2 rounded font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" /> Save Configuration
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
