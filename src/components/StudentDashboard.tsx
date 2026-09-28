import React, { useState } from 'react';
import { Examination, ExaminationSession, User, Question, GNSCourseCategory } from '../types';
import {
  Play,
  CheckCircle,
  Clock,
  BookOpen,
  FileText,
  ChevronRight,
  AlertCircle,
  Award,
  ShieldCheck,
  Building,
  UserCheck,
  Calendar,
  AlertTriangle,
} from 'lucide-react';

interface StudentDashboardProps {
  currentUser: User;
  examinations: Examination[];
  sessions: ExaminationSession[];
  questions: Question[];
  onStartExam: (exam: Examination) => void;
  onViewResult: (exam: Examination, session: ExaminationSession) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  currentUser,
  examinations,
  sessions,
  questions,
  onStartExam,
  onViewResult,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<'all' | GNSCourseCategory>('all');
  const [selectedExamForInstructions, setSelectedExamForInstructions] = useState<Examination | null>(null);
  const [rulesAccepted, setRulesAccepted] = useState(false);

  const getStudentSessionForExam = (examId: string) => {
    return sessions.find((s) => s.studentId === currentUser.id && s.examinationId === examId);
  };

  const filteredExams = examinations.filter((exam) => {
    if (categoryFilter === 'all') return true;
    return exam.courseCategory === categoryFilter;
  });

  const completedCount = examinations.filter((exam) => {
    const s = getStudentSessionForExam(exam.id);
    return s && s.status === 'submitted';
  }).length;

  const availableCount = examinations.filter((exam) => {
    const s = getStudentSessionForExam(exam.id);
    return (!s || s.status === 'in_progress') && exam.status === 'active';
  }).length;

