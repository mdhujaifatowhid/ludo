import React, { useState, useEffect } from 'react';
import { Users, Plus, ArrowRight, Dices, Sparkles, User, Shield, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface LobbyProps {
  onCreateRoom: (nickname: string, maxPlayers: number) => void;
  onJoinRoom: (nickname: string, roomCode: string) => void;
  isSubmitting?: boolean;
  errorMessage?: string;
}

export const Lobby: React.FC<LobbyProps> = ({
  onCreateRoom,
  onJoinRoom,
  isSubmitting = false,
  errorMessage = '',
}) => {
  const [nickname, setNickname] = useState(() => localStorage.getItem('ludo_nickname') || '');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [maxPlayers, setMaxPlayers] = useState<number>(4);
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (nickname.trim()) {
      localStorage.setItem('ludo_nickname', nickname.trim());
    }
  }, [nickname]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setLocalError('Please enter a nickname first!');
      return;
    }
    setLocalError('');
    onCreateRoom(nickname.trim(), maxPlayers);
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setLocalError('Please enter a nickname first!');
      return;
    }
    if (!roomCodeInput.trim() || roomCodeInput.trim().length !== 6) {
      setLocalError('Please enter a valid 6-character room code.');
      return;
    }
    setLocalError('');
    onJoinRoom(nickname.trim(), roomCodeInput.trim().toUpperCase());
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden"
      >
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 px-6 py-8 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.15),transparent)] pointer-events-none" />
          <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-2xl backdrop-blur-xs mb-3 shadow-inner">
            <Dices className="w-8 h-8 text-amber-300" />
          </div>
          <h2 className="text-2xl font-black tracking-tight">Play Ludo Online</h2>
          <p className="text-indigo-100 text-sm mt-1">Realtime multiplayer with friends & family</p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8">
          
          {/* Nickname Input */}
          <div className="mb-6">
            <label htmlFor="nickname-input" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Your Nickname
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                id="nickname-input"
                type="text"
                maxLength={18}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="e.g. MasterDice, Alex, Champ"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">No signup required. Enter any nickname to play instantly!</p>
          </div>

          {/* Error Banner */}
          {(errorMessage || localError) && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {errorMessage || localError}
            </div>
          )}

          {/* Tab Selector */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl mb-6 border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('create')}
              className={`py-2.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'create'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Plus className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
              Create Room
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('join')}
              className={`py-2.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'join'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
              Join Room
            </button>
          </div>

          {/* Create Room Tab */}
          {activeTab === 'create' && (
            <form onSubmit={handleCreateSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Number of Players
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[2, 3, 4].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setMaxPlayers(num)}
                      className={`py-3 rounded-xl border text-center transition-all ${
                        maxPlayers === num
                          ? 'border-indigo-600 bg-indigo-50/80 text-indigo-800 font-extrabold ring-2 ring-indigo-500/20'
                          : 'border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-lg">{num}</div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider font-normal">
                        Players
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Creating Room...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Create Room & Get Code</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Join Room Tab */}
          {activeTab === 'join' && (
            <form onSubmit={handleJoinSubmit} className="space-y-6">
              <div>
                <label htmlFor="room-code-input" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  6-Character Room Code
                </label>
                <input
                  id="room-code-input"
                  type="text"
                  maxLength={6}
                  value={roomCodeInput}
                  onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                  placeholder="e.g. X7K2M9"
                  className="w-full text-center tracking-[0.3em] font-mono font-black text-2xl py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all uppercase"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Joining Room...</span>
                ) : (
                  <>
                    <Users className="w-4 h-4" />
                    <span>Join Game Room</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer Features */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-around text-slate-600 text-xs">
          <div className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Standard Rules</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Dices className="w-4 h-4 text-indigo-600" />
            <span>Realtime Sync</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
