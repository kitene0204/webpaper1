import React, { useState } from 'react';
import { Sparkles, Plus, Database, Heart, Calendar, Image, Share2, Shield, CheckCircle2, ChevronRight } from 'lucide-react';
import { Board, BoardCategory } from '../types';
import { CATEGORIES } from '../constants/themes';
import { BoardCard } from './BoardCard';

interface HomeViewProps {
  boards: Board[];
  messageCounts: Record<string, number>;
  onSelectBoard: (board: Board) => void;
  onOpenCreateModal: () => void;
  onOpenGuideModal: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  boards,
  messageCounts,
  onSelectBoard,
  onOpenCreateModal,
  onOpenGuideModal,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | BoardCategory>('all');

  const filteredBoards =
    selectedCategory === 'all'
      ? boards
      : boards.filter((b) => b.category === selectedCategory);

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative pt-12 pb-8 sm:pt-16 sm:pb-12 text-center max-w-4xl mx-auto px-4">
        {/* Subtle decorative floating post-it badges */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-bold mb-6 shadow-xs animate-in fade-in duration-500">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>별도 회원가입 없이 링크 하나로 마음을 모으는 서비스</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight sm:leading-tight mb-5">
          소중한 추억을 한 장에 담는 <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-rose-500 to-amber-600">
            온라인 롤링페이퍼, Rolling!
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8">
          교생실습 감사 인사, 친구의 생일 파티, 졸업과 전학까지.<br className="hidden sm:inline" />
          오프라인 롤링페이퍼의 아날로그 감성과 손글씨를 디지털로 쉽고 빠르게 전하세요.
        </p>

        {/* Primary CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <button
            onClick={onOpenCreateModal}
            className="px-6 py-3.5 rounded-xl bg-slate-900 text-white font-bold text-sm sm:text-base hover:bg-slate-800 transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-5 h-5 text-amber-300" />
            <span>롤링페이퍼 만들기</span>
          </button>
          <button
            onClick={onOpenGuideModal}
            className="px-5 py-3.5 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold text-sm sm:text-base hover:bg-slate-50 transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Database className="w-5 h-5 text-emerald-600" />
            <span>구글 시트 연동 살펴보기</span>
          </button>
        </div>

        {/* Value metric banner */}
        <div className="mt-12 pt-8 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-3">
            <div className="text-2xl font-black text-slate-900">0초</div>
            <div className="text-xs text-slate-500 mt-0.5">회원가입 불필요 (비회원)</div>
          </div>
          <div className="p-3">
            <div className="text-2xl font-black text-slate-900">5대 기념일</div>
            <div className="text-xs text-slate-500 mt-0.5">교생·생일·졸업·전학·자유</div>
          </div>
          <div className="p-3">
            <div className="text-2xl font-black text-slate-900">D-Day</div>
            <div className="text-xs text-slate-500 mt-0.5">서프라이즈 비밀 공개 타이머</div>
          </div>
          <div className="p-3">
            <div className="text-2xl font-black text-emerald-600">Google Sheets</div>
            <div className="text-xs text-slate-500 mt-0.5">구글 스프레드시트 연동 지원</div>
          </div>
        </div>
      </section>

      {/* Boards Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">진행 중인 롤링페이퍼</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              둘러보며 다른 사람들의 따뜻한 축하와 감사의 마음을 확인해보세요
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              전체 보기 ({boards.length})
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.name.split('/')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Board Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBoards.map((board) => (
            <BoardCard
              key={board.board_id}
              board={board}
              messageCount={messageCounts[board.board_id] || 0}
              onClick={() => onSelectBoard(board)}
            />
          ))}

          {/* Quick Create Card */}
          <div
            onClick={onOpenCreateModal}
            className="rounded-2xl border-2 border-dashed border-slate-300 hover:border-amber-400 bg-white/60 hover:bg-amber-50/40 p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 min-h-64 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform mb-3">
              <Plus className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
              새로운 롤링페이퍼 시작하기
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
              기념일을 선택하고 단 10초 만에 공유 링크를 발급받으세요
            </p>
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section id="how-it-works-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-xs">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold text-amber-600 tracking-wider">USER FLOW</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Rolling! 이용 방법
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              방장, 작성자, 주인공 모두에게 가장 편리하고 감동적인 경험을 선사합니다
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 relative">
              <span className="w-7 h-7 rounded-full bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center mb-3">
                1
              </span>
              <h3 className="text-base font-bold text-slate-900 mb-1">방 만들기</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                생일, 교생실습, 졸업 등 카테고리를 고르고 칠판/크림/노을 테마와 D-Day 공개일을 설정합니다.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 relative">
              <span className="w-7 h-7 rounded-full bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center mb-3">
                2
              </span>
              <h3 className="text-base font-bold text-slate-900 mb-1">링크 공유하기</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                발급된 고유 URL이나 카카오톡 맞춤 메시지, QR 코드로 단톡방과 친구들에게 손쉽게 공유합니다.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 relative">
              <span className="w-7 h-7 rounded-full bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center mb-3">
                3
              </span>
              <h3 className="text-base font-bold text-slate-900 mb-1">포스트잇 작성</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                비회원으로 바로 접속하여 나눔손글씨 폰트와 감성 스티커, 포스트잇 색상을 선택해 작성합니다.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 relative">
              <span className="w-7 h-7 rounded-full bg-amber-500 text-white font-extrabold text-xs flex items-center justify-center mb-3">
                4
              </span>
              <h3 className="text-base font-bold text-slate-900 mb-1">개봉 &amp; 이미지 소장</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                D-Day 카운트다운 후 폭죽과 함께 개봉! 완성된 보드를 고해상도 PNG 이미지로 평생 소장하세요.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Google Sheets feature callout section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
              <Database className="w-3.5 h-3.5" />
              <span>Google Sheets Database Integration</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold leading-snug">
              내 구글 스프레드시트에 <br />
              실시간으로 메시지를 저장하고 관리하세요
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
              Google Apps Script(GAS)를 통해 구글 시트 1개 파일의 Boards, Messages 탭과 연동됩니다.
              동시성 락(LockService) 제어 코드가 모두 준비되어 있어 30초 만에 연동할 수 있습니다.
            </p>
          </div>
          <div className="shrink-0 flex flex-col sm:flex-row gap-3">
            <button
              onClick={onOpenGuideModal}
              className="px-6 py-3 rounded-xl bg-white text-slate-900 hover:bg-emerald-50 font-bold text-xs sm:text-sm transition-colors shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <Database className="w-4 h-4 text-emerald-600" />
              <span>연동 가이드 및 코드 복사</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
