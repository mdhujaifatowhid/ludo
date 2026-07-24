import React from 'react';
import { PlayerColor, COLOR_HEX, COLOR_NAMES } from '../types/ludo';
import { Dices, Sparkles, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DiceComponentProps {
  currentTurn: PlayerColor;
  turnPlayerName: string;
  diceValue: number | null;
  isRolling: boolean;
  canRoll: boolean;
  onRoll: () => void;
  validMovesCount: number;
}

export const DiceComponent: React.FC<DiceComponentProps> = ({
  currentTurn,
  turnPlayerName,
  diceValue,
  isRolling,
  canRoll,
  onRoll,
  validMovesCount,
}) => {
  const colorHex = COLOR_HEX[currentTurn];
  const colorName = COLOR_NAMES[currentTurn];

  // Dice dots mapping
  const renderDiceDots = (num: number) => {
    const dotClasses: Record<number, string[]> = {
      1: ['col-start-2 row-start-2'],
      2: ['col-start-1 row-start-1', 'col-start-3 row-start-3'],
      3: ['col-start-1 row-start-1', 'col-start-2 row-start-2', 'col-start-3 row-start-3'],
      4: [
        'col-start-1 row-start-1',
        'col-start-3 row-start-1',
        'col-start-1 row-start-3',
        'col-start-3 row-start-3',
      ],
      5: [
        'col-start-1 row-start-1',
        'col-start-3 row-start-1',
        'col-start-2 row-start-2',
        'col-start-1 row-start-3',
        'col-start-3 row-start-3',
      ],
      6: [
        'col-start-1 row-start-1',
        'col-start-3 row-start-1',
        'col-start-1 row-start-2',
        'col-start-3 row-start-2',
        'col-start-1 row-start-3',
        'col-start-3 row-start-3',
      ],
    };

    const activeDots = dotClasses[num] || [];

    return (
      <div className="w-14 h-14 bg-white rounded-2xl border-2 border-slate-300 p-2.5 grid grid-cols-3 grid-rows-3 gap-1 shadow-md">
        {activeDots.map((pos, idx) => (
          <span
            key={idx}
            className={`w-2.5 h-2.5 rounded-full bg-slate-900 justify-self-center self-center ${pos}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-md p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
      
      {/* Player Turn Indicator */}
      <div className="flex items-center gap-3.5 w-full sm:w-auto">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-md shrink-0"
          style={{ backgroundColor: colorHex }}
        >
          {colorName.charAt(0)}
        </div>
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Current Turn
          </span>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5">
            <span>{turnPlayerName}</span>
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-md text-white"
              style={{ backgroundColor: colorHex }}
            >
              {colorName}
            </span>
          </h3>
        </div>
      </div>

      {/* Dice Animation & Value Box */}
      <div className="flex items-center gap-4">
        <motion.div
          animate={isRolling ? { rotate: [0, 90, 180, 270, 360], scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.4, repeat: isRolling ? Infinity : 0 }}
          className="shrink-0"
        >
          {diceValue ? (
            renderDiceDots(diceValue)
          ) : (
            <div className="w-14 h-14 bg-slate-100 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400">
              <Dices className="w-7 h-7" />
            </div>
          )}
        </motion.div>

        {/* Roll Action Button */}
        <div className="flex flex-col gap-1">
          <button
            onClick={onRoll}
            disabled={!canRoll || isRolling}
            className={`px-6 py-3 rounded-xl font-bold text-sm shadow-md transition-all flex items-center gap-2 ${
              canRoll
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white hover:shadow-indigo-500/20 active:scale-95 cursor-pointer'
                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-80'
            }`}
          >
            <Dices className="w-4 h-4" />
            <span>{isRolling ? 'Rolling...' : 'Roll Dice'}</span>
          </button>

          {/* Moves Available Helper */}
          {diceValue !== null && !isRolling && (
            <span className="text-[11px] font-semibold text-center text-slate-500">
              {validMovesCount > 0 ? (
                <span className="text-indigo-600 font-bold">
                  {validMovesCount} valid {validMovesCount === 1 ? 'move' : 'moves'}!
                </span>
              ) : (
                <span className="text-amber-600">No moves available</span>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
