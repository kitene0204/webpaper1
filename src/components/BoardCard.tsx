import React from 'react';
import { Calendar, MessageSquare, Lock, ArrowUpRight } from 'lucide-react';
import { Board } from '../types';
import { THEMES, CATEGORIES } from '../constants/themes';

interface BoardCardProps {
  board: Board;
  messageCount: number;
  onClick: () => void;
}

export const BoardCard: React.FC<BoardCardProps> = ({ board, messageCount, onClick }) => {
  const theme = THEMES[board.theme_id] || THEMES.chalkboard_green;
  const category = CATEGORIES.find((c) => c.id === board.category) || CATEGORIES[0];

  const openTime = new Date(board.open_at).getTime();
  const isDday = openTime > Date.now();

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-lg transition-all duration-200 hover:-translate-y-1 overflow-hidden cursor-pointer flex flex-col group"
    >
      {/* Theme banner preview */}
      <div className={`h-28 w-full p-4 relative flex flex-col justify-between overflow-hidden border-b border-black/5 ${theme.boardBgClass}`}>
        {/* Subtle decorative tape on top right */}
        <div className="absolute top-2 right-3 w-12 h-4 masking-tape rounded-xs opacity-75 border border-white/40 rotate-6" />

        <div className="flex items-center justify-between z-10">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/15 backdrop-blur-xs text-[11px] font-bold text-white">
            <span>{category.emoji}</span>
            <span>{category.name}</span>
          </span>

          {isDday ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/90 text-white text-[10px] font-extrabold shadow-xs">
              <Lock className="w-2.5 h-2.5" />
              <span>D-Day 봉인</span>
            </span>
          ) : board.is_locked ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/90 text-white text-[10px] font-extrabold">
              마감됨
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-600/90 text-white text-[10px] font-extrabold">
              작성 중
            </span>
          )}
        </div>

        <div className="z-10">
          <span className={`text-xs font-extrabold opacity-90 ${theme.textColorClass}`}>
            To. {board.target_name}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-2 leading-snug">
            {board.title}
          </h3>
          {board.description && (
            <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
              {board.description}
            </p>
          )}
        </div>

        {/* Card Footer */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5 font-medium">
            <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-slate-800 font-bold">{messageCount}개</span>
            <span className="text-slate-400">메시지</span>
          </div>

          <div className="flex items-center gap-1 text-slate-400 group-hover:text-amber-600 font-medium transition-colors text-xs">
            <span>열람하기</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
