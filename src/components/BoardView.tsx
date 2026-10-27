import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Plus,
  Share2,
  Download,
  FileSpreadsheet,
  Shield,
  ShieldCheck,
  Grid,
  Move,
  Lock,
  Clock,
  ArrowLeft,
  Eye,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { toPng } from 'html-to-image';
import confetti from 'canvas-confetti';
import { Board, Message, FontStyle } from '../types';
import { THEMES, FONTS, STICKERS } from '../constants/themes';
import {
  getMessages,
  exportBoardToCSV,
  downloadCSVFile,
  updateMessagePosition,
} from '../services/storage';
import { CreateMessageModal } from './CreateMessageModal';
import { MessageDetailModal } from './MessageDetailModal';
import { ShareModal } from './ShareModal';
import { AdminPasswordModal } from './AdminPasswordModal';

interface BoardViewProps {
  board: Board;
  onBack: () => void;
  onBoardUpdated: (updated: Board) => void;
  onBoardDeleted: () => void;
}

export const BoardView: React.FC<BoardViewProps> = ({
  board,
  onBack,
  onBoardUpdated,
  onBoardDeleted,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'free'>('grid');
  const [isHost, setIsHost] = useState(false);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  // Export state
  const [isExporting, setIsExporting] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);

  // Drag state for free view
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragElementPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // D-Day countdown state
  const [now, setNow] = useState(Date.now());
  const openTime = new Date(board.open_at).getTime();
  const isDdayLocked = openTime > now && !isHost;

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await getMessages(board.board_id);
      setMessages(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [board.board_id]);

  const theme = THEMES[board.theme_id] || THEMES.chalkboard_green;

  // D-day countdown calculation
  const diffMs = Math.max(0, openTime - now);
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  // PNG Export
  const handleExportPNG = async () => {
    if (!boardRef.current) return;
    try {
      setIsExporting(true);
      const dataUrl = await toPng(boardRef.current, {
        cacheBust: true,
        quality: 0.95,
        backgroundColor: '#ffffff',
      });
      const link = document.createElement('a');
      link.download = `Rolling_${board.target_name}_롤링페이퍼.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('PNG export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // CSV Export for Google Sheets
  const handleExportCSV = () => {
    const csv = exportBoardToCSV(board, messages);
    downloadCSVFile(csv, `Rolling_${board.target_name}_메시지목록.csv`);
  };

  // Drag handlers for free layout
  const handleMouseDown = (e: React.MouseEvent, msg: Message) => {
    if (viewMode !== 'free') return;
    setDraggingId(msg.message_id);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    dragElementPos.current = { x: msg.pos_x ?? 50, y: msg.pos_y ?? 50 };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingId || viewMode !== 'free') return;
    const deltaX = e.clientX - dragStartPos.current.x;
    const deltaY = e.clientY - dragStartPos.current.y;
    const newX = Math.max(0, dragElementPos.current.x + deltaX);
    const newY = Math.max(0, dragElementPos.current.y + deltaY);

    setMessages((prev) =>
      prev.map((m) => (m.message_id === draggingId ? { ...m, pos_x: newX, pos_y: newY } : m))
    );
  };

  const handleMouseUp = () => {
    if (draggingId) {
      const dragged = messages.find((m) => m.message_id === draggingId);
      if (dragged && dragged.pos_x !== undefined && dragged.pos_y !== undefined) {
        updateMessagePosition(draggingId, dragged.pos_x, dragged.pos_y);
      }
      setDraggingId(null);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#F4F6F8] pb-24"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Top sticky navigation and action bar */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Left: Back & Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">목록으로</span>
            </button>
            <div className="h-5 w-px bg-slate-200 hidden sm:block" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                  To. {board.target_name}
                </span>
                {board.is_locked && (
                  <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> 마감됨
                  </span>
                )}
                {isHost && (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> 방장 모드
                  </span>
                )}
              </div>
              <h1 className="text-sm sm:text-base font-extrabold text-slate-900 truncate max-w-xs sm:max-w-md mt-0.5">
                {board.title}
              </h1>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-2.5 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="정렬된 그리드 보기"
              >
                <Grid className="w-3.5 h-3.5" />
                <span>격자 뷰</span>
              </button>
              <button
                onClick={() => setViewMode('free')}
                className={`px-2.5 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                  viewMode === 'free'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="자유 배치 드래그 보기"
              >
                <Move className="w-3.5 h-3.5" />
                <span>자유 배치</span>
              </button>
            </div>

            {/* Export PNG */}
            <button
              onClick={handleExportPNG}
              disabled={isExporting}
              className="p-2 sm:px-3 sm:py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
              title="롤링페이퍼 이미지(PNG) 다운로드"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span className="hidden md:inline">{isExporting ? '저장 중...' : '이미지 저장'}</span>
            </button>

            {/* Export CSV */}
            <button
              onClick={handleExportCSV}
              className="p-2 sm:px-3 sm:py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="구글 시트 / Excel용 CSV 내보내기"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span className="hidden lg:inline">시트 내보내기</span>
            </button>

            {/* Share */}
            <button
              onClick={() => setIsShareOpen(true)}
              className="p-2 sm:px-3 sm:py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Share2 className="w-4 h-4 text-amber-600" />
              <span className="hidden sm:inline">공유</span>
            </button>

            {/* Host Mode */}
            <button
              onClick={() => setIsAdminOpen(true)}
              className={`p-2 sm:px-3 sm:py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs ${
                isHost
                  ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {isHost ? <ShieldCheck className="w-4 h-4 text-amber-700" /> : <Shield className="w-4 h-4 text-slate-500" />}
              <span className="hidden sm:inline">{isHost ? '방장 관리' : '관리자'}</span>
            </button>

            {/* Primary Action: Add Message */}
            <button
              onClick={() => {
                if (board.is_locked && !isHost) {
                  alert('이 롤링페이퍼는 작성이 마감되었습니다.');
                  return;
                }
                setIsCreateOpen(true);
              }}
              disabled={board.is_locked && !isHost}
              className="px-3.5 py-1.5 text-xs sm:text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg transition-all active:scale-95 flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              <span>포스트잇 붙이기</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Board Container */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-6">
        {/* D-Day Lock Banner (if sealed) */}
        {isDdayLocked && (
          <div className="mb-6 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600 text-white shadow-xl text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10" />
            <div className="relative z-10 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold mb-3">
                <Lock className="w-3.5 h-3.5" />
                <span>D-Day 비밀 보관함 (지정일 개봉)</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight mb-2">
                {board.target_name}님을 위한 메시지가 도착하고 있어요!
              </h2>
              <p className="text-sm opacity-90 mb-5">
                약속된 D-Day 전까지는 본문이 공개되지 않는 서프라이즈 롤링페이퍼입니다.
              </p>

              {/* Countdown Clock */}
              <div className="flex items-center justify-center gap-2 sm:gap-4 font-mono font-bold text-slate-900 mb-4">
                <div className="bg-white/95 rounded-xl px-3 py-2 min-w-16 shadow-md">
                  <div className="text-xl sm:text-2xl">{days}</div>
                  <div className="text-[10px] text-slate-500 font-sans">DAYS</div>
                </div>
                <span className="text-white text-xl">:</span>
                <div className="bg-white/95 rounded-xl px-3 py-2 min-w-16 shadow-md">
                  <div className="text-xl sm:text-2xl">{hours.toString().padStart(2, '0')}</div>
                  <div className="text-[10px] text-slate-500 font-sans">HOURS</div>
                </div>
                <span className="text-white text-xl">:</span>
                <div className="bg-white/95 rounded-xl px-3 py-2 min-w-16 shadow-md">
                  <div className="text-xl sm:text-2xl">{minutes.toString().padStart(2, '0')}</div>
                  <div className="text-[10px] text-slate-500 font-sans">MINS</div>
                </div>
                <span className="text-white text-xl">:</span>
                <div className="bg-white/95 rounded-xl px-3 py-2 min-w-16 shadow-md">
                  <div className="text-xl sm:text-2xl">{seconds.toString().padStart(2, '0')}</div>
                  <div className="text-[10px] text-slate-500 font-sans">SECS</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
                <span className="bg-black/20 px-3 py-1.5 rounded-lg">
                  현재 도착한 마음: <strong className="text-amber-200">{messages.length}개</strong>
                </span>
                <button
                  onClick={() => setIsAdminOpen(true)}
                  className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>방장 비밀번호로 미리보기</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* The Rolling Paper Canvas */}
        <div
          ref={boardRef}
          className={`relative rounded-2xl shadow-xl transition-all overflow-hidden ${
            theme.frameStyle === 'wood'
              ? 'border-12 border-[#8A5A36] shadow-2xl'
              : theme.frameStyle === 'gold'
              ? 'border-8 border-amber-600/80 shadow-2xl'
              : 'border border-slate-300/80 shadow-lg'
          } ${theme.boardBgClass}`}
          style={{ minHeight: '680px' }}
        >
          {/* Board Title Plaque */}
          <div className="pt-8 pb-4 px-6 text-center select-none">
            <div className="inline-block px-4 py-1.5 rounded-full bg-black/10 backdrop-blur-xs mb-2 border border-black/5">
              <span className={`text-xs font-bold tracking-wider ${theme.textColorClass}`}>
                To. {board.target_name}
              </span>
            </div>
            <h2
              className={`text-xl sm:text-3xl font-extrabold tracking-tight ${theme.textColorClass} ${
                theme.id === 'chalkboard_green' ? 'chalk-text' : ''
              }`}
            >
              {board.title}
            </h2>
            <div className="flex items-center justify-center gap-2 mt-2 text-xs opacity-75">
              <span>{messages.length}개의 메시지</span>
              <span>·</span>
              <span>
                {new Date(board.created_at).toLocaleDateString('ko-KR', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>

          {/* Empty State */}
          {messages.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-24 text-center px-4">
              <div className="w-16 h-16 rounded-2xl bg-white/40 backdrop-blur-xs flex items-center justify-center text-3xl mb-3 shadow-xs">
                📝
              </div>
              <p className="text-base font-bold mb-1 opacity-90">아직 등록된 메시지가 없습니다</p>
              <p className="text-xs opacity-70 mb-5 max-w-xs">
                첫 번째 포스트잇을 작성하여 {board.target_name}님에게 따뜻한 마음을 전해보세요!
              </p>
              <button
                onClick={() => setIsCreateOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                + 첫 번째 포스트잇 작성하기
              </button>
            </div>
          )}

          {/* Messages: Grid View */}
          {viewMode === 'grid' && messages.length > 0 && (
            <div className="p-4 sm:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {messages.map((msg) => {
                const font = FONTS.find((f) => f.id === msg.font_style) || FONTS[0];
                const sticker = STICKERS.find((s) => s.id === msg.sticker_id) || STICKERS[0];
                const isMasked = isDdayLocked;

                return (
                  <div
                    key={msg.message_id}
                    onClick={() => {
                      if (!isMasked) setSelectedMessage(msg);
                    }}
                    style={{
                      backgroundColor: msg.card_color,
                      transform: `rotate(${msg.rotation ?? 0}deg)`,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.06)',
                    }}
                    className={`relative p-5 rounded-xs transition-all duration-200 hover:scale-102 hover:z-10 group select-none ${
                      isMasked ? 'cursor-default' : 'cursor-pointer'
                    } ${font.cssClass}`}
                  >
                    {/* Top Masking Tape */}
                    <div
                      className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-5 masking-tape rounded-xs opacity-85 border border-white/50"
                      style={{ transform: `translateX(-50%) rotate(${-(msg.rotation ?? 0)}deg)` }}
                    />

                    {/* Sticker */}
                    <div className="absolute top-2.5 right-2.5 text-2xl filter drop-shadow-xs group-hover:scale-115 transition-transform">
                      {sticker.emoji}
                    </div>

                    {/* Author */}
                    <div className="text-xs font-bold text-slate-800 mb-2 truncate pr-7">
                      From. {msg.author}
                    </div>

                    {/* Content or D-Day Locked Mask */}
                    {isMasked ? (
                      <div className="py-6 text-center text-slate-600 space-y-1">
                        <Lock className="w-5 h-5 mx-auto text-amber-600 mb-1" />
                        <p className="text-xs font-bold text-slate-800">D-Day 개봉 예정</p>
                        <p className="text-[11px] opacity-70">비밀 편지가 소중히 보관 중입니다</p>
                      </div>
                    ) : (
                      <p className="text-sm sm:text-base leading-relaxed text-slate-900 break-words whitespace-pre-wrap line-clamp-6 min-h-20">
                        {msg.content}
                      </p>
                    )}

                    {/* Card Footer */}
                    <div className="mt-3 pt-2 border-t border-black/5 flex items-center justify-between text-[11px] text-slate-600 opacity-75">
                      <span>{new Date(msg.created_at).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })}</span>
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity font-sans text-[10px] text-slate-500">
                        클릭하여 확대
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Messages: Free Drag Layout View */}
          {viewMode === 'free' && messages.length > 0 && (
            <div
              className="relative p-6 select-none"
              style={{ minHeight: '800px', height: '1000px', width: '100%' }}
            >
              <div className="absolute top-2 left-6 text-xs bg-black/20 text-white px-3 py-1 rounded-full backdrop-blur-xs pointer-events-none">
                💡 포스트잇을 마우스나 터치로 원하는 위치에 드래그하여 배치해보세요!
              </div>

              {messages.map((msg, idx) => {
                const font = FONTS.find((f) => f.id === msg.font_style) || FONTS[0];
                const sticker = STICKERS.find((s) => s.id === msg.sticker_id) || STICKERS[0];
                const posX = msg.pos_x ?? (idx % 4) * 260 + 20;
                const posY = msg.pos_y ?? Math.floor(idx / 4) * 260 + 50;
                const isMasked = isDdayLocked;

                return (
                  <div
                    key={msg.message_id}
                    onMouseDown={(e) => handleMouseDown(e, msg)}
                    onClick={() => {
                      if (!isMasked && !draggingId) setSelectedMessage(msg);
                    }}
                    style={{
                      left: `${posX}px`,
                      top: `${posY}px`,
                      backgroundColor: msg.card_color,
                      transform: `rotate(${msg.rotation ?? 0}deg)`,
                      boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                    }}
                    className={`absolute w-60 sm:w-64 p-4 rounded-xs transition-shadow cursor-grab active:cursor-grabbing hover:z-20 ${
                      draggingId === msg.message_id ? 'z-30 scale-105 shadow-2xl ring-2 ring-amber-400' : ''
                    } ${font.cssClass}`}
                  >
                    {/* Masking Tape */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-5 masking-tape rounded-xs opacity-90 border border-white/40" />

                    {/* Sticker */}
                    <div className="absolute top-2 right-2 text-2xl select-none">{sticker.emoji}</div>

                    <div className="text-xs font-bold text-slate-800 mb-1.5 truncate pr-6">
                      From. {msg.author}
                    </div>

                    {isMasked ? (
                      <div className="py-4 text-center text-slate-600">
                        <Lock className="w-4 h-4 mx-auto text-amber-600 mb-1" />
                        <p className="text-xs font-bold">D-Day 봉인 중</p>
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed text-slate-900 break-words whitespace-pre-wrap line-clamp-5 min-h-16">
                        {msg.content}
                      </p>
                    )}

                    <div className="mt-2 pt-1 border-t border-black/5 text-[10px] text-slate-500 flex justify-between">
                      <span>{new Date(msg.created_at).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })}</span>
                      <span>자유배치</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-6 right-6 z-30 sm:hidden">
        <button
          onClick={() => {
            if (board.is_locked && !isHost) {
              alert('작성이 마감된 롤링페이퍼입니다.');
              return;
            }
            setIsCreateOpen(true);
          }}
          className="w-14 h-14 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-2xl hover:bg-slate-800 active:scale-95 cursor-pointer border-2 border-amber-300"
          title="포스트잇 작성하기"
        >
          <Plus className="w-7 h-7 text-amber-300" />
        </button>
      </div>

      {/* Modals */}
      <CreateMessageModal
        board={board}
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onMessageCreated={(newMsg) => {
          setMessages((prev) => [newMsg, ...prev]);
          setIsCreateOpen(false);
        }}
      />

      <MessageDetailModal
        board={board}
        message={selectedMessage}
        isOpen={!!selectedMessage}
        isHost={isHost}
        onClose={() => setSelectedMessage(null)}
        onMessageDeleted={(id) => {
          setMessages((prev) => prev.filter((m) => m.message_id !== id));
          setSelectedMessage(null);
        }}
      />

      <ShareModal
        board={board}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />

      <AdminPasswordModal
        board={board}
        isOpen={isAdminOpen}
        isHost={isHost}
        onClose={() => setIsAdminOpen(false)}
        onHostAuthenticated={() => {
          setIsHost(true);
          setIsAdminOpen(false);
          confetti({ particleCount: 40, spread: 50 });
        }}
        onBoardUpdated={(updated) => {
          onBoardUpdated(updated);
        }}
        onBoardDeleted={() => {
          onBoardDeleted();
        }}
      />
    </div>
  );
};
