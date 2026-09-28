import React, { useState, useEffect } from 'react';
import { Database, CheckCircle2, AlertCircle, RefreshCw, Key, Globe, ShieldCheck, Copy, Check, ExternalLink, X } from 'lucide-react';
import { getSupabaseConfig, saveSupabaseConfig, clearSupabaseConfig, testSupabaseConnection, syncLocalDataToSupabase } from '../services/supabaseService';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({ isOpen, onClose }) => {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'config' | 'sql'>('config');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const config = getSupabaseConfig();
      setUrl(config.url);
      setKey(config.key);
      setTestResult(null);
      setSyncResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTestResult(null);
    setSyncResult(null);

    const res = await testSupabaseConnection(url, key);
    setTestResult(res);
    if (res.success) {
      saveSupabaseConfig(url, key);
    }
    setLoading(false);
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    const res = await syncLocalDataToSupabase();
    setSyncResult(res);
    setSyncing(false);
  };

  const handleDisconnect = () => {
    clearSupabaseConfig();
    setUrl('');
    setKey('');
    setTestResult({ success: true, message: 'Disconnected Supabase successfully.' });
    setSyncResult(null);
  };

  const sqlSchemaScript = `-- Federal Polytechnic Ukana GNS CBT Portal - Supabase Schema
create table if not exists examinations (
  id text primary key,
  "courseCode" text,
  title text,
  department text,
  "durationMinutes" integer,
  "totalMarks" integer,
  "passThresholdPercentage" integer,
  "isPublished" boolean,
  "shuffleQuestions" boolean,
  "shuffleOptions" boolean,
  "startDate" text,
  "endDate" text
);

create table if not exists questions (
  id text primary key,
  "examinationId" text,
  "questionText" text,
  options jsonb,
  "correctOption" text,
  marks integer,
  explanation text
);

create table if not exists examination_sessions (
  id text primary key,
  "examinationId" text,
  "studentId" text,
  "studentName" text,
  "studentRegNo" text,
  department text,
  "startedAt" text,
  "submittedAt" text,
  status text,
  score numeric,
  percentage numeric,
  "timeSpentSeconds" integer,
  answers jsonb,
  "flaggedQuestionIds" jsonb,
  "tabSwitchCount" integer,
  "questionOrder" jsonb,
  "optionOrders" jsonb,
  "lastSavedAt" text
);

create table if not exists users (
  id text primary key,
  email text,
  "fullName" text,
  role text,
  department text,
  "studentId" text
);`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlSchemaScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-emerald-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-green-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-700/60 rounded-xl border border-emerald-600/50 shadow-inner">
              <Database className="w-7 h-7 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Supabase Cloud Database Integration</h2>
              <p className="text-emerald-200 text-xs">Federal Polytechnic Ukana CBT Portal Cloud Sync</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-emerald-200 hover:text-white hover:bg-emerald-800/80 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-100 bg-gray-50/70 px-6 pt-2 space-x-6">
          <button
            onClick={() => setActiveTab('config')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center space-x-2 ${
              activeTab === 'config'
                ? 'border-emerald-700 text-emerald-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Connection & Sync</span>
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center space-x-2 ${
              activeTab === 'sql'
                ? 'border-emerald-700 text-emerald-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>SQL Setup & Schema</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {activeTab === 'config' ? (
            <div className="space-y-6">
              <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-4 text-xs text-emerald-900 leading-relaxed">
                <span className="font-bold">Connect your Supabase project</span> to synchronize examination questions, student rosters, candidate scores, and audit trails in real-time. Paste your Supabase project URL and API (anon) key below.
              </div>

              <form onSubmit={handleTestAndSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Supabase Project URL
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Globe className="w-4 h-4" />
                    </div>
                    <input
                      type="url"
                      required
                      placeholder="https://xyzcompany.supabase.co"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Supabase Anon / Public API Key
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Key className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      required
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      value={key}
                      onChange={(e) => setKey(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-sm rounded-xl shadow-md transition-all flex items-center space-x-2 disabled:opacity-50"
                    >
                      {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                      <span>{loading ? 'Connecting...' : 'Test & Save Connection'}</span>
                    </button>

                    {url && key && (
                      <button
                        type="button"
                        onClick={handleDisconnect}
                        className="px-4 py-2.5 bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600 font-medium text-sm rounded-xl transition-all"
                      >
                        Disconnect
                      </button>
                    )}
                  </div>

                  {url && key && (
                    <button
                      type="button"
                      onClick={handleSync}
                      disabled={syncing}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl shadow-md transition-all flex items-center space-x-2 disabled:opacity-50"
                    >
                      {syncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                      <span>{syncing ? 'Syncing Data...' : 'Sync Local Data to Supabase'}</span>
                    </button>
                  )}
                </div>
              </form>

              {testResult && (
                <div
                  className={`p-4 rounded-xl flex items-start space-x-3 text-sm ${
                    testResult.success
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                      : 'bg-red-50 text-red-900 border border-red-200'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-semibold block">{testResult.success ? 'Connection Successful' : 'Connection Failed'}</span>
                    <span>{testResult.message}</span>
                  </div>
                </div>
              )}

              {syncResult && (
                <div
                  className={`p-4 rounded-xl flex items-start space-x-3 text-sm ${
                    syncResult.success
                      ? 'bg-blue-50 text-blue-900 border border-blue-200'
                      : 'bg-amber-50 text-amber-900 border border-amber-200'
                  }`}
                >
                  {syncResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-semibold block">{syncResult.success ? 'Data Synchronization Complete' : 'Sync Notice'}</span>
                    <span>{syncResult.message}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Supabase SQL Editor Schema</h4>
                  <p className="text-xs text-gray-500">Run this SQL script in your Supabase SQL Editor to create required tables.</p>
                </div>
                <button
                  onClick={copySql}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 text-xs font-medium rounded-lg flex items-center space-x-1.5 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy SQL'}</span>
                </button>
              </div>

              <div className="relative">
                <pre className="p-4 bg-gray-900 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto max-h-80 leading-relaxed">
                  {sqlSchemaScript}
                </pre>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Tip:</span> Go to your <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer" className="underline text-emerald-700 font-semibold inline-flex items-center">Supabase Dashboard <ExternalLink className="w-3 h-3 ml-0.5" /></a>, open the SQL Editor, paste this script, and click Run.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-semibold rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
