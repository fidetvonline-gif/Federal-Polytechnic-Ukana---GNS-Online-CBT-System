import React, { useState } from 'react';
import { Question, Examination } from '../types';
import { Plus, Edit2, Trash2, Check, Save, X, Search } from 'lucide-react';

interface QuestionManagerProps {
  examinations: Examination[];
  questions: Question[];
  onSaveQuestion: (q: Question) => void;
  onDeleteQuestion: (id: string) => void;
}

export const QuestionManager: React.FC<QuestionManagerProps> = ({
  examinations,
  questions,
  onSaveQuestion,
  onDeleteQuestion,
}) => {
  const [selectedExamId, setSelectedExamId] = useState<string>(examinations[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Partial<Question> | null>(null);

  const currentExam = examinations.find((e) => e.id === selectedExamId);
  const examQuestions = questions.filter((q) => q.examinationId === selectedExamId);

  const filteredQuestions = examQuestions.filter(
    (q) =>
      q.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.optionA.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.optionB.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.optionC.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.optionD.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenAddModal = () => {
    setEditingQuestion({
      id: `q-${Date.now()}`,
      examinationId: selectedExamId,
      questionText: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctOption: 'A',
      marks: 5,
      questionOrder: examQuestions.length + 1,
      topic: 'General Studies Core',
      explanation: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (q: Question) => {
    setEditingQuestion({ ...q });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion || !editingQuestion.questionText) return;

    onSaveQuestion(editingQuestion as Question);
    setIsModalOpen(false);
    setEditingQuestion(null);
  };

  return (
    <div className="space-y-4">
      
      {/* Top Filter and Actions Bar */}
      <div className="bg-white border border-slate-300 rounded p-4 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            GNS Examination Question Bank
          </h2>
          <p className="text-xs text-slate-500">
            Author and manage multiple-choice objective test items for General Studies courses.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-600 font-medium whitespace-nowrap">Course:</label>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:ring-1 focus:ring-emerald-600 focus:outline-none cursor-pointer"
            >
              {examinations.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.courseCode} - {exam.title} ({questions.filter((q) => q.examinationId === exam.id).length} Items)
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="bg-[#006633] hover:bg-[#005229] text-white text-xs font-semibold px-3.5 py-1.5 rounded transition-colors inline-flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>
      </div>

      {/* Selected Course Information Bar */}
      {currentExam && (
        <div className="bg-slate-50 border border-slate-200 rounded p-3 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 font-mono">
          <div className="flex items-center gap-3">
            <span className="font-bold text-[#006633]">{currentExam.courseCode}</span>
            <span className="text-slate-400">·</span>
            <span className="font-sans font-semibold text-slate-800">{currentExam.title}</span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-600 font-sans">{currentExam.creditUnits} Units</span>
          </div>
          <div className="flex items-center gap-4 text-slate-600">
            <span>Duration: <strong>{currentExam.durationMinutes} Mins</strong></span>
            <span>Total Items: <strong>{examQuestions.length}</strong></span>
            <span>Cumulative Marks: <strong>{examQuestions.reduce((a, b) => a + b.marks, 0)} Pts</strong></span>
          </div>
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
        <input
          type="text"
          placeholder="Filter questions by keywords or options..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white pl-8 pr-3 py-1.5 text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-600"
        />
      </div>

      {/* Questions List */}
      {filteredQuestions.length === 0 ? (
        <div className="bg-white rounded border border-slate-300 p-8 text-center space-y-2">
          <p className="text-xs font-semibold text-slate-700">No Questions Found</p>
          <p className="text-xs text-slate-500">
            There are currently no items matching your criteria for {currentExam?.courseCode}.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="mt-2 bg-[#006633] hover:bg-[#005229] text-white text-xs font-semibold px-3 py-1.5 rounded inline-flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add First Question Item
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredQuestions.map((q, idx) => (
            <div
              key={q.id}
              className="bg-white rounded border border-slate-300 p-4 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <span className="font-mono font-bold text-xs text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded shrink-0">
                    Q{idx + 1}
                  </span>
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-slate-900 leading-snug">
                      {q.questionText}
                    </h4>
                    {q.topic && (
                      <span className="text-[11px] text-slate-500 font-mono">
                        Topic: {q.topic}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-mono font-medium text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                    {q.marks} Pts
                  </span>
                  <button
                    onClick={() => handleOpenEditModal(q)}
                    className="p-1 text-slate-600 hover:text-slate-900 rounded border border-slate-200"
                    title="Edit Item"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteQuestion(q.id)}
                    className="p-1 text-slate-600 hover:text-red-700 rounded border border-slate-200"
                    title="Delete Item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1 pl-8">
                {(['A', 'B', 'C', 'D'] as const).map((opt) => {
                  const key = `option${opt}` as keyof Question;
                  const text = q[key] as string;
                  const isCorrect = q.correctOption === opt;

                  return (
                    <div
                      key={opt}
                      className={`p-2 rounded border flex items-center gap-2 ${
                        isCorrect
                          ? 'bg-emerald-50/60 border-[#006633] text-slate-900 font-medium'
                          : 'bg-slate-50/50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[11px] font-bold shrink-0 ${
                          isCorrect
                            ? 'bg-[#006633] text-white'
                            : 'bg-white border border-slate-300 text-slate-700'
                        }`}
                      >
                        {opt}
                      </span>
                      <span className="flex-1 truncate">{text}</span>
                      {isCorrect && (
                        <Check className="w-3.5 h-3.5 text-[#006633] shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>

              {q.explanation && (
                <div className="text-[11px] text-slate-500 pl-8 font-sans">
                  <strong>Rationale:</strong> {q.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Question Item Modal */}
      {isModalOpen && editingQuestion && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded border border-slate-300 max-w-xl w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                {editingQuestion.id?.includes('q-') ? 'Edit Objective Test Item' : 'Add Question Item'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Question Text *
                </label>
                <textarea
                  required
                  rows={3}
                  value={editingQuestion.questionText || ''}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, questionText: e.target.value })
                  }
                  placeholder="Enter objective question prompt..."
                  className="w-full p-2.5 rounded border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(['A', 'B', 'C', 'D'] as const).map((opt) => {
                  const key = `option${opt}` as keyof Question;
                  const isCorrect = editingQuestion.correctOption === opt;

                  return (
                    <div key={opt} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="font-semibold text-slate-700">Option {opt}</label>
                        <label className="flex items-center gap-1 font-normal text-slate-600 cursor-pointer">
                          <input
                            type="radio"
                            name="correctOption"
                            checked={isCorrect}
                            onChange={() =>
                              setEditingQuestion({ ...editingQuestion, correctOption: opt })
                            }
                            className="text-[#006633] focus:ring-[#006633]"
                          />
                          <span>Correct</span>
                        </label>
                      </div>
                      <input
                        type="text"
                        required
                        value={(editingQuestion[key] as string) || ''}
                        onChange={(e) =>
                          setEditingQuestion({ ...editingQuestion, [key]: e.target.value })
                        }
                        placeholder={`Option ${opt} text...`}
                        className={`w-full p-2 rounded border focus:ring-1 focus:ring-emerald-600 focus:outline-none ${
                          isCorrect ? 'border-[#006633] bg-emerald-50/30' : 'border-slate-300'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Marks / Points
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={editingQuestion.marks || 5}
                    onChange={(e) =>
                      setEditingQuestion({ ...editingQuestion, marks: parseInt(e.target.value) || 1 })
                    }
                    className="w-full p-2 rounded border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Topic / Sub-unit
                  </label>
                  <input
                    type="text"
                    value={editingQuestion.topic || ''}
                    onChange={(e) =>
                      setEditingQuestion({ ...editingQuestion, topic: e.target.value })
                    }
                    placeholder="e.g. Concord, Constitution, Phonetics"
                    className="w-full p-2 rounded border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Answer Explanation / Rationale
                </label>
                <input
                  type="text"
                  value={editingQuestion.explanation || ''}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, explanation: e.target.value })
                  }
                  placeholder="Rationale for the correct option..."
                  className="w-full p-2 rounded border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#006633] hover:bg-[#005229] text-white font-semibold px-4 py-2 rounded transition-colors flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" /> Save Question
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
