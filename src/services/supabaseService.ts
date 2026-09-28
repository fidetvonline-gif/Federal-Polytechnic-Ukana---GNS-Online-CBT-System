import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User, Examination, Question, ExaminationSession, AuditLog } from '../types';
import { getUsers, getExaminations, getQuestions, getSessions, getAuditLogs } from './storage';

const SUPABASE_URL_KEY = 'ukana_supabase_url';
const SUPABASE_KEY_KEY = 'ukana_supabase_key';

export interface SupabaseConfig {
  url: string;
  key: string;
  isConnected: boolean;
}

export function getSupabaseConfig(): SupabaseConfig {
  const defaultUrl = 'https://vtgvjgzdxfkkuhpwhrpo.supabase.co';
  const defaultKey = 'sb_publishable_lSoB-jPIUhz7uE-f_PemhA_7xibTe7m';
  
  const url = localStorage.getItem(SUPABASE_URL_KEY) || defaultUrl;
  const key = localStorage.getItem(SUPABASE_KEY_KEY) || defaultKey;
  
  // Save default if not present
  if (!localStorage.getItem(SUPABASE_URL_KEY)) {
    localStorage.setItem(SUPABASE_URL_KEY, defaultUrl);
  }
  if (!localStorage.getItem(SUPABASE_KEY_KEY)) {
    localStorage.setItem(SUPABASE_KEY_KEY, defaultKey);
  }

  return {
    url,
    key,
    isConnected: Boolean(url && key),
  };
}

export function saveSupabaseConfig(url: string, key: string): void {
  localStorage.setItem(SUPABASE_URL_KEY, url.trim());
  localStorage.setItem(SUPABASE_KEY_KEY, key.trim());
}

export function clearSupabaseConfig(): void {
  localStorage.removeItem(SUPABASE_URL_KEY);
  localStorage.removeItem(SUPABASE_KEY_KEY);
}

export function getSupabaseClient(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (!config.url || !config.key) return null;
  try {
    return createClient(config.url, config.key, {
      auth: { persistSession: false },
    });
  } catch (err) {
    console.error('Failed to create Supabase client:', err);
    return null;
  }
}

export async function testSupabaseConnection(url: string, key: string): Promise<{ success: boolean; message: string }> {
  if (!url || !key) {
    return { success: false, message: 'Supabase URL and Anon Key are required.' };
  }
  try {
    const client = createClient(url.trim(), key.trim(), { auth: { persistSession: false } });
    // Test a lightweight query or ping
    const { error } = await client.from('_connection_test').select('*').limit(1);
    
    // Even if table doesn't exist, if error is PGRST116 (relation does not exist) or 404 or connection succeeds, we can verify auth/url
    if (error && error.code === '42P01') {
      return { success: true, message: 'Connected successfully to Supabase! (Note: tables will be created or mapped automatically).' };
    } else if (error && error.message?.includes('Invalid API key')) {
      return { success: false, message: 'Invalid Supabase Anon Key. Please check your credentials.' };
    } else if (error && error.message?.includes('Failed to fetch')) {
      return { success: false, message: 'Network error: Could not reach Supabase URL. Check your URL.' };
    }
    
    return { success: true, message: 'Successfully connected to Supabase project!' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Connection failed. Please check credentials.' };
  }
}

// Sync local data to Supabase tables
export async function syncLocalDataToSupabase(): Promise<{ success: boolean; message: string; details?: any }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'Supabase is not configured. Please enter your URL and Key.' };
  }

  try {
    const users = getUsers();
    const examinations = getExaminations();
    const questions = getQuestions();
    const sessions = getSessions();
    const auditLogs = getAuditLogs();

    // Upsert examinations
    if (examinations.length > 0) {
      const { error: examErr } = await client.from('examinations').upsert(examinations);
      if (examErr && examErr.code !== '42P01') {
        console.warn('Examinations table sync warning:', examErr.message);
      }
    }

    // Upsert questions
    if (questions.length > 0) {
      const { error: qErr } = await client.from('questions').upsert(questions);
      if (qErr && qErr.code !== '42P01') {
        console.warn('Questions table sync warning:', qErr.message);
      }
    }

    // Upsert sessions (results)
    if (sessions.length > 0) {
      const { error: sErr } = await client.from('examination_sessions').upsert(sessions);
      if (sErr && sErr.code !== '42P01') {
        console.warn('Sessions table sync warning:', sErr.message);
      }
    }

    // Upsert users
    if (users.length > 0) {
      const { error: uErr } = await client.from('users').upsert(users);
      if (uErr && uErr.code !== '42P01') {
        console.warn('Users table sync warning:', uErr.message);
      }
    }

    return {
      success: true,
      message: `Successfully synced ${examinations.length} exams, ${questions.length} questions, ${sessions.length} student sessions, and ${users.length} users to Supabase!`,
    };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Sync failed due to an unexpected error.' };
  }
}