  return (
    <div className="space-y-6">
      
      {/* Candidate Institutional Record Card */}
      <div className="bg-white border border-slate-300 rounded-lg p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                STUDENT EXAMINATION PROFILE
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                <ShieldCheck className="w-3.5 h-3.5" /> Biometrics & Seat Cleared
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {currentUser.fullName}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              School of Applied Sciences · Directorate of General Studies Candidate
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-slate-100 border border-slate-200 px-3 py-1.5 rounded text-xs font-mono font-bold text-slate-800">
              Matric No: <span className="text-emerald-900 font-extrabold">{currentUser.studentId}</span>
            </div>
            <div className="bg-emerald-800 text-white px-3 py-1.5 rounded text-xs font-mono font-semibold">
              Seat: {currentUser.workstation || 'CBT LAB 1 · PC-14'}
            </div>
          </div>
        </div>

        {/* Profile Attributes Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs font-mono">
          <div className="space-y-0.5">
            <span className="text-slate-400 block text-[11px] uppercase tracking-wider">Programme Department</span>
            <span className="font-bold text-slate-900 font-sans">{currentUser.department}</span>
          </div>
          <div className="space-y-0.5">
            <span className="text-slate-400 block text-[11px] uppercase tracking-wider">Academic Level</span>
            <span className="font-bold text-slate-900">{currentUser.level || 'ND I'} · First Semester</span>
          </div>
          <div className="space-y-0.5">
            <span className="text-slate-400 block text-[11px] uppercase tracking-wider">Assigned Examination Centre</span>
            <span className="font-bold text-emerald-800 font-sans">Federal Poly Ukana CBT Complex</span>
          </div>
          <div className="space-y-0.5">
            <span className="text-slate-400 block text-[11px] uppercase tracking-wider">Proctor Status</span>
            <span className="font-bold text-slate-800 flex items-center gap-1 font-sans">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Active & Ready
            </span>
          </div>
        </div>

        {/* Quick Stats Metric Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-3 gap-3 text-center">
          <div className="bg-slate-50 border border-slate-200 p-2.5 rounded">
            <span className="text-[11px] text-slate-500 font-medium block">Assigned GNS Courses</span>
            <span className="text-lg font-bold text-slate-900 font-mono">{examinations.length} Courses</span>
          </div>
          <div className="bg-emerald-50/60 border border-emerald-200 p-2.5 rounded">
            <span className="text-[11px] text-emerald-800 font-medium block">Ready to Write</span>
            <span className="text-lg font-bold text-emerald-900 font-mono">{availableCount} Available</span>
          </div>
          <div className="bg-slate-50 border border-slate-200 p-2.5 rounded">
            <span className="text-[11px] text-slate-500 font-medium block">Completed Tests</span>
            <span className="text-lg font-bold text-slate-900 font-mono">{completedCount} Completed</span>
          </div>
        </div>
      </div>

      {/* Official Directorate Notice Box */}
      <div className="bg-amber-50/70 border border-amber-300/80 rounded-lg p-4 text-xs text-amber-950 flex items-start gap-3 shadow-2xs">
        <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold text-amber-900 uppercase font-mono tracking-wide">
            Directorate of General Studies · Candidate Notice
          </h4>
          <p className="leading-relaxed text-amber-900/90 font-medium">
            Candidates must adhere strictly to examination instructions. <strong>GNS courses are institutional requirements</strong> for all National Diploma (ND) and Higher National Diploma (HND) programmes at Federal Polytechnic Ukana. Ensure your responses are confirmed before clicking final submission.
          </p>
        </div>
      </div>

      {/* General Studies Department Course Navigation */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              General Studies (GNS) Course Examination Schedule
            </h3>
            <p className="text-xs text-slate-500">
              Select an examination below to view instructions and launch your Computer-Based Test session.
            </p>
          </div>

          {/* Course Unit Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-md text-xs font-semibold self-start sm:self-auto overflow-x-auto">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1 rounded transition-colors whitespace-nowrap cursor-pointer ${
                categoryFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Courses ({examinations.length})
            </button>
            <button
              onClick={() => setCategoryFilter('english')}
              className={`px-3 py-1 rounded transition-colors whitespace-nowrap cursor-pointer ${
                categoryFilter === 'english'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              English Unit
            </button>
            <button
              onClick={() => setCategoryFilter('citizenship')}
              className={`px-3 py-1 rounded transition-colors whitespace-nowrap cursor-pointer ${
                categoryFilter === 'citizenship'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Citizenship Unit
            </button>
            <button
              onClick={() => setCategoryFilter('communication')}
              className={`px-3 py-1 rounded transition-colors whitespace-nowrap cursor-pointer ${
                categoryFilter === 'communication'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Communication Unit
            </button>
            <button
              onClick={() => setCategoryFilter('entrepreneurship')}
              className={`px-3 py-1 rounded transition-colors whitespace-nowrap cursor-pointer ${
                categoryFilter === 'entrepreneurship'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Entrepreneurship Unit
            </button>
          </div>
        </div>

        {/* Structured Course Table */}
        <div className="bg-white border border-slate-300 rounded-lg overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 font-mono text-[11px] uppercase text-slate-700">
                  <th className="p-3.5 font-bold">Course Code</th>
                  <th className="p-3.5 font-bold">Course Title</th>
                  <th className="p-3.5 font-bold">GNS Unit</th>
                  <th className="p-3.5 text-center font-bold">Units</th>
                  <th className="p-3.5 text-center font-bold">Duration</th>
                  <th className="p-3.5 text-center font-bold">Status</th>
                  <th className="p-3.5 text-right font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-sans">
                {filteredExams.map((exam) => {
                  const studentSession = getStudentSessionForExam(exam.id);
                  const isCompleted = studentSession && studentSession.status === 'submitted';
                  const isInProgress = studentSession && studentSession.status === 'in_progress';
                  const examQuestions = questions.filter((q) => q.examinationId === exam.id);

                  const getCategoryLabel = (cat: GNSCourseCategory) => {
                    switch (cat) {
                      case 'english':
                        return 'English Unit';
                      case 'citizenship':
                        return 'Citizenship Unit';
                      case 'communication':
                        return 'Communication Unit';
                      case 'entrepreneurship':
                        return 'Entrepreneurship Unit';
                    }
                  };

                  return (
                    <tr key={exam.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-slate-900">
                        <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200">
                          {exam.courseCode}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{exam.title}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {exam.academicSession} · {exam.semester}
                        </div>
                      </td>
                      <td className="p-3.5 text-slate-700 font-medium">
                        {getCategoryLabel(exam.courseCategory)}
                      </td>
                      <td className="p-3.5 text-center font-mono font-bold text-slate-800">
                        {exam.creditUnits || 2}
                      </td>
                      <td className="p-3.5 text-center font-mono text-slate-700">
                        {exam.durationMinutes} Mins
                      </td>
                      <td className="p-3.5 text-center">
                        {isCompleted ? (
                          <span className="text-[#006633] font-bold inline-flex items-center justify-center gap-1 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px]">
                            <CheckCircle className="w-3.5 h-3.5" /> Completed
                          </span>
                        ) : isInProgress ? (
                          <span className="text-amber-800 font-bold inline-flex items-center justify-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[11px]">
                            <Clock className="w-3.5 h-3.5" /> In Progress
                          </span>
                        ) : exam.status === 'active' ? (
                          <span className="text-blue-800 font-bold inline-flex items-center justify-center gap-1 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded text-[11px]">
                            Available
                          </span>
                        ) : (
                          <span className="text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                            Scheduled
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        {isCompleted ? (
                          exam.releaseResultsImmediately ? (
                            <button
                              onClick={() => onViewResult(exam, studentSession)}
                              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 rounded font-semibold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-300 shadow-2xs"
                            >
                              <Award className="w-3.5 h-3.5 text-emerald-700" /> View Result Slip ({studentSession.percentage}%)
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic font-mono">
                              Awaiting Board Approval
                            </span>
                          )
                        ) : exam.status === 'active' ? (
                          <button
                            onClick={() => setSelectedExamForInstructions(exam)}
                            className="px-4 py-1.5 bg-[#006633] hover:bg-[#005229] text-white rounded font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                          >
                            <Play className="w-3.5 h-3.5" /> {isInProgress ? 'Resume Test' : 'Start CBT'}
                          </button>
                        ) : (
                          <span className="text-slate-400 font-mono text-[11px]">
                            Not Yet Open
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pre-Examination Instructions Modal */}
      {selectedExamForInstructions && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-slate-300 max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="border-b border-slate-200 pb-3">
              <span className="font-mono text-xs font-bold text-[#006633] uppercase">
                {selectedExamForInstructions.courseCode} · {selectedExamForInstructions.creditUnits || 2} CREDIT UNITS
              </span>
              <h3 className="text-lg font-extrabold text-slate-900">
                {selectedExamForInstructions.title}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {selectedExamForInstructions.department} · Federal Polytechnic Ukana
              </p>
            </div>

            {/* Regulations List */}
            <div className="bg-slate-50 p-4 rounded-md border border-slate-200 space-y-3 text-xs text-slate-700">
              <h4 className="font-bold text-slate-900 uppercase font-mono flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-emerald-800" /> Examination Rules & Instructions:
              </h4>
              <ul className="space-y-1.5 list-disc list-inside leading-relaxed text-slate-600">
                <li>
                  Allocated Duration: <strong>{selectedExamForInstructions.durationMinutes} Minutes</strong>. The countdown begins upon clicking "Proceed to CBT Room".
                </li>
                <li>
                  Total marks obtainable: <strong>{selectedExamForInstructions.totalMarks} Points</strong>. Pass benchmark is <strong>{selectedExamForInstructions.passThresholdPercentage}%</strong>.
                </li>
                <li>
                  All answers are continuously <strong>auto-saved to server in real time</strong>.
                </li>
                <li>
                  Automatic submission will execute when the countdown clock reaches <strong>00:00:00</strong>.
                </li>
                <li>
                  Keyboard shortcuts: <strong>A, B, C, D</strong> (Select Option), <strong>N</strong> (Next), <strong>P</strong> (Previous), <strong>F</strong> (Flag for Review).
                </li>
                <li>
                  Do not exit fullscreen or switch browser tabs. Focus changes are logged directly to the chief proctor audit log.
                </li>
              </ul>
            </div>

            {/* Candidate Identity Confirmation */}
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-800 p-2.5 rounded bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={rulesAccepted}
                onChange={(e) => setRulesAccepted(e.target.checked)}
                className="mt-0.5 text-[#006633] focus:ring-[#006633] rounded cursor-pointer"
              />
              <span className="leading-tight font-medium">
                I solemnly certify that I am <strong>{currentUser.fullName} (Matric: {currentUser.studentId})</strong> and agree to comply strictly with the Examination Regulations of Federal Polytechnic Ukana.
              </span>
            </label>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                onClick={() => setSelectedExamForInstructions(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={!rulesAccepted}
                onClick={() => {
                  const exam = selectedExamForInstructions;
                  setSelectedExamForInstructions(null);
                  onStartExam(exam);
                }}
                className="bg-[#006633] hover:bg-[#005229] text-white text-xs font-bold px-5 py-2 rounded-md disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                Proceed to CBT Room <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
