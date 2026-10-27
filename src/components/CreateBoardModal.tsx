import React, { useState } from 'react';
import { X, Sparkles, Lock, Calendar, Check, ShieldCheck, ArrowRight } from 'lucide-react';
import { CATEGORIES, THEMES } from '../constants/themes';
import { Board, BoardCategory, BoardTheme } from '../types';
import { createBoard } from '../services/storage';

interface CreateBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBoardCreated: (board: Board) => void;
}

export const CreateBoardModal: React.FC<CreateBoardModalProps> = ({
  isOpen,
  onClose,
  onBoardCreated,
}) => {
  const [targetName, setTargetName] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<BoardCategory>('teacher');
  const [themeId, setThemeId] = useState<BoardTheme>('chalkboard_green');
  const [password, setPassword] = useState('');
  const [openMode, setOpenMode] = useState<'immediate' | 'dday'>('immediate');
  const [ddayDate, setDdayDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    d.setHours(12, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [customGasUrl, setCustomGasUrl] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Filter themes that match selected category or show all
  const availableThemes = Object.values(THEMES).filter(
    (t) => t.category === category || t.category === 'general'
  );

  const handleCategoryChange = (cat: BoardCategory) => {
    setCategory(cat);
    // Auto select first matching theme
    const matched = Object.values(THEMES).find((t) => t.category === cat);
    if (matched) {
      setThemeId(matched.id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!targetName.trim()) {
      setErrorMsg('받는 사람 이름을 입력해주세요.');
      return;
    }
    if (!title.trim()) {
      setErrorMsg('롤링페이퍼 제목을 입력해주세요.');
      return;
    }
    if (!password || password.length < 4 || password.length > 6 || !/^\d+$/.test(password)) {
      setErrorMsg('방 관리용 비밀번호는 4~6자리 숫자로 입력해주세요.');
      return;
    }

    let openAtIso = new Date().toISOString();
    if (openMode === 'dday') {
      const selectedTime = new Date(ddayDate);
      if (isNaN(selectedTime.getTime()) || selectedTime.getTime() <= Date.now()) {
        setErrorMsg('지정 공개일은 현재 시간 이후로 설정해주세요.');
        return;
      }
      openAtIso = selectedTime.toISOString();
    }

    try {
      setSubmitting(true);
      const created = await createBoard({
        target_name: targetName.trim(),
        title: title.trim(),
        category,
        theme_id: themeId,
        password,
        is_locked: false,
        open_at: openAtIso,
        gas_url: customGasUrl.trim() || undefined,
      });

      onBoardCreated(created);
    } catch {
      setErrorMsg('방 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">새 롤링페이퍼 만들기</h2>
              <p className="text-xs text-slate-500">소중한 마음을 모을 공간을 만듭니다</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {errorMsg}
            </div>
          )}

          {/* 1. Category Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">
              카테고리 선택 <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    category === cat.id
                      ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-400/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="text-xl mb-1">{cat.emoji}</div>
                  <div className="text-xs font-bold text-slate-900">{cat.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Target & Title */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                받는 분 이름/대상 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={targetName}
                onChange={(e) => setTargetName(e.target.value)}
                placeholder="예: 이민주 교생선생님, 민수, 3학년 2반"
                maxLength={30}
                required
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                롤링페이퍼 제목 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 선생님 한 달 동안 감사했습니다! 꽃길만 걸으세요"
                maxLength={60}
                required
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>

          {/* 3. Theme Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">
              게시판 테마/배경 선택
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {availableThemes.map((thm) => (
                <button
                  key={thm.id}
                  type="button"
                  onClick={() => setThemeId(thm.id)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                    themeId === thm.id
                      ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className={`h-12 w-full rounded-md mb-2 flex items-center justify-center border border-black/5 ${thm.boardBgClass}`}>
                    <span className="text-xs font-bold opacity-80">{thm.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{thm.name}</span>
                    {themeId === thm.id && (
                      <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px]">
                        ✓
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{thm.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Release schedule */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">
              공개 방식 설정 (D-Day 기능)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOpenMode('immediate')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  openMode === 'immediate'
                    ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-400/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                  <Check className="w-3.5 h-3.5 text-amber-600" />
                  <span>상시 공개</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">작성되는 즉시 누구나 열람 가능</p>
              </button>

              <button
                type="button"
                onClick={() => setOpenMode('dday')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  openMode === 'dday'
                    ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-400/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  <span>지정일 공개 (D-Day)</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">D-Day 전까지는 개수만 보이고 비공개</p>
              </button>
            </div>

            {openMode === 'dday' && (
              <div className="mt-3 p-3 rounded-xl bg-amber-50/60 border border-amber-200/80">
                <label className="block text-xs font-bold text-amber-950 mb-1">
                  공개 일시 선택
                </label>
                <input
                  type="datetime-local"
                  value={ddayDate}
                  onChange={(e) => setDdayDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-amber-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-800"
                />
                <p className="text-[11px] text-amber-800 mt-1">
                  💡 지정한 일시 전에는 메시지 카운트다운 타이머가 표시되고 본문은 봉인됩니다!
                </p>
              </div>
            )}
          </div>

          {/* 5. Host Password */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              방 관리용 비밀번호 (4~6자리 숫자) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="4~6자리 숫자 (메시지 삭제, 마감 관리에 필요)"
                required
                className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              방장 권한으로 부적절한 글 삭제 또는 롤링페이퍼 마감 시 사용됩니다.
            </p>
          </div>

          {/* Advanced: Individual Google Sheets GAS URL */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium"
            >
              <span>{showAdvanced ? '▲ 고급 설정 접기' : '▼ 고급 설정 (개별 구글 시트 연동)'}</span>
            </button>
            {showAdvanced && (
              <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  이 보드 전용 Google Apps Script Web App URL (선택)
                </label>
                <input
                  type="url"
                  value={customGasUrl}
                  onChange={(e) => setCustomGasUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  입력하지 않으면 기본 내장 데이터베이스(즉시 작동)로 자동 저장됩니다.
                </p>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm hover:shadow transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <span>{submitting ? '생성 중...' : '롤링페이퍼 방 만들기'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
