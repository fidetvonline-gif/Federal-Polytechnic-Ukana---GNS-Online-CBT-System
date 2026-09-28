import { User, Examination, Question, ExaminationSession, AuditLog } from '../types';
import { INITIAL_USERS, INITIAL_EXAMINATIONS, INITIAL_QUESTIONS, INITIAL_SESSIONS, INITIAL_AUDIT_LOGS } from './mockData';

const STORAGE_KEYS = {
  USERS: 'ukana_cbt_portal_v4',
  EXAMINATIONS: 'ukana_cbt_portal_exams_v4',
  QUESTIONS: 'ukana_cbt_portal_questions_v4',
  SESSIONS: 'ukana_cbt_portal_sessions_v4',
  AUDIT_LOGS: 'ukana_cbt_portal_logs_v4',
  CURRENT_USER: 'ukana_cbt_portal_current_user_v4',
};

// Initialize Local Storage if empty
export function initializeStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.EXAMINATIONS)) {
    localStorage.setItem(STORAGE_KEYS.EXAMINATIONS, JSON.stringify(INITIAL_EXAMINATIONS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.QUESTIONS)) {
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(INITIAL_QUESTIONS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SESSIONS)) {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(INITIAL_SESSIONS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
  }
}

export function resetToSeedData() {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  localStorage.setItem(STORAGE_KEYS.EXAMINATIONS, JSON.stringify(INITIAL_EXAMINATIONS));
  localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(INITIAL_QUESTIONS));
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(INITIAL_SESSIONS));
  localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
}

// User methods
export function getUsers(): User[] {
  initializeStorage();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
}

export function saveUser(user: User): User {
  const users = getUsers();
  const index = users.findIndex((u) => u.id === user.id);
  if (index >= 0) {
    users[index] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  return user;
}

export function deleteUser(id: string): void {
  const users = getUsers().filter((u) => u.id !== id);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

// Current Active User
export function getCurrentUser(): User {
  initializeStorage();
  const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }
  const users = getUsers();
  return users[0] || INITIAL_USERS[0];
}

export function setCurrentUser(user: User): void {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
}

// Examination methods
export function getExaminations(): Examination[] {
  initializeStorage();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.EXAMINATIONS) || '[]');
}

export function saveExamination(exam: Examination): Examination {
  const exams = getExaminations();
  const index = exams.findIndex((e) => e.id === exam.id);
  if (index >= 0) {
    exams[index] = exam;
  } else {
    exams.push(exam);
  }
  localStorage.setItem(STORAGE_KEYS.EXAMINATIONS, JSON.stringify(exams));
  addAuditLog('usr-admin', 'System Admin', 'admin', 'SAVE_EXAM', `Saved examination: ${exam.courseCode} - ${exam.title}`);
  return exam;
}

export function deleteExamination(id: string): void {
  const exams = getExaminations().filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEYS.EXAMINATIONS, JSON.stringify(exams));
  // also clean associated questions
  const questions = getQuestions().filter((q) => q.examinationId !== id);
  localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
}

// Questions
export function getQuestions(examinationId?: string): Question[] {
  initializeStorage();
  const allQuestions: Question[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.QUESTIONS) || '[]');
  if (examinationId) {
    return allQuestions.filter((q) => q.examinationId === examinationId);
  }
  return allQuestions;
}

export function saveQuestion(question: Question): Question {
  const questions = getQuestions();
  const index = questions.findIndex((q) => q.id === question.id);
  if (index >= 0) {
    questions[index] = question;
  } else {
    questions.push(question);
  }
  localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
  return question;
}

export function deleteQuestion(id: string): void {
  const questions = getQuestions().filter((q) => q.id !== id);
  localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
}

// Examination Sessions
export function getSessions(examinationId?: string): ExaminationSession[] {
  initializeStorage();
  const allSessions: ExaminationSession[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSIONS) || '[]');
  if (examinationId) {
    return allSessions.filter((s) => s.examinationId === examinationId);
  }
  return allSessions;
}

export function getStudentSession(studentId: string, examinationId: string): ExaminationSession | undefined {
  const sessions = getSessions();
  return sessions.find((s) => s.studentId === studentId && s.examinationId === examinationId);
}

