import React, { useState } from 'react';
import { Examination, ExaminationSession, Question } from '../types';
import { Check, X, ArrowLeft, Printer, BookOpen } from 'lucide-react';

interface StudentResultViewProps {
  examination: Examination;
  session: ExaminationSession;
  questions: Question[];
  onBack: () => void;
}

export const StudentResultView: React.FC<StudentResultViewProps> = ({
  examination,
  session,
  questions,
  onBack,
}) => {
  const crestLogo = 'https://fedpolyukana.edu.ng/wp-content/uploads/2026/07/Logo-150x150-removebg-preview.png';
  const [showReview, setShowReview] = useState(false);

  const isPassed = session.percentage >= examination.passThresholdPercentage;

  const calculateGrade = (pct: number) => {
    if (pct >= 75) return { grade: 'A', text: 'Distinction' };
    if (pct >= 70) return { grade: 'AB', text: 'Very Good' };
    if (pct >= 65) return { grade: 'B', text: 'Upper Credit' };
    if (pct >= 60) return { grade: 'BC', text: 'Good' };
    if (pct >= 50) return { grade: 'C', text: 'Lower Credit / Pass' };
    if (pct >= 45) return { grade: 'CD', text: 'Pass' };
    if (pct >= 40) return { grade: 'D', text: 'Fair' };
    return { grade: 'F', text: 'Fail / Repeat' };
  };

  const gradeInfo = calculateGrade(session.percentage);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Top Action Navigation Bar (Hidden on Print) */}
      <div className="no-print bg-white p-3.5 rounded border border-slate-300 shadow-xs flex items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="text-slate-700 hover:text-slate-900 text-xs font-semibold px-3 py-1.5 rounded hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Examination Schedule
        </button>

        <div className="flex items-center gap-2">
          {examination.allowReview && (
            <button
              onClick={() => setShowReview(!showReview)}
              className="bg-white hover:bg-slate-100 text-slate-800 text-xs font-medium px-3.5 py-1.5 rounded border border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" /> {showReview ? 'Hide Test Review' : 'Review Test Questions'}
            </button>
          )}
          <button
            onClick={() => window.print()}
            className="bg-[#006633] hover:bg-[#005229] text-white text-xs font-semibold px-4 py-1.5 rounded transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Printer className="w-4 h-4" /> Print Result Slip
          </button>
        </div>
      </div>

      {/* Official Institutional Examination Slip Container */}
      <div className="bg-white rounded border border-slate-300 p-8 sm:p-10 space-y-6 shadow-xs print:border-none print:shadow-none print:p-0">
        
        {/* Institutional Letterhead */}
        <div className="text-center border-b-2 border-slate-900 pb-5 space-y-1.5">
          <div className="flex justify-center mb-2">
            <img src={crestLogo} alt="Federal Polytechnic Ukana Crest" className="w-16 h-16 object-contain" />
          </div>
          <h1 className="text-xl font-bold tracking-tight uppercase text-slate-900">
            FEDERAL POLYTECHNIC UKANA
          </h1>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-700">
            P.M.B. 2014, IKOT EKPENE, AKWA IBOM STATE, NIGERIA
          </p>
          <p className="text-xs font-bold text-[#006633] uppercase">
            DIRECTORATE OF GENERAL STUDIES (GNS)
          </p>
          <div className="inline-block bg-slate-100 text-slate-900 text-xs font-bold font-mono px-3 py-1 rounded border border-slate-300 mt-1 uppercase">
            CBT RESULT NOTIFICATION SLIP
          </div>
        </div>

        {/* Candidate Profile Summary Table */}
        <div className="border border-slate-300 rounded overflow-hidden text-xs font-mono">
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
            <div className="p-3.5 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500 uppercase">Candidate Name:</span>
                <span className="font-bold text-slate-900 font-sans">{session.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 uppercase">Matriculation No:</span>
                <span className="font-bold text-slate-900">{session.studentRegNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 uppercase">Department:</span>
                <span className="font-bold text-slate-800 font-sans">{session.department}</span>
              </div>
            </div>

            <div className="p-3.5 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500 uppercase">Course Code:</span>
                <span className="font-bold text-[#006633]">{examination.courseCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 uppercase">Course Title:</span>
                <span className="font-bold text-slate-900 font-sans">{examination.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 uppercase">Credit Units:</span>
                <span className="font-bold text-slate-800">{examination.creditUnits || 2} Units</span>
              </div>
            </div>
          </div>
        </div>

        {/* Official Score Card Display */}
        <div className="bg-slate-50 border border-slate-300 rounded p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center divide-x divide-slate-200">
            
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-slate-500 uppercase block">Raw Score</span>
              <div className="text-2xl font-bold font-mono text-slate-900">
                {session.score} <span className="text-xs text-slate-500 font-normal">/ {examination.totalMarks}</span>
              </div>
              <span className="text-[11px] text-slate-500 font-sans">Points Earned</span>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-mono text-slate-500 uppercase block">Percentage</span>
              <div className="text-2xl font-bold font-mono text-slate-900">
                {session.percentage}%
              </div>
              <span className="text-[11px] text-slate-500 font-sans">Pass Mark: {examination.passThresholdPercentage}%</span>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-mono text-slate-500 uppercase block">Letter Grade</span>
              <div className="text-2xl font-bold font-mono text-slate-900">
                {gradeInfo.grade}
              </div>
              <span className="text-[11px] text-slate-600 font-medium">{gradeInfo.text}</span>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-mono text-slate-500 uppercase block">Final Remark</span>
              <div className={`text-xl font-bold font-mono uppercase mt-0.5 ${isPassed ? 'text-[#006633]' : 'text-red-700'}`}>
                {isPassed ? 'PASSED' : 'FAILED'}
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {session.submittedAt ? new Date(session.submittedAt).toLocaleDateString() : ''}
              </span>
            </div>

          </div>
        </div>

        {/* Detailed Question Review Section */}
        {showReview && examination.allowReview && (
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Test Item Review & Solutions Rationale
            </h3>

            <div className="space-y-3">
              {questions.map((q, idx) => {
                const studentAns = session.answers[q.id];
                const isCorrect = studentAns === q.correctOption;

                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded border text-xs space-y-2 ${
                      isCorrect ? 'bg-emerald-50/40 border-emerald-300' : 'bg-red-50/40 border-red-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2">
                        <span className="font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 shrink-0">
                          Q{idx + 1}
                        </span>
                        <span className="font-medium text-slate-900 leading-snug">{q.questionText}</span>
                      </div>
                      <span className={`font-mono font-bold shrink-0 ${isCorrect ? 'text-[#006633]' : 'text-red-700'}`}>
                        {isCorrect ? `+${q.marks} Pts` : '0 Pts'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 font-mono pt-1 text-[11px]">
                      <div className="p-2 bg-white rounded border border-slate-200">
                        <span className="text-slate-400 block">Candidate Selection:</span>
                        <span className={`font-bold ${isCorrect ? 'text-[#006633]' : 'text-red-700'}`}>
                          {studentAns ? `Option ${studentAns}` : 'Unanswered'}
                        </span>
                      </div>
                      <div className="p-2 bg-white rounded border border-slate-200">
                        <span className="text-slate-400 block">Correct Key:</span>
                        <span className="font-bold text-[#006633]">Option {q.correctOption}</span>
                      </div>
                    </div>

                    {q.explanation && (
                      <div className="text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-200 font-sans">
                        <strong>Explanation:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Verification and Endorsement Footer */}
        <div className="pt-6 border-t border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <div>
            <span>Verification Ref: <strong>FPU-GNS-{session.id.toUpperCase().slice(0, 14)}</strong></span>
          </div>
          <div>
            <span>Directorate of General Studies · Federal Polytechnic Ukana</span>
          </div>
        </div>

      </div>

    </div>
  );
};
