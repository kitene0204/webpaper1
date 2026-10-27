import React, { useState } from 'react';
import { X, Trash2, Calendar, User, Heart, Lock } from 'lucide-react';
import { FONTS, POSTIT_COLORS, STICKERS } from '../constants/themes';
import { Board, Message } from '../types';
import { deleteMessage } from '../services/storage';

interface MessageDetailModalProps {
  board: Board;
  message: Message | null;
  isOpen: boolean;
  isHost: boolean;
  onClose: () => void;
  onMessageDeleted: (messageId: string) => void;
}

export const MessageDetailModal: React.FC<MessageDetailModalProps> = ({
  board,
  message,
  isOpen,
  isHost,
  onClose,
  onMessageDeleted,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

  if (!isOpen || !message) return null;

  const fontConfig = FONTS.find((f) => f.id === message.font_style) || FONTS[0];
  const colorConfig = POSTIT_COLORS.find((c) => c.id === message.card_color) || POSTIT_COLORS[0];
  const stickerConfig = STICKERS.find((s) => s.id === message.sticker_id) || STICKERS[0];

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError('');

    if (!isHost && (!deletePassword || deletePassword.length !== 4)) {
      setDeleteError('작성 시 입력했던 4자리 비밀번호를 입력해주세요.');
      return;
    }

    try {
      setDeleting(true);
      const res = await deleteMessage(message.message_id, deletePassword, isHost, board.gas_url);
      if (res.success) {
        onMessageDeleted(message.message_id);
        onClose();
      } else {
        setDeleteError(res.message || '비밀번호가 올바르지 않습니다.');
      }
    } catch {
      setDeleteError('삭제 중 오류가 발생했습니다.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header bar */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="text-xl">{stickerConfig.emoji}</span>
            <span className="text-xs font-bold text-slate-700">
              {message.author}님의 메시지
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Post-it detailed presentation */}
        <div className="p-6 bg-slate-50/70 flex flex-col items-center">
          <div
            className={`relative w-full max-w-md p-6 sm:p-8 rounded-sm shadow-lg transition-all ${fontConfig.cssClass}`}
            style={{
              backgroundColor: message.card_color,
              boxShadow: '0 8px 24px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06)',
            }}
          >
            {/* Top Masking Tape */}
            <div
              className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-24 h-6 masking-tape rounded-xs opacity-90 border border-white/40 select-none pointer-events-none"
              style={{ transform: 'translateX(-50%) rotate(0.8deg)' }}
            />

            {/* Sticker */}
            <div className="absolute top-3 right-4 text-3xl select-none filter drop-shadow-xs">
              {stickerConfig.emoji}
            </div>

            {/* Author */}
            <div className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-1.5">
              <span>From.</span>
              <span className="underline decoration-slate-400 underline-offset-4">
                {message.author}
              </span>
            </div>

            {/* Content text */}
            <p className="text-base sm:text-lg leading-relaxed text-slate-900 break-words whitespace-pre-wrap min-h-36">
              {message.content}
            </p>

            {/* Bottom metadata */}
            <div className="mt-6 pt-3 border-t border-black/10 flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{new Date(message.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </span>
              <span className="opacity-70">To. {board.target_name}</span>
            </div>
          </div>
        </div>

        {/* Footer actions: Delete trigger or delete confirm form */}
        <div className="p-4 border-t border-slate-100 bg-white">
          {!showDeleteConfirm ? (
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isHost ? '방장 권한으로 삭제하기' : '포스트잇 삭제하기'}</span>
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                닫기
              </button>
            </div>
          ) : (
            <form onSubmit={handleDelete} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  {isHost ? '방장 권한 삭제 확인' : '작성자 삭제 비밀번호 입력'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  취소
                </button>
              </div>

              {deleteError && (
                <p className="text-xs text-rose-600 font-medium">{deleteError}</p>
              )}

              {!isHost && (
                <div className="relative">
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="작성 시 입력한 4자리 숫자"
                    className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              )}

              {isHost && (
                <p className="text-xs text-slate-600">
                  방장 권한이 확인되었습니다. 이 메시지를 정말 삭제하시겠습니까?
                </p>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={deleting}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  {deleting ? '삭제 중...' : '확인 및 영구 삭제'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
