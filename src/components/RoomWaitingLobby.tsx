import React, { useState } from 'react';
import { Copy, Check, Play, Users, Share2, Bot, Shield, Crown } from 'lucide-react';
import { RoomData, Player, PlayerColor, COLOR_HEX, COLOR_NAMES } from '../types/ludo';
import { motion } from 'motion/react';

interface RoomWaitingLobbyProps {
  room: RoomData;
  currentPlayerId: string;
  onStartGame: () => void;
  onLeaveRoom: () => void;
}

export const RoomWaitingLobby: React.FC<RoomWaitingLobbyProps> = ({
  room,
  currentPlayerId,
  onStartGame,
  onLeaveRoom,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const gameState = room.game_state;
  const players = gameState.players;
  const isHost = room.host_id === currentPlayerId;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyShareLink = () => {
    const url = `${window.location.origin}?code=${room.code}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const activeColors: PlayerColor[] =
    room.max_players === 2
      ? ['red', 'yellow']
      : room.max_players === 3
      ? ['red', 'green', 'yellow']
      : ['red', 'green', 'yellow', 'blue'];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden"
      >
        {/* Header Section */}
        <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-800 p-6 text-white text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold mb-3">
            <Users className="w-3.5 h-3.5 text-amber-300" />
            <span>Waiting Lobby ({players.length}/{room.max_players} Joined)</span>
          </div>
          <h2 className="text-xl font-extrabold mb-1">Invite Players</h2>
          <p className="text-xs text-indigo-200">Share this 6-character room code with your friends</p>

          {/* Big Room Code Box */}
          <div className="mt-4 bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold text-indigo-200 tracking-wider">Room Code</span>
              <div className="text-3xl font-mono font-black tracking-[0.25em] text-amber-300">{room.code}</div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleCopyCode}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-white text-indigo-900 hover:bg-amber-300 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied Code!' : 'Copy Code'}</span>
              </button>
              <button
                onClick={handleCopyShareLink}
                className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors text-xs"
                title="Copy Share Link"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Joined Players Grid */}
        <div className="p-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center justify-between">
            <span>Player Spots</span>
            <span>{players.length} / {room.max_players} Ready</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            {activeColors.map((color, idx) => {
              const player = players.find((p) => p.color === color);
              const colorHex = COLOR_HEX[color];
              const colorName = COLOR_NAMES[color];

              return (
                <div
                  key={color}
                  className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                    player
                      ? 'bg-slate-50 border-slate-300 shadow-2xs'
                      : 'bg-slate-50/50 border-dashed border-slate-300 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Color Avatar */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black shadow-sm"
                      style={{ backgroundColor: colorHex }}
                    >
                      {colorName.charAt(0)}
                    </div>

                    <div>
                      {player ? (
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 text-sm">{player.nickname}</span>
                          {player.isHost && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-md">
                              <Crown className="w-3 h-3 text-amber-600" /> Host
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs font-semibold text-slate-400 italic">
                          Waiting for player...
                        </span>
                      )}
                      <span className="block text-[11px] font-semibold text-slate-500 uppercase">
                        {colorName} Slot
                      </span>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div>
                    {player ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Ready
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">Open</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Host Controls */}
          {isHost ? (
            <div className="space-y-3">
              <button
                onClick={onStartGame}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold rounded-xl shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 text-base"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>Start Game Now</span>
              </button>
              {players.length < room.max_players && (
                <p className="text-center text-xs text-slate-500">
                  <Bot className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                  Starting now will fill open spots with AI Bots.
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-semibold">
              Waiting for Host ({players.find((p) => p.isHost)?.nickname || 'Host'}) to start the game...
            </div>
          )}

          <div className="mt-4 text-center">
            <button
              onClick={onLeaveRoom}
              className="text-xs font-semibold text-slate-500 hover:text-rose-600 transition-colors"
            >
              Leave Room
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
