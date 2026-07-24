import React from 'react';
import { Volume2, VolumeX, ShieldCheck, Database, Copy, Check, Users, Dices } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

interface NavbarProps {
  roomCode?: string;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenSetupModal: () => void;
  onLeaveRoom?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  roomCode,
  soundEnabled,
  onToggleSound,
  onOpenSetupModal,
  onLeaveRoom,
}) => {
  const [copied, setCopied] = React.useState(false);

  const copyRoomCode = () => {
    if (!roomCode) return;
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* App Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <Dices className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              Ludo <span className="text-indigo-600 font-extrabold">Live</span>
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block">Realtime Multiplayer Board Game</p>
          </div>
        </div>

        {/* Room Code Badge (if inside room) */}
        {roomCode && (
          <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full text-xs font-medium text-slate-800">
            <span className="text-slate-500 font-normal">Room:</span>
            <span className="font-mono font-bold text-indigo-700 tracking-wider">{roomCode}</span>
            <button
              onClick={copyRoomCode}
              title="Copy Room Code"
              className="p-1 hover:bg-slate-200 rounded-full transition-colors text-slate-600 hover:text-indigo-600"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Supabase Status Indicator */}
          <button
            onClick={onOpenSetupModal}
            className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all ${
              isSupabaseConfigured
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
            }`}
            title="Database & Deployment Config"
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden md:inline">
              {isSupabaseConfigured ? 'Supabase Live' : 'Local / Multi-Tab'}
            </span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
            title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Leave Room Button */}
          {roomCode && onLeaveRoom && (
            <button
              onClick={onLeaveRoom}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              Leave
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
