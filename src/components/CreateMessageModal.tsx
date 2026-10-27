import React, { useState } from 'react';
import { X, Sparkles, Send, Lock, User, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { FONTS, POSTIT_COLORS, STICKERS } from '../constants/themes';
import { Board, FontStyle, Message } from '../types';
import { createMessage } from '../services/storage';

interface CreateMessageModalProps {
  board: Board;
  isOpen: boolean;
  onClose: () => void;
  onMessageCreated: (msg: Message) => void;
}

export const CreateMessageModal: React.FC<CreateMessageModalProps> = ({
  board,
  isOpen,
  onClose,
  onMessageCreated,
}) => {
  const [author, setAuthor] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [content, setContent] = useState('');
  const [cardColor, setCardColor] = useState(POSTIT_COLORS[0].id);
  const [fontStyle, setFontStyle] = useState<FontStyle>('NanumPen');
  const [stickerId, setStickerId] = useState('heart');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const currentFont = FONTS.find((f) => f.id === fontStyle) || FONTS[0];
  const currentSticker = STICKERS.find((s) => s.id === stickerId) || STICKERS[0];
  const currentColor = POSTIT_COLORS.find((c) => c.id === cardColor) || POSTIT_COLORS[0];

  // Prioritize stickers matching board category
  const sortedStickers = [...STICKERS].sort((a, b) => {
    if (a.category === board.category && b.category !== board.category) return -1;
    if (b.category === board.category && a.category !== board.category) return 1;
    return 0;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const finalAuthor = isAnonymous ? '익명의 친구' : author.trim();
    if (!isAnonymous && !author.trim()) {
      setErrorMsg('작성자 닉네임을 입력하거나 익명 체크를 선택해주세요.');
      return;
    }
    if (!content.trim()) {
      setErrorMsg('전하고 싶은 메시지 내용을 작성해주세요.');
      return;
    }
    if (!password || password.length !== 4 || !/^\d{4}$/.test(password)) {
      setErrorMsg('나중에 글을 삭제할 때 필요한 4자리 숫자를 입력해주세요.');
      return;
    }

    try {
      setSubmitting(true);
      const created = await createMessage(
        {
          board_id: board.board_id,
          author: finalAuthor,
          is_anonymous: isAnonymous,
          content: content.trim(),
          card_color: cardColor,
          font_style: fontStyle,
          sticker_id: stickerId,
          password,
        },
        board.gas_url
      );

      // Fire festive celebratory confetti
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });

      onMessageCreated(created);
    } catch {
      setErrorMsg('메시지 등록에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[94vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
              ✍️
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {board.target_name}님에게 메시지 남기기
              </h2>
              <p className="text-xs text-slate-500">포스트잇에 따뜻한 마음을 담아 붙여보세요</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {errorMsg}
            </div>
          )}

          {/* Live Preview Box */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-700">포스트잇 실시간 미리보기</span>
              <span className="text-[11px] text-slate-400">보드에 부착될 실제 모습</span>
            </div>
            <div className="p-4 sm:p-6 bg-slate-100/70 rounded-xl flex items-center justify-center border border-slate-200">
              <div
                className={`relative w-64 sm:w-72 min-h-48 p-4 rounded-sm shadow-md transition-all ${currentFont.cssClass}`}
                style={{
                  backgroundColor: currentColor.id,
                  boxShadow: '0 4px 14px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.08)',
                }}
              >
                {/* Masking tape on top */}
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-5 masking-tape rounded-xs opacity-90 border border-white/40"
                  style={{ transform: 'translateX(-50%) rotate(-1deg)' }}
                />

                {/* Sticker */}
                <div className="absolute top-2 right-2 text-2xl select-none filter drop-shadow-xs">
                  {currentSticker.emoji}
                </div>

                {/* Note Author */}
                <div className="text-xs font-bold text-slate-700 mb-2 truncate pr-8">
                  From. {isAnonymous ? '익명의 친구' : author.trim() || '(작성자 이름)'}
                </div>

                {/* Note Content */}
                <p className="text-sm sm:text-base leading-relaxed break-words whitespace-pre-wrap text-slate-800 min-h-24">
                  {content.trim() || '여기에 따뜻하고 감동적인 한마디를 적어주세요...'}
                </p>

                {/* Bottom decorative stamp */}
                <div className="mt-3 pt-1 border-t border-black/5 flex items-center justify-between text-[11px] text-slate-500 opacity-80">
                  <span>To. {board.target_name}</span>
                  <span>Rolling!</span>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Author Name & Anonymous toggle */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-800">
                  작성자 닉네임 <span className="text-rose-500">*</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded text-amber-500 focus:ring-amber-400"
                  />
                  <span className="font-medium">익명으로 남기기</span>
                </label>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  disabled={isAnonymous}
                  placeholder={isAnonymous ? '익명의 친구로 표시됩니다' : '예: 2반 반장 민우, 동기 수연'}
                  maxLength={20}
                  className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 disabled:bg-slate-100 disabled:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* Content Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-800">
                  메시지 본문 <span className="text-rose-500">*</span>
                </label>
                <span className={`text-[11px] ${content.length > 450 ? 'text-rose-500 font-bold' : 'text-slate-400'}`}>
                  {content.length} / 500자
                </span>
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="마음을 담은 따뜻한 글을 남겨주세요 (최대 500자)"
                maxLength={500}
                rows={4}
                required
                className={`w-full p-3 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 resize-none ${currentFont.cssClass}`}
              />
            </div>

            {/* Color Palette */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                포스트잇 배경색
              </label>
              <div className="flex flex-wrap gap-2">
                {POSTIT_COLORS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCardColor(c.id)}
                    className={`w-8 h-8 rounded-full border-2 transition-transform cursor-pointer flex items-center justify-center ${
                      cardColor === c.id ? 'scale-110 shadow-md ring-2 ring-slate-800' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: c.id, borderColor: c.border }}
                    title={c.name}
                  >
                    {cardColor === c.id && <Check className="w-3.5 h-3.5 text-slate-800" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                글씨체 (폰트)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {FONTS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFontStyle(f.id)}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      fontStyle === f.id
                        ? 'border-amber-500 bg-amber-50/50 ring-1 ring-amber-400'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-900">{f.name}</div>
                    <div className={`text-sm text-slate-600 mt-1 truncate ${f.cssClass}`}>
                      {f.sample}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Sticker Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                감정 / 축하 스티커
              </label>
              <div className="grid grid-cols-6 sm:grid-cols-10 gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-200">
                {sortedStickers.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStickerId(s.id)}
                    className={`p-2 rounded-lg text-xl sm:text-2xl transition-transform hover:scale-125 cursor-pointer flex items-center justify-center ${
                      stickerId === s.id ? 'bg-amber-100 ring-2 ring-amber-500 scale-110' : 'hover:bg-white'
                    }`}
                    title={s.name}
                  >
                    {s.emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* 4-digit Deletion Password */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                삭제용 비밀번호 (숫자 4자리) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="나중에 작성자 본인이 글을 삭제할 때 사용됩니다"
                  required
                  className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm hover:shadow transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-amber-300" />
                <span>{submitting ? '부착 중...' : '포스트잇 부착하기'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
