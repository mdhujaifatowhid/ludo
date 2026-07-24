import React, { useState } from 'react';
import { Database, Check, Copy, ExternalLink, X, ShieldAlert, Sparkles } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

interface SupabaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SQL_SCHEMA_CODE = `-- SUPABASE LUDO MULTIPLAYER DATABASE SCHEMA
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(6) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
  max_players INT DEFAULT 4 CHECK (max_players >= 2 AND max_players <= 4),
  current_turn_color VARCHAR(10) DEFAULT 'red',
  host_id VARCHAR(100) NOT NULL,
  winner_color VARCHAR(10),
  game_state JSONB NOT NULL DEFAULT '{}'::jsonb
);

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on rooms" ON public.rooms FOR SELECT USING (true);
CREATE POLICY "Allow public insert on rooms" ON public.rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on rooms" ON public.rooms FOR UPDATE USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
CREATE INDEX IF NOT EXISTS idx_rooms_code ON public.rooms (code);
`;

export const SupabaseSetupModal: React.FC<SupabaseSetupModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopySQL = () => {
    navigator.clipboard.writeText(SQL_SCHEMA_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold flex items-center gap-2">
                <span>Database & Deployment Setup</span>
                {isSupabaseConfigured ? (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Supabase Connected
                  </span>
                ) : (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Local / Multi-Tab Engine Active
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">Ready for Vercel, Supabase, and GitHub deployment</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700 text-sm">
          
          {/* Status banner */}
          <div className={`p-4 rounded-2xl border ${
            isSupabaseConfigured
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            <h4 className="font-bold flex items-center gap-1.5 mb-1 text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Current Realtime Status</span>
            </h4>
            <p className="text-xs leading-relaxed">
              {isSupabaseConfigured
                ? 'Your Supabase database is connected! Realtime WebSocket channels are actively synchronizing game rooms globally.'
                : 'App is currently running on the high-speed local multi-tab Realtime engine. To enable global remote Supabase sync for Vercel/Production deployment, run the SQL script below in your Supabase SQL Editor.'}
            </p>
          </div>

          {/* Setup Instructions */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-2">Step-by-Step Vercel & Supabase Deployment:</h4>
            <ol className="list-decimal list-inside text-xs space-y-2 text-slate-600 font-medium">
              <li>Create a free project at <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-indigo-600 underline font-bold">supabase.com</a></li>
              <li>Open your project's <strong>SQL Editor</strong> and run the schema code below.</li>
              <li>Copy your <code>SUPABASE_URL</code> and <code>SUPABASE_ANON_KEY</code> into Vercel Environment Variables:
                <ul className="list-disc list-inside ml-5 mt-1 font-mono text-[11px] text-slate-800">
                  <li><code>VITE_SUPABASE_URL</code></li>
                  <li><code>VITE_SUPABASE_ANON_KEY</code></li>
                </ul>
              </li>
            </ol>
          </div>

          {/* SQL Code Box */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                SQL Schema Script (supabase/schema.sql)
              </span>
              <button
                onClick={handleCopySQL}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied SQL!' : 'Copy SQL'}</span>
              </button>
            </div>

            <pre className="p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-2xl overflow-x-auto border border-slate-800 max-h-48 leading-relaxed">
              {SQL_SCHEMA_CODE}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors"
          >
            Close Setup Window
          </button>
        </div>
      </div>
    </div>
  );
};
