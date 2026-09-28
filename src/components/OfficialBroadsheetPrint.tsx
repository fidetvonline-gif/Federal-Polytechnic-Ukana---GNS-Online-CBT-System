import React from 'react';
import { Examination, ExaminationSession } from '../types';
import { Printer, ArrowLeft, Download } from 'lucide-react';

interface OfficialBroadsheetProps {
  examination: Examination;
  sessions: ExaminationSession[];
  onBack: () => void;
  onExportCSV: () => void;
}

export const OfficialBroadsheetPrint: React.FC<OfficialBroadsheetProps> = ({
  examination,
  sessions,
  onBack,
  onExportCSV,
}) => {
  const crestLogo = 'https://fedpolyukana.edu.ng/wp-content/uploads/2026/07/Logo-150x150-removebg-preview.png';

  const calculateGrade = (percentage: number) => {
    if (percentage >= 75) return { grade: 'A', remark: 'Distinction' };
    if (percentage >= 70) return { grade: 'AB', remark: 'Very Good' };
    if (percentage >= 65) return { grade: 'B', remark: 'Upper Credit' };
    if (percentage >= 60) return { grade: 'BC', remark: 'Good' };
    if (percentage >= 50) return { grade: 'C', remark: 'Lower Credit' };
    if (percentage >= 45) return { grade: 'CD', remark: 'Pass' };
    if (percentage >= 40) return { grade: 'D', remark: 'Fair' };
    return { grade: 'F', remark: 'Fail' };
  };

  const totalCandidates = sessions.length;
  const passedCount = sessions.filter((s) => s.percentage >= examination.passThresholdPercentage).length;
  const failedCount = totalCandidates - passedCount;
  const passRate = totalCandidates > 0 ? Math.round((passedCount / totalCandidates) * 100) : 0;

  return (
    <div className="space-y-6">
      
      {/* Control Bar (Hidden during Print) */}
      <div className="no-print bg-white p-3.5 rounded border border-slate-300 shadow-xs flex items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="text-slate-700 hover:text-slate-900 text-xs font-semibold px-3 py-1.5 rounded hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onExportCSV}
            className="bg-white hover:bg-slate-100 text-slate-800 text-xs font-medium px-3.5 py-1.5 rounded border border-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export CSV Spreadsheet
          </button>
          <button
            onClick={() => window.print()}
            className="bg-[#006633] hover:bg-[#005229] text-white text-xs font-semibold px-4 py-1.5 rounded flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Print Senate Broadsheet
          </button>
        </div>
      </div>

      {/* Official Printable Broadsheet Sheet Container */}
      <div className="bg-white p-8 sm:p-12 rounded border border-slate-300 shadow-sm text-slate-900 print:shadow-none print:border-none print:p-0">
        
        {/* Institutional Letterhead Header */}
        <div className="border-b-2 border-slate-900 pb-5 mb-6 text-center space-y-1.5">
          <div className="flex items-center justify-center mb-2">
            <img
              src={crestLogo}
              alt="Federal Polytechnic Ukana Crest"
              className="w-16 h-16 object-contain"
            />
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
          <div className="inline-block bg-slate-100 text-slate-900 text-xs font-bold font-mono px-4 py-1 rounded border border-slate-300 mt-1 uppercase">
            DEPARTMENTAL EXAMINATION RESULT BROADSHEET
          </div>
        </div>

        {/* Examination Summary Metadata */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded border border-slate-300 text-xs font-mono mb-6 print-break-inside-avoid">
          <div>
            <span className="text-slate-500 uppercase text-[10px] block">Course Title</span>
            <span className="font-bold text-slate-900 font-sans">{examination.title}</span>
          </div>
          <div>
            <span className="text-slate-500 uppercase text-[10px] block">Course Code</span>
            <span className="font-bold text-[#006633]">{examination.courseCode} ({examination.creditUnits || 2} Units)</span>
          </div>
          <div>
            <span className="text-slate-500 uppercase text-[10px] block">Academic Session</span>
            <span className="font-bold text-slate-900">{examination.academicSession} · {examination.semester}</span>
          </div>
          <div>
            <span className="text-slate-500 uppercase text-[10px] block">Pass Mark Threshold</span>
            <span className="font-bold text-slate-900">{examination.passThresholdPercentage}%</span>
          </div>
          <div>
            <span className="text-slate-500 uppercase text-[10px] block">Total Candidates</span>
            <span className="font-bold text-slate-900">{totalCandidates}</span>
          </div>
          <div>
            <span className="text-slate-500 uppercase text-[10px] block">Total Passed</span>
            <span className="font-bold text-[#006633]">{passedCount} ({passRate}%)</span>
          </div>
          <div>
            <span className="text-slate-500 uppercase text-[10px] block">Total Failed</span>
            <span className="font-bold text-red-700">{failedCount}</span>
          </div>
          <div>
            <span className="text-slate-500 uppercase text-[10px] block">Date of Compilation</span>
            <span className="font-bold text-slate-900">{new Date().toLocaleDateString()}</span>
          </div>
        </div>

        {/* Candidate Results Table */}
        <div className="overflow-x-auto border border-slate-300 rounded mb-8">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-800 uppercase font-mono text-[11px] border-b border-slate-300">
                <th className="p-2.5 border-r border-slate-300 w-12 text-center">S/N</th>
                <th className="p-2.5 border-r border-slate-300">Matriculation No</th>
                <th className="p-2.5 border-r border-slate-300">Candidate Full Name</th>
                <th className="p-2.5 border-r border-slate-300">Department / Programme</th>
                <th className="p-2.5 border-r border-slate-300 text-center">Raw Score</th>
                <th className="p-2.5 border-r border-slate-300 text-center">Score %</th>
                <th className="p-2.5 border-r border-slate-300 text-center">Grade</th>
                <th className="p-2.5 text-center">Remark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-sans">
              {sessions.map((sess, idx) => {
                const gradeInfo = calculateGrade(sess.percentage);
                const isPass = sess.percentage >= examination.passThresholdPercentage;

                return (
                  <tr key={sess.id} className="hover:bg-slate-50/50 transition-colors font-mono">
                    <td className="p-2.5 border-r border-slate-200 text-center text-slate-500">
                      {idx + 1}
                    </td>
                    <td className="p-2.5 border-r border-slate-200 font-bold text-slate-900">
                      {sess.studentRegNo}
                    </td>
                    <td className="p-2.5 border-r border-slate-200 font-medium text-slate-800 font-sans">
                      {sess.studentName}
                    </td>
                    <td className="p-2.5 border-r border-slate-200 text-slate-600 text-[11px] font-sans">
                      {sess.department}
                    </td>
                    <td className="p-2.5 border-r border-slate-200 text-center font-semibold">
                      {sess.score} / {examination.totalMarks}
                    </td>
                    <td className="p-2.5 border-r border-slate-200 text-center font-bold text-slate-900">
                      {sess.percentage}%
                    </td>
                    <td className="p-2.5 border-r border-slate-200 text-center font-bold text-slate-900">
                      {gradeInfo.grade}
                    </td>
                    <td className="p-2.5 text-center">
                      <span
                        className={`font-semibold text-[11px] uppercase ${
                          isPass ? 'text-[#006633]' : 'text-red-700'
                        }`}
                      >
                        {isPass ? 'PASSED' : 'FAILED'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Institutional Signatures Block */}
        <div className="pt-8 border-t border-slate-300 grid grid-cols-3 gap-6 text-xs print-break-inside-avoid">
          <div className="space-y-12">
            <p className="font-semibold text-slate-700">Course Lecturer / Examiner:</p>
            <div className="border-b border-slate-400 w-40"></div>
            <div>
              <p className="font-bold text-slate-900">{examination.createdBy}</p>
              <p className="text-slate-500 text-[11px]">Signature & Date</p>
            </div>
          </div>

          <div className="space-y-12 text-center">
            <p className="font-semibold text-slate-700">Director / Head of Department (GNS):</p>
            <div className="border-b border-slate-400 w-40 mx-auto"></div>
            <div>
              <p className="font-bold text-slate-900">Dr. Okon E. Bassey</p>
              <p className="text-slate-500 text-[11px]">Directorate of General Studies</p>
            </div>
          </div>

          <div className="space-y-12 text-right">
            <p className="font-semibold text-slate-700">Dean, School of General Studies:</p>
            <div className="border-b border-slate-400 w-40 ml-auto"></div>
            <div>
              <p className="font-bold text-slate-900">Academic Board Representative</p>
              <p className="text-slate-500 text-[11px]">Federal Polytechnic Ukana</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
