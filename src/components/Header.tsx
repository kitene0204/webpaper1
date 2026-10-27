import React from 'react';
import { Sparkles, Plus, Database, HelpCircle, Layers } from 'lucide-react';

interface HeaderProps {
  onOpenCreateModal: () => void;
  onOpenGuideModal: () => void;
  onGoHome: () => void;
  currentBoardTitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCreateModal,
  onOpenGuideModal,
  onGoHome,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark */}
        <button
          onClick={onGoHome}
          className="flex items-center gap-2.5 text-left group transition-transform active:scale-95 whitespace-nowrap shrink-0"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-400 flex items-center justify-center text-white shadow-sm shadow-amber-500/20 group-hover:rotate-6 transition-transform">
            <span className="font-gaegu text-2xl font-bold leading-none">R!</span>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-amber-600 transition-colors">
              Rolling!
            </span>
          </div>
        </button>

        {/* Zone 2: 4 Clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <button
            onClick={onGoHome}
            className="flex items-center gap-1.5 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
          >
            <Layers className="w-4 h-4 text-slate-400" />
            <span>롤링페이퍼 둘러보기</span>
          </button>
          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>새 롤링페이퍼 만들기</span>
          </button>
          <button
            onClick={onOpenGuideModal}
            className="flex items-center gap-1.5 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
          >
            <Database className="w-4 h-4 text-emerald-600" />
            <span>구글 시트 연동 안내</span>
          </button>
          <button
            onClick={() => {
              const el = document.getElementById('how-it-works-section');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
              } else {
                onGoHome();
                setTimeout(() => {
                  document.getElementById('how-it-works-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }
            }}
            className="flex items-center gap-1.5 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
          >
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>이용 방법</span>
          </button>
        </nav>

        {/* Zone 3: 1 Primary action CTA */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm hover:shadow transition-all active:scale-95 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>방 만들기</span>
          </button>
        </div>
      </div>
    </header>
  );
};
