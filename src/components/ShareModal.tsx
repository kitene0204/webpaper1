import React, { useState } from 'react';
import { X, Copy, Check, Share2, MessageCircle, Link, QrCode } from 'lucide-react';
import { Board } from '../types';

interface ShareModalProps {
  board: Board;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ board, isOpen, onClose }) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedKakao, setCopiedKakao] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?board=${board.board_id}`
    : `https://rolling.service/board/${board.board_id}`;

  const kakaoMessage = `💌 [Rolling!] ${board.target_name}님을 위한 온라인 롤링페이퍼가 열렸습니다!\n\n"${board.title}"\n\n별도 가입 없이 아래 링크에서 바로 마음을 전해주세요 ✨\n👉 ${currentUrl}`;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleCopyKakao = async () => {
    try {
      await navigator.clipboard.writeText(kakaoMessage);
      setCopiedKakao(true);
      setTimeout(() => setCopiedKakao(false), 2000);
    } catch {
      // fallback
    }
  };

  // Safe QR Code URL using Google Chart API / QR server
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(currentUrl)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">롤링페이퍼 공유하기</h2>
              <p className="text-xs text-slate-500">친구와 동료들에게 링크를 보내세요</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Target & Title Recap */}
          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-center">
            <span className="text-xs font-semibold text-amber-800">To. {board.target_name}</span>
            <p className="text-sm font-bold text-amber-950 mt-0.5 line-clamp-1">{board.title}</p>
          </div>

          {/* URL Copy Section */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
              <Link className="w-3.5 h-3.5 text-slate-500" />
              <span>고유 롤링페이퍼 링크</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={currentUrl}
                className="flex-1 px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 bg-slate-50 select-all"
              />
              <button
                onClick={handleCopyUrl}
                className="px-3.5 py-2 text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 shrink-0 active:scale-95 cursor-pointer"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUrl ? '복사됨!' : '링크 복사'}</span>
              </button>
            </div>
          </div>

          {/* KakaoTalk Formatted Copy */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5 text-[#FEE500]" />
              <span>카카오톡 / 메신저 맞춤 초대 문구</span>
            </label>
            <div className="relative rounded-xl border border-slate-200 p-3 bg-slate-50 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
              {kakaoMessage}
            </div>
            <button
              onClick={handleCopyKakao}
              className="mt-2 w-full py-2.5 px-4 rounded-xl bg-[#FEE500] hover:bg-[#FDD835] text-[#191919] font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-98 shadow-xs cursor-pointer"
            >
              {copiedKakao ? <Check className="w-4 h-4 text-emerald-700" /> : <MessageCircle className="w-4 h-4" />}
              <span>{copiedKakao ? '초대 문구 복사 완료!' : '카카오톡 맞춤 메시지 복사하기'}</span>
            </button>
          </div>

          {/* QR Code Presentation */}
          <div className="pt-2 border-t border-slate-100 flex flex-col items-center">
            <span className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1">
              <QrCode className="w-3.5 h-3.5 text-slate-500" />
              <span>모바일 카메라로 바로 스캔 (QR 코드)</span>
            </span>
            <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-xs">
              <img
                src={qrApiUrl}
                alt="롤링페이퍼 접속 QR 코드"
                width={140}
                height={140}
                className="w-32 h-32 rounded-md"
              />
            </div>
            <span className="text-[11px] text-slate-400 mt-1">스마트폰 카메라로 비추면 바로 열립니다</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
