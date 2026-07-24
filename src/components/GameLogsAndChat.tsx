import React, { useRef, useEffect } from 'react';
import { GameLog, COLOR_HEX, PlayerColor } from '../types/ludo';
import { MessageSquare, Scroll, Send, Smile } from 'lucide-react';

interface GameLogsAndChatProps {
  logs: GameLog[];
  onSendChatMessage: (text: string) => void;
  currentPlayerName: string;
}

const EMOJI_REACTIONS = ['👏', '🔥', '🎲', '😱', '🥳', '😎', '👑', '🎉'];

export const GameLogsAndChat: React.FC<GameLogsAndChatProps> = ({
  logs,
  onSendChatMessage,
  currentPlayerName,
}) => {
  const [chatInput, setChatInput] = React.useState('');
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    onSendChatMessage(chatInput.trim());
    setChatInput('');
  };

  const handleEmojiClick = (emoji: string) => {
    onSendChatMessage(emoji);
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-md flex flex-col h-[320px] overflow-hidden">
      
      {/* Header */}
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <Scroll className="w-4 h-4 text-indigo-600" />
          <span>Game Activity & Chat</span>
        </h3>
        <span className="text-[10px] bg-slate-200 text-slate-600 font-semibold px-2 py-0.5 rounded-full">
          Live Sync
        </span>
      </div>

      {/* Logs Scroll Area */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs bg-slate-50/50">
        {logs.map((log) => {
          const colorHex = log.color ? COLOR_HEX[log.color] : undefined;

          return (
            <div
              key={log.id}
              className={`p-2 rounded-xl border text-slate-800 ${
                log.type === 'capture'
                  ? 'bg-rose-50 border-rose-200 text-rose-900 font-semibold'
                  : log.type === 'win'
                  ? 'bg-amber-50 border-amber-300 text-amber-900 font-extrabold'
                  : log.type === 'chat'
                  ? 'bg-indigo-50/80 border-indigo-200'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                {log.color && (
                  <span className="font-bold uppercase tracking-wider" style={{ color: colorHex }}>
                    {log.color}
                  </span>
                )}
                <span>{log.timestamp}</span>
              </div>
              <p className="leading-snug">{log.text}</p>
            </div>
          );
        })}
        <div ref={logEndRef} />
      </div>

      {/* Emoji Bar */}
      <div className="px-3 py-1.5 bg-slate-100 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto">
        {EMOJI_REACTIONS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => handleEmojiClick(emoji)}
            className="hover:scale-125 transition-transform text-sm p-1 rounded-md hover:bg-white"
            title={`Send ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="p-2 bg-white border-t border-slate-200 flex items-center gap-2">
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Type message or chat..."
          className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
        />
        <button
          type="submit"
          className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors shadow-xs"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
