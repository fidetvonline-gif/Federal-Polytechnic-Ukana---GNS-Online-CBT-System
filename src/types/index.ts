export type UserRole = 'admin' | 'lecturer' | 'student';

export interface User {
  id: string;
  fullName: string;
  email: string;
  studentId?: string; // Matric No: e.g., 2026/ND/PMC/001
  role: UserRole;
  department: string; // e.g. Science Laboratory Technology, Computer Science, Electrical Electronics
  level?: string; // e.g. ND I, ND II, HND I, HND II
  school?: string; // School of Applied Sciences, School of Engineering, School of Business
  workstation?: string; // e.g., LAB 01 / PC 24
  status: boolean; // active/inactive
  createdAt: string;
}

export type GNSCourseCategory = 'english' | 'citizenship' | 'entrepreneurship' | 'communication';

export interface Question {
  id: string;
  examinationId: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: 'A' | 'B' | 'C' | 'D';
  marks: number;
  questionOrder: number;
  explanation?: string;
  topic?: string;
}

export type ExamStatus = 'active' | 'upcoming' | 'completed' | 'draft';

export interface Examination {
  id: string;
  title: string;
  courseCode: string; // e.g., GNS 101, GNS 102, GNS 201, GNS 202, GNS 111, GNS 228
  courseCategory: GNSCourseCategory;
  creditUnits: number; // e.g., 2 Units
  semester: string; // First Semester, Second Semester
  academicSession: string; // 2025/2026
  department: string; // Directorate of General Studies
  durationMinutes: number;
  totalMarks: number;
  passThresholdPercentage: number; // e.g. 50%
  startTime: string;
  endTime: string;
  status: ExamStatus;
  createdBy: string;
  createdAt: string;
  instructions: string;
  releaseResultsImmediately: boolean;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  allowReview: boolean;
  assignedStudentIds?: string[];
}

export type SessionStatus = 'not_started' | 'in_progress' | 'submitted' | 'expired';

export interface ExaminationSession {
  id: string;
  examinationId: string;
  studentId: string; // User ID
  studentName: string;
  studentRegNo: string;
  department: string;
  startedAt: string;
  submittedAt?: string;
  status: SessionStatus;
  score: number;
  percentage: number;
  timeSpentSeconds: number;
  answers: Record<string, 'A' | 'B' | 'C' | 'D'>; // questionId -> selectedOption
  flaggedQuestionIds: string[]; // questionIds marked for review
  tabSwitchCount: number;
  questionOrder: string[]; // randomized list of question IDs for this session
  optionOrders: Record<string, ('A' | 'B' | 'C' | 'D')[]>; // randomized option keys
  lastSavedAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  description: string;
  ipAddress: string;
  timestamp: string;
}
