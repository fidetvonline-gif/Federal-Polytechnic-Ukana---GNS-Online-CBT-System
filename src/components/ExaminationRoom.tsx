import React, { useState, useEffect, useRef } from 'react';
import { Examination, Question, ExaminationSession, User } from '../types';
import {
  Clock,
  Check,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  RotateCcw,
  Send,
  Calculator as CalcIcon,
  Maximize2,
  Minimize2,
  AlertCircle,
  X,
  User as UserIcon,
} from 'lucide-react';

interface ExaminationRoomProps {
  examination: Examination;
  questions: Question[];
  session: ExaminationSession;
  currentUser: User;
  onUpdateAnswers: (
    answers: Record<string, 'A' | 'B' | 'C' | 'D'>,
    flaggedQuestionIds: string[],
    timeSpentSeconds: number,
    tabSwitchCount: number
  ) => void;
  onSubmitSession: () => void;
}

export const ExaminationRoom: React.FC<ExaminationRoomProps> = ({
  examination,
  questions,
  session,
  currentUser,
  onUpdateAnswers,
  onSubmitSession,
}) => {
  const crestLogo = 'https://fedpolyukana.edu.ng/wp-content/uploads/2026/07/Logo-150x150-removebg-preview.png';

  // Questions in randomized or session order
  const orderedQuestions = session.questionOrder
    .map((qid) => questions.find((q) => q.id === qid))
    .filter((q): q is Question => q !== undefined);

  const totalQuestions = orderedQuestions.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>(session.answers || {});
  const [flaggedIds, setFlaggedIds] = useState<string[]>(session.flaggedQuestionIds || []);
  const [tabSwitches, setTabSwitches] = useState<number>(session.tabSwitchCount || 0);
  const [showFocusWarning, setShowFocusWarning] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [paletteFilter, setPaletteFilter] = useState<'all' | 'attempted' | 'unattempted' | 'flagged'>('all');
  
  // Accessibility: Text Size scaling (1 = Normal, 2 = Medium, 3 = Large)
  const [textSize, setTextSize] = useState<'normal' | 'medium' | 'large'>('normal');

  // Calculator modal state
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcInput, setCalcInput] = useState('0');

  // Timer setup
  const totalDurationSeconds = examination.durationMinutes * 60;
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    const startMs = new Date(session.startedAt).getTime();
    const elapsedSecs = Math.floor((Date.now() - startMs) / 1000);
    const rem = totalDurationSeconds - elapsedSecs;
    return rem > 0 ? rem : 0;
  });

  const timeSpentRef = useRef<number>(session.timeSpentSeconds || 0);

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onSubmitSession();
          return 0;
        }
        return prev - 1;
      });
      timeSpentRef.current += 1;
    }, 1000);

    return () => clearInterval(timer);
  }, [onSubmitSession]);

  // Periodic Auto-Save every 10 seconds
  useEffect(() => {
    const autoSaveTimer = setInterval(() => {
      onUpdateAnswers(answers, flaggedIds, timeSpentRef.current, tabSwitches);
    }, 10000);

    return () => clearInterval(autoSaveTimer);
  }, [answers, flaggedIds, tabSwitches, onUpdateAnswers]);

  // Tab switch / Window focus loss monitor
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches((prev) => {
          const updated = prev + 1;
          setShowFocusWarning(true);
          onUpdateAnswers(answers, flaggedIds, timeSpentRef.current, updated);
          return updated;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [answers, flaggedIds, onUpdateAnswers]);

  const currentQuestion = orderedQuestions[currentIndex];

  const handleSelectOption = (opt: 'A' | 'B' | 'C' | 'D') => {
    if (!currentQuestion) return;
    const newAnswers = { ...answers, [currentQuestion.id]: opt };
    setAnswers(newAnswers);
    onUpdateAnswers(newAnswers, flaggedIds, timeSpentRef.current, tabSwitches);
  };

  const handleClearSelection = () => {
    if (!currentQuestion || !answers[currentQuestion.id]) return;
    const newAnswers = { ...answers };
    delete newAnswers[currentQuestion.id];
    setAnswers(newAnswers);
    onUpdateAnswers(newAnswers, flaggedIds, timeSpentRef.current, tabSwitches);
  };

  const handleToggleFlag = () => {
    if (!currentQuestion) return;
    const isFlagged = flaggedIds.includes(currentQuestion.id);
    const updatedFlags = isFlagged
      ? flaggedIds.filter((id) => id !== currentQuestion.id)
      : [...flaggedIds, currentQuestion.id];

    setFlaggedIds(updatedFlags);
    onUpdateAnswers(answers, updatedFlags, timeSpentRef.current, tabSwitches);
  };

  // Calculator logic
  const handleCalcClick = (val: string) => {
    if (val === 'C') {
      setCalcInput('0');
      return;
    }
    if (val === '=') {
      try {
        // Safe evaluation of standard math characters
        const sanitized = calcInput.replace(/[^0-9+\-*/.]/g, '');
        // eslint-disable-next-line no-eval
        const result = Function(`'use strict'; return (${sanitized})`)();
        setCalcInput(String(result));
      } catch {
        setCalcInput('Error');
      }
      return;
    }
    if (calcInput === '0' || calcInput === 'Error') {
      setCalcInput(val);
    } else {
      setCalcInput(calcInput + val);
    }
  };

  // Format time
  const hours = Math.floor(secondsRemaining / 3600);
  const minutes = Math.floor((secondsRemaining % 3600) / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${hours > 0 ? String(hours).padStart(2, '0') + ':' : ''}${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const answeredCount = Object.keys(answers).length;
  const unansweredCount = totalQuestions - answeredCount;
  const flaggedCount = flaggedIds.length;

  const isTimeCritical = secondsRemaining <= 300; // <= 5 mins

  // Filter palette questions
  const filteredPaletteQuestions = orderedQuestions.filter((q) => {
    const isAnswered = answers[q.id] !== undefined;
    const isFlagged = flaggedIds.includes(q.id);

    if (paletteFilter === 'attempted') return isAnswered;
    if (paletteFilter === 'unattempted') return !isAnswered;
    if (paletteFilter === 'flagged') return isFlagged;
    return true;
  });

  // Text size classes
  const questionTextClass =
    textSize === 'large'
      ? 'text-lg leading-relaxed font-medium'
      : textSize === 'medium'
      ? 'text-base leading-relaxed font-medium'
      : 'text-[15px] leading-relaxed font-medium';

  const optionTextClass =
    textSize === 'large'
      ? 'text-base'
      : textSize === 'medium'
      ? 'text-[15px]'
      : 'text-sm';

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col font-sans select-none text-slate-800">
      
      {/* Official CBT Top Bar */}
      <header className="bg-[#005a2b] text-white border-b border-[#004822] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Institution & Candidate Info */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-10 h-10 bg-white rounded p-0.5 shrink-0 flex items-center justify-center shadow-xs">
              <img src={crestLogo} alt="Seal" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-white uppercase">
                  FEDERAL POLYTECHNIC UKANA
                </span>
                <span className="text-emerald-300">·</span>
                <span className="text-xs text-emerald-100 font-medium">DIRECTORATE OF GENERAL STUDIES CBT CENTRE</span>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 text-xs text-emerald-100 font-mono">
                <span>Candidate: <strong className="text-white">{currentUser.fullName}</strong></span>
                <span>Matric: <strong className="text-white">{session.studentRegNo}</strong></span>
                <span className="hidden sm:inline">Terminal: <strong className="text-white">{currentUser.workstation || 'CBT LAB 1 · PC-14'}</strong></span>
              </div>
            </div>
          </div>

          {/* Course & Digital Countdown Timer */}
          <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto border-t md:border-t-0 border-emerald-800 pt-2 md:pt-0">
            <div className="text-left md:text-right hidden sm:block">
              <span className="text-xs text-emerald-200 block font-mono">COURSE:</span>
              <span className="font-semibold text-xs text-white uppercase">{examination.courseCode} - {examination.title}</span>
            </div>

            {/* Countdown Display */}
            <div
              className={`px-3.5 py-1.5 rounded border flex items-center gap-2 font-mono font-bold text-base ${
                isTimeCritical
                  ? 'bg-red-800 text-white border-red-700 animate-pulse'
                  : 'bg-[#004320] text-emerald-200 border-[#00361a]'
              }`}
            >
              <Clock className="w-4 h-4 text-emerald-300" />
              <span>TIME LEFT: {timeFormatted}</span>
            </div>
          </div>

        </div>
      </header>

      {/* Auxiliary Utility Bar (Accessibility & Tools) */}
      <div className="bg-white border-b border-slate-200 text-xs px-4 sm:px-6 py-1.5 text-slate-600">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-slate-700 uppercase tracking-wide text-[11px]">
              {examination.courseCode} · {examination.title}
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500 font-mono">
              Credit Units: {examination.creditUnits || 2} · Total Marks: {examination.totalMarks}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Text Zoom Controls */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded border border-slate-200">
              <span className="px-1.5 text-[10px] font-mono text-slate-500">FONT:</span>
              <button
                onClick={() => setTextSize('normal')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  textSize === 'normal' ? 'bg-white shadow-xs text-slate-900 font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                A
              </button>
              <button
                onClick={() => setTextSize('medium')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  textSize === 'medium' ? 'bg-white shadow-xs text-slate-900 font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                A+
              </button>
              <button
                onClick={() => setTextSize('large')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  textSize === 'large' ? 'bg-white shadow-xs text-slate-900 font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                A++
              </button>
            </div>

            {/* Standard Exam Calculator Toggle */}
            <button
              onClick={() => setShowCalculator(!showCalculator)}
              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-medium flex items-center gap-1.5 transition-colors"
            >
              <CalcIcon className="w-3.5 h-3.5" />
              <span>Calculator</span>
            </button>
          </div>
        </div>
      </div>

      {/* Focus Loss Warning Notice */}
      {showFocusWarning && (
        <div className="bg-amber-100 border-b border-amber-300 text-amber-900 px-4 py-2 text-xs flex items-center justify-between">
          <div className="max-w-7xl mx-auto flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>Examination Proctor Notice:</strong> Window focus was lost ({tabSwitches} times). Candidate actions are recorded in the central examination audit trail.
            </span>
          </div>
          <button
            onClick={() => setShowFocusWarning(false)}
            className="text-xs text-amber-800 hover:text-amber-950 font-bold underline ml-4 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Testing Viewport */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left/Center Column: Question Card & Controls (8 cols) */}
        <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
          
          <div className="bg-white rounded border border-slate-300 p-6 sm:p-8 space-y-6 flex-1 shadow-xs">
            
            {/* Question Card Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-900 text-base font-mono">
                  QUESTION {currentIndex + 1} OF {totalQuestions}
                </span>
                {currentQuestion?.topic && (
                  <span className="text-xs text-slate-500 font-medium">
                    · {currentQuestion.topic}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleToggleFlag}
                  className={`text-xs font-medium px-3 py-1 rounded border transition-colors flex items-center gap-1.5 cursor-pointer ${
                    currentQuestion && flaggedIds.includes(currentQuestion.id)
                      ? 'bg-amber-50 border-amber-400 text-amber-900 font-semibold'
                      : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  {currentQuestion && flaggedIds.includes(currentQuestion.id) ? 'Flagged for Review' : 'Flag for Review'}
                </button>
                <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {currentQuestion?.marks || 5} Points
                </span>
              </div>
            </div>

            {/* Question Text */}
            {currentQuestion && (
              <div className="space-y-6">
                <div className={`text-slate-900 ${questionTextClass}`}>
                  {currentQuestion.questionText}
                </div>

                {/* Option Rows A, B, C, D */}
                <div className="space-y-2.5 pt-2">
                  {(session.optionOrders[currentQuestion.id] || ['A', 'B', 'C', 'D']).map((optKey) => {
                    const textKey = `option${optKey}` as keyof Question;
                    const optionText = currentQuestion[textKey] as string;
                    const isSelected = answers[currentQuestion.id] === optKey;

                    return (
                      <div
                        key={optKey}
                        onClick={() => handleSelectOption(optKey)}
                        className={`p-3.5 rounded border transition-all flex items-start gap-3 cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50/70 border-[#006633] text-slate-950 font-medium'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 font-mono text-xs font-bold transition-colors ${
                            isSelected
                              ? 'bg-[#006633] text-white border-[#006633]'
                              : 'bg-white border-slate-400 text-slate-700'
                          }`}
                        >
                          {optKey}
                        </div>
                        <div className={`pt-0.5 leading-snug flex-1 ${optionTextClass}`}>
                          {optionText}
                        </div>
                        {isSelected && (
                          <div className="w-4 h-4 text-[#006633] shrink-0 mt-0.5">
                            <Check className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Examination Navigation Bar */}
          <div className="bg-white p-3.5 rounded border border-slate-300 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <button
                onClick={handleClearSelection}
                disabled={!currentQuestion || !answers[currentQuestion.id]}
                className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-1 cursor-pointer"
                title="Clear chosen answer for this question"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Clear Choice
              </button>
            </div>

            <div className="text-xs text-slate-500 font-mono hidden sm:block">
              Answered: <strong className="text-slate-800">{answeredCount}</strong> / {totalQuestions}
            </div>

            <div className="flex items-center gap-2">
              {currentIndex < totalQuestions - 1 ? (
                <button
                  onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                  className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#006633] hover:bg-[#005229] rounded transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" /> Submit Examination
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Question Palette (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          <div className="bg-white rounded border border-slate-300 p-4 space-y-4 shadow-xs">
            
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                Question Palette
              </h3>
              <p className="text-[11px] text-slate-500">
                Click any number to jump directly to that question.
              </p>
            </div>

            {/* Status Legend */}
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono border-t border-b border-slate-200 py-2.5">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-[#006633] border border-[#005229]"></span>
                <span className="text-slate-700">Answered: <strong>{answeredCount}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-white border border-slate-300"></span>
                <span className="text-slate-700">Unanswered: <strong>{unansweredCount}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-400 border border-amber-500"></span>
                <span className="text-slate-700">Flagged: <strong>{flaggedCount}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded border-2 border-slate-900 bg-slate-100"></span>
                <span className="text-slate-700">Current</span>
              </div>
            </div>

            {/* Filter Tabs for Palette */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded text-[11px]">
              <button
                onClick={() => setPaletteFilter('all')}
                className={`flex-1 py-1 rounded font-medium transition-colors ${
                  paletteFilter === 'all' ? 'bg-white shadow-xs text-slate-900 font-bold' : 'text-slate-600'
                }`}
              >
                All ({totalQuestions})
              </button>
              <button
                onClick={() => setPaletteFilter('attempted')}
                className={`flex-1 py-1 rounded font-medium transition-colors ${
                  paletteFilter === 'attempted' ? 'bg-white shadow-xs text-slate-900 font-bold' : 'text-slate-600'
                }`}
              >
                Done ({answeredCount})
              </button>
              <button
                onClick={() => setPaletteFilter('unattempted')}
                className={`flex-1 py-1 rounded font-medium transition-colors ${
                  paletteFilter === 'unattempted' ? 'bg-white shadow-xs text-slate-900 font-bold' : 'text-slate-600'
                }`}
              >
                Left ({unansweredCount})
              </button>
            </div>

            {/* Numbered Palette Grid */}
            <div className="grid grid-cols-5 gap-1.5 max-h-64 overflow-y-auto p-1">
              {orderedQuestions.map((q, idx) => {
                const isAnswered = answers[q.id] !== undefined;
                const isFlagged = flaggedIds.includes(q.id);
                const isCurrent = idx === currentIndex;

                // Palette button color
                let style = 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100';
                if (isAnswered) {
                  style = 'bg-[#006633] text-white border-[#005229] font-bold';
                }
                if (isFlagged) {
                  style = 'bg-amber-400 text-amber-950 border-amber-500 font-bold';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-9 rounded text-xs font-mono font-medium border transition-all cursor-pointer ${style} ${
                      isCurrent ? 'ring-2 ring-slate-900 ring-offset-1' : ''
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* End Exam Button Block */}
            <div className="pt-3 border-t border-slate-200 space-y-2">
              <button
                onClick={() => setShowSubmitModal(true)}
                className="w-full bg-[#006633] hover:bg-[#005229] text-white font-semibold text-xs py-2.5 rounded shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" /> End & Submit Examination
              </button>
              <p className="text-[11px] text-slate-400 text-center font-mono">
                Responses are automatically saved in real time.
              </p>
            </div>

          </div>

        </div>
      </main>

      {/* On-Screen Standard Exam Calculator Modal */}
      {showCalculator && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white p-4 rounded shadow-2xl border border-slate-700 w-64 space-y-3 font-mono">
          <div className="flex items-center justify-between border-b border-slate-700 pb-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <CalcIcon className="w-3.5 h-3.5" /> Examination Calculator
            </span>
            <button
              onClick={() => setShowCalculator(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Calculator Screen */}
          <div className="bg-slate-950 p-2.5 rounded border border-slate-800 text-right text-lg font-bold text-emerald-400 overflow-x-auto">
            {calcInput}
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-4 gap-1.5 text-xs">
            {['C', '/', '*', '-'].map((k) => (
              <button
                key={k}
                onClick={() => handleCalcClick(k)}
                className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold"
              >
                {k}
              </button>
            ))}
            {['7', '8', '9', '+'].map((k) => (
              <button
                key={k}
                onClick={() => handleCalcClick(k)}
                className={`p-2 rounded font-bold ${
                  k === '+' ? 'bg-slate-800 text-amber-300 hover:bg-slate-700' : 'bg-slate-800/80 hover:bg-slate-700'
                }`}
              >
                {k}
              </button>
            ))}
            {['4', '5', '6', '='].map((k) => (
              <button
                key={k}
                onClick={() => handleCalcClick(k)}
                className={`p-2 rounded font-bold ${
                  k === '=' ? 'row-span-2 bg-[#006633] text-white hover:bg-[#005229]' : 'bg-slate-800/80 hover:bg-slate-700'
                }`}
              >
                {k}
              </button>
            ))}
            {['1', '2', '3'].map((k) => (
              <button
                key={k}
                onClick={() => handleCalcClick(k)}
                className="p-2 rounded bg-slate-800/80 hover:bg-slate-700 font-bold"
              >
                {k}
              </button>
            ))}
            {['0', '.'].map((k) => (
              <button
                key={k}
                onClick={() => handleCalcClick(k)}
                className={`p-2 rounded bg-slate-800/80 hover:bg-slate-700 font-bold ${k === '0' ? 'col-span-2' : ''}`}
              >
                {k}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Official Confirmation Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded border border-slate-300 max-w-md w-full p-6 shadow-xl space-y-4">
            
            <div className="text-left space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Confirm Examination Submission
              </h3>
              <p className="text-xs text-slate-600">
                Please review your attempt summary below before concluding your examination session.
              </p>
            </div>

            {/* Detailed Attempt Breakdown Table */}
            <div className="border border-slate-200 rounded overflow-hidden text-xs">
              <div className="bg-slate-50 p-2.5 font-semibold text-slate-700 border-b border-slate-200">
                Course: {examination.courseCode} - {examination.title}
              </div>
              <div className="p-3 space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Questions:</span>
                  <span className="font-bold text-slate-900">{totalQuestions}</span>
                </div>
                <div className="flex justify-between text-[#006633]">
                  <span>Questions Attempted:</span>
                  <span className="font-bold">{answeredCount}</span>
                </div>
                <div className="flex justify-between text-amber-700">
                  <span>Questions Unattempted:</span>
                  <span className="font-bold">{unansweredCount}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Flagged for Review:</span>
                  <span className="font-bold">{flaggedCount}</span>
                </div>
              </div>
            </div>

            {unansweredCount > 0 && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900">
                <strong>Attention:</strong> You have {unansweredCount} unanswered questions remaining.
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors cursor-pointer"
              >
                Return to Examination
              </button>
              <button
                onClick={() => {
                  setShowSubmitModal(false);
                  onSubmitSession();
                }}
                className="bg-[#006633] hover:bg-[#005229] text-white text-xs font-semibold px-4 py-2 rounded transition-colors cursor-pointer"
              >
                Yes, Submit Examination
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
