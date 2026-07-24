import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Medal, RotateCcw, Home, Sparkles } from 'lucide-react';
import { Player, PlayerColor, COLOR_HEX, COLOR_NAMES } from '../types/ludo';
import { motion } from 'motion/react';

interface VictoryModalProps {
  winnerOrder: PlayerColor[];
  players: Player[];
  onPlayAgain: () => void;
  onReturnToLobby: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  winnerOrder,
  players,
  onPlayAgain,
  onReturnToLobby,
}) => {
  useEffect(() => {
    // Launch celebratory confetti burst
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  const firstWinnerColor = winnerOrder[0];
  const firstWinnerPlayer = players.find((p) => p.color === firstWinnerColor);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden text-center"
      >
        {/* Banner */}
        <div className="bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 p-8 text-white relative">
          <div className="inline-flex items-center justify-center p-4 bg-white/20 rounded-full backdrop-blur-md mb-3 shadow-inner">
            <Trophy className="w-12 h-12 text-amber-100 animate-bounce" />
          </div>
          <h2 className="text-3xl font-black tracking-tight">Game Over!</h2>
          <p className="text-amber-100 font-semibold text-sm mt-1">
            🎉 {firstWinnerPlayer?.nickname || 'Winner'} claims Victory!
          </p>
        </div>

        {/* Podium Leaderboard */}
        <div className="p-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
            Final Rankings
          </h3>

          <div className="space-y-3 mb-6">
            {winnerOrder.map((color, idx) => {
              const player = players.find((p) => p.color === color);
              const rank = idx + 1;
              const colorHex = COLOR_HEX[color];

              return (
                <div
                  key={color}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                    rank === 1
                      ? 'bg-amber-50 border-amber-300 shadow-sm'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm text-white ${
                        rank === 1 ? 'bg-amber-500' : rank === 2 ? 'bg-slate-400' : 'bg-amber-700'
                      }`}
                    >
                      #{rank}
                    </div>

                    <div className="text-left">
                      <span className="font-bold text-slate-900 text-sm block">
                        {player?.nickname || color}
                      </span>
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md text-white inline-block"
                        style={{ backgroundColor: colorHex }}
                      >
                        {COLOR_NAMES[color]}
                      </span>
                    </div>
                  </div>

                  {rank === 1 && <Medal className="w-6 h-6 text-amber-500" />}
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onPlayAgain}
              className="py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Again</span>
            </button>
            <button
              onClick={onReturnToLobby}
              className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-xs border border-slate-200"
            >
              <Home className="w-4 h-4" />
              <span>Back to Lobby</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