// Start or Resume Examination Session with Randomization & Auto-Save
export function startExaminationSession(student: User, exam: Examination): ExaminationSession {
  const existing = getStudentSession(student.id, exam.id);
  if (existing) {
    return existing;
  }

  const questions = getQuestions(exam.id);
  let questionIds = questions.map((q) => q.id);

  // Shuffle questions if enabled
  if (exam.shuffleQuestions) {
    questionIds = [...questionIds].sort(() => Math.random() - 0.5);
  }

  // Shuffle options if enabled
  const optionOrders: Record<string, ('A' | 'B' | 'C' | 'D')[]> = {};
  questions.forEach((q) => {
    let opts: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
    if (exam.shuffleOptions) {
      opts = [...opts].sort(() => Math.random() - 0.5);
    }
    optionOrders[q.id] = opts;
  });

  const newSession: ExaminationSession = {
    id: `sess-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    examinationId: exam.id,
    studentId: student.id,
    studentName: student.fullName,
    studentRegNo: student.studentId || '2025/ND/SLT/000',
    department: student.department || 'Science Laboratory Technology',
    startedAt: new Date().toISOString(),
    status: 'in_progress',
    score: 0,
    percentage: 0,
    timeSpentSeconds: 0,
    answers: {},
    flaggedQuestionIds: [],
    tabSwitchCount: 0,
    questionOrder: questionIds,
    optionOrders,
    lastSavedAt: new Date().toISOString(),
  };

  const sessions = getSessions();
  sessions.push(newSession);
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));

  addAuditLog(student.id, student.fullName, 'student', 'START_EXAM', `Started examination session for ${exam.courseCode}`);
  return newSession;
}

// Update choices / Auto-save
export function updateSessionAnswers(
  sessionId: string,
  answers: Record<string, 'A' | 'B' | 'C' | 'D'>,
  flaggedQuestionIds: string[],
  timeSpentSeconds: number,
  tabSwitchCount?: number
): ExaminationSession {
  const sessions = getSessions();
  const index = sessions.findIndex((s) => s.id === sessionId);
  if (index >= 0) {
    sessions[index].answers = answers;
    sessions[index].flaggedQuestionIds = flaggedQuestionIds;
    sessions[index].timeSpentSeconds = timeSpentSeconds;
    sessions[index].lastSavedAt = new Date().toISOString();
    if (tabSwitchCount !== undefined) {
      sessions[index].tabSwitchCount = tabSwitchCount;
    }
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    return sessions[index];
  }
  throw new Error('Session not found');
}

// Final Submit Examination Session with Auto Grading
export function submitExaminationSession(sessionId: string): ExaminationSession {
  const sessions = getSessions();
  const index = sessions.findIndex((s) => s.id === sessionId);
  if (index < 0) throw new Error('Session not found');

  const session = sessions[index];
  const questions = getQuestions(session.examinationId);
  const exam = getExaminations().find((e) => e.id === session.examinationId);

  let totalScored = 0;
  let totalPossible = 0;

  questions.forEach((q) => {
    totalPossible += q.marks;
    const selected = session.answers[q.id];
    if (selected && selected === q.correctOption) {
      totalScored += q.marks;
    }
  });

  const percentage = totalPossible > 0 ? Math.round((totalScored / totalPossible) * 100) : 0;

  session.status = 'submitted';
  session.submittedAt = new Date().toISOString();
  session.score = totalScored;
  session.percentage = percentage;
  session.lastSavedAt = new Date().toISOString();

  sessions[index] = session;
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));

  addAuditLog(
    session.studentId,
    session.studentName,
    'student',
    'SUBMIT_EXAM',
    `Submitted ${exam?.courseCode || 'Exam'}. Final Score: ${totalScored}/${totalPossible} (${percentage}%)`
  );

  return session;
}

// Audit Logs
export function getAuditLogs(): AuditLog[] {
  initializeStorage();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS) || '[]');
}

export function addAuditLog(
  userId: string,
  userName: string,
  userRole: 'admin' | 'lecturer' | 'student',
  action: string,
  description: string
): void {
  const logs = getAuditLogs();
  const newLog: AuditLog = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId,
    userName,
    userRole,
    action,
    description,
    ipAddress: '197.210.33.' + Math.floor(Math.random() * 200 + 10),
    timestamp: new Date().toISOString(),
  };
  logs.unshift(newLog); // newest first
  localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs.slice(0, 100))); // keep top 100
}

// Utility: Export Results to CSV
export function exportResultsToCSV(examinationId: string) {
  const exams = getExaminations();
  const exam = exams.find((e) => e.id === examinationId);
  const sessions = getSessions(examinationId);

  const headers = ['S/N', 'Student ID', 'Student Name', 'Status', 'Score', 'Total Marks', 'Percentage', 'Time Spent (Mins)', 'Submission Date'];
  const rows = sessions.map((s, idx) => {
    const minutes = Math.floor(s.timeSpentSeconds / 60);
    const passStatus = s.percentage >= (exam?.passThresholdPercentage || 50) ? 'Passed' : 'Failed';
    return [
      idx + 1,
      `"${s.studentRegNo}"`,
      `"${s.studentName}"`,
      s.status === 'submitted' ? passStatus : s.status,
      s.score,
      exam?.totalMarks || 100,
      `${s.percentage}%`,
      minutes,
      s.submittedAt ? new Date(s.submittedAt).toLocaleString() : 'N/A',
    ];
  });

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${exam?.courseCode || 'GNS'}_Examination_Results.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
