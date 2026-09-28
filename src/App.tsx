import React, { useState, useEffect } from 'react';
import {
  User,
  Examination,
  Question,
  ExaminationSession,
  AuditLog,
} from './types';
import {
  initializeStorage,
  getUsers,
  getCurrentUser,
  setCurrentUser as setStoredCurrentUser,
  getExaminations,
  saveExamination,
  deleteExamination,
  getQuestions,
  saveQuestion,
  deleteQuestion,
  getSessions,
  startExaminationSession,
  updateSessionAnswers,
  submitExaminationSession,
  getAuditLogs,
  addAuditLog,
  resetToSeedData,
  exportResultsToCSV,
  saveUser,
  deleteUser,
} from './services/storage';

import { Header } from './components/Header';
import { AdminDashboard } from './components/AdminDashboard';
import { StudentDashboard } from './components/StudentDashboard';
import { ExaminationRoom } from './components/ExaminationRoom';
import { StudentResultView } from './components/StudentResultView';
import { OfficialBroadsheetPrint } from './components/OfficialBroadsheetPrint';
import { SupabaseModal } from './components/SupabaseModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(() => {
    initializeStorage();
    return getCurrentUser();
  });

  const [users, setUsers] = useState<User[]>(getUsers);
  const [examinations, setExaminations] = useState<Examination[]>(getExaminations);
  const [questions, setQuestions] = useState<Question[]>(getQuestions);
  const [sessions, setSessions] = useState<ExaminationSession[]>(getSessions);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(getAuditLogs);

  // Active View routing
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [activeExam, setActiveExam] = useState<Examination | null>(null);
  const [activeSession, setActiveSession] = useState<ExaminationSession | null>(null);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState<boolean>(true);

  // Refresh helper
  const reloadData = () => {
    setUsers(getUsers());
    setExaminations(getExaminations());
    setQuestions(getQuestions());
    setSessions(getSessions());
    setAuditLogs(getAuditLogs());
  };

  useEffect(() => {
    reloadData();
  }, []);

  // Switch User / Role
  const handleSwitchUser = (user: User) => {
    setCurrentUser(user);
    setStoredCurrentUser(user);
    setActiveView('dashboard');
    setActiveExam(null);
    setActiveSession(null);
    addAuditLog(user.id, user.fullName, user.role, 'USER_LOGIN', `Switched active role to ${user.fullName} (${user.role})`);
    reloadData();
  };

  // Reset to default seed
  const handleResetData = () => {
    if (window.confirm('Reset system data to initial Federal Polytechnic Ukana seed records?')) {
      resetToSeedData();
      const updatedUsers = getUsers();
      setUsers(updatedUsers);
      const defaultUser = updatedUsers[0];
      setCurrentUser(defaultUser);
      setStoredCurrentUser(defaultUser);
      setActiveView('dashboard');
      setActiveExam(null);
      setActiveSession(null);
      reloadData();
    }
  };

  // Student Exam Operations
  const handleStartExam = (exam: Examination) => {
    const session = startExaminationSession(currentUser, exam);
    setActiveExam(exam);
    setActiveSession(session);
    setActiveView('exam_room');
    reloadData();
  };

  const handleUpdateAnswers = (
    answers: Record<string, 'A' | 'B' | 'C' | 'D'>,
    flaggedQuestionIds: string[],
    timeSpentSeconds: number,
    tabSwitchCount: number
  ) => {
    if (!activeSession) return;
    const updated = updateSessionAnswers(
      activeSession.id,
      answers,
      flaggedQuestionIds,
      timeSpentSeconds,
      tabSwitchCount
    );
    setActiveSession(updated);
    setSessions(getSessions());
  };

  const handleSubmitSession = () => {
    if (!activeSession || !activeExam) return;
    const finalSession = submitExaminationSession(activeSession.id);
    setActiveSession(finalSession);
    setSessions(getSessions());
    setAuditLogs(getAuditLogs());

    if (activeExam.releaseResultsImmediately) {
      setActiveView('student_result');
    } else {
      setActiveView('dashboard');
      alert(`Examination submitted successfully! Final results will be released by the GNS Department upon board approval.`);
    }
  };

  const handleViewResult = (exam: Examination, session: ExaminationSession) => {
    setActiveExam(exam);
    setActiveSession(session);
    setActiveView('student_result');
  };

  const handleViewBroadsheet = (exam: Examination) => {
    setActiveExam(exam);
    setActiveView('broadsheet_print');
  };

  // CRUD Handlers for Admin/Lecturer
  const handleSaveExam = (exam: Examination) => {
    saveExamination(exam);
    reloadData();
  };

  const handleDeleteExam = (id: string) => {
    if (window.confirm('Are you sure you want to delete this examination?')) {
      deleteExamination(id);
      reloadData();
    }
  };

  const handleSaveQuestionItem = (q: Question) => {
    saveQuestion(q);
    reloadData();
  };

  const handleDeleteQuestionItem = (id: string) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      deleteQuestion(id);
      reloadData();
    }
  };

  const handleSaveUserItem = (u: User) => {
    saveUser(u);
    reloadData();
  };

  const handleDeleteUserItem = (id: string) => {
    if (window.confirm('Are you sure you want to delete this candidate account?')) {
      deleteUser(id);
      reloadData();
    }
  };

  // If in active examination room mode, render clean Exam Room without general header
  if (activeView === 'exam_room' && activeExam && activeSession) {
    return (
      <ExaminationRoom
        examination={activeExam}
        questions={questions.filter((q) => q.examinationId === activeExam.id)}
        session={activeSession}
        currentUser={currentUser}
        onUpdateAnswers={handleUpdateAnswers}
        onSubmitSession={handleSubmitSession}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* Header with Institution Wordmark and Quick Role Switcher */}
      <Header
        currentUser={currentUser}
        users={users}
        onSwitchUser={handleSwitchUser}
        onResetData={handleResetData}
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenSupabase={() => setIsSupabaseModalOpen(true)}
      />

      {/* Supabase Cloud Database Integration Modal */}
      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />

      {/* Main View Container */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        
        {/* Printable Broadsheet View */}
        {activeView === 'broadsheet_print' && activeExam && (
          <OfficialBroadsheetPrint
            examination={activeExam}
            sessions={sessions.filter((s) => s.examinationId === activeExam.id)}
            onBack={() => setActiveView('dashboard')}
            onExportCSV={() => exportResultsToCSV(activeExam.id)}
          />
        )}

        {/* Student Result View */}
        {activeView === 'student_result' && activeExam && activeSession && (
          <StudentResultView
            examination={activeExam}
            session={activeSession}
            questions={questions.filter((q) => q.examinationId === activeExam.id)}
            onBack={() => {
              setActiveView('dashboard');
              setActiveExam(null);
              setActiveSession(null);
            }}
          />
        )}

        {/* Candidate Dashboard */}
        {currentUser.role === 'student' && activeView !== 'student_result' && activeView !== 'broadsheet_print' && (
          <StudentDashboard
            currentUser={currentUser}
            examinations={examinations.filter((e) => e.status === 'active' || e.status === 'completed')}
            sessions={sessions}
            questions={questions}
            onStartExam={handleStartExam}
            onViewResult={handleViewResult}
          />
        )}

        {/* Administrator & Lecturer Console */}
        {currentUser.role !== 'student' && activeView !== 'student_result' && activeView !== 'broadsheet_print' && (
          <AdminDashboard
            examinations={examinations}
            questions={questions}
            sessions={sessions}
            users={users}
            auditLogs={auditLogs}
            onSaveExamination={handleSaveExam}
            onDeleteExamination={handleDeleteExam}
            onSaveQuestion={handleSaveQuestionItem}
            onDeleteQuestion={handleDeleteQuestionItem}
            onSaveUser={handleSaveUserItem}
            onDeleteUser={handleDeleteUserItem}
            onExportCSV={exportResultsToCSV}
            onViewBroadsheet={handleViewBroadsheet}
            activeTab={activeView}
            setActiveTab={setActiveView}
          />
        )}

      </main>

      {/* Institutional Footer */}
      <footer className="no-print bg-white border-t border-slate-200 py-5 text-xs text-slate-600 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <p className="font-semibold text-slate-800">FEDERAL POLYTECHNIC UKANA</p>
            <p className="text-slate-500 text-[11px]">Directorate of General Studies (GNS) · ICT & Examination Processing Directorate · Akwa Ibom State, Nigeria</p>
          </div>
          <div className="text-slate-500 text-[11px]">
            <p>© 2025/2026 Academic Session. Official Polytechnic CBT Examination System.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
