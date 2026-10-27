import React, { useState } from 'react';
import { X, Lock, ShieldCheck, ToggleLeft, ToggleRight, Trash2, Calendar, AlertTriangle } from 'lucide-react';
import { Board } from '../types';
import { updateBoard, deleteBoard } from '../services/storage';

interface AdminPasswordModalProps {
  board: Board;
  isOpen: boolean;
  isHost: boolean;
  onClose: () => void;
  onHostAuthenticated: () => void;
  onBoardUpdated: (updated: Board) => void;
  onBoardDeleted: () => void;
}

export const AdminPasswordModal: React.FC<AdminPasswordModalProps> = ({
  board,
  isOpen,
  isHost,
  onClose,
  onHostAuthenticated,
  onBoardUpdated,
  onBoardDeleted,
}) => {
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isOpen) return null;

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (password === board.password) {
      onHostAuthenticated();
    } else {
      setErrorMsg('관리자 비밀번호가 일치하지 않습니다.');
    }
  };

  const handleToggleLock = async () => {
    setSaving(true);
    try {
      const nextLocked = !board.is_locked;
      const res = await updateBoard(board.board_id, { is_locked: nextLocked }, board.password);
      if (res.success) {
        onBoardUpdated({ ...board, is_locked: nextLocked });
      } else {
        setErrorMsg(res.message || '업데이트 실패');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleOpenNow = async () => {
    setSaving(true);
    try {
      const res = await updateBoard(board.board_id, { open_at: new Date().toISOString() }, board.password);
      if (res.success) {
        onBoardUpdated({ ...board, open_at: new Date().toISOString() });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBoard = async () => {
    setSaving(true);
    try {
      const res = await deleteBoard(board.board_id, board.password);
      if (res.success) {
        onBoardDeleted();
        onClose();
      } else {
        setErrorMsg(res.message || '삭제 실패');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">방 관리자(방장) 모드</h2>
              <p className="text-xs text-slate-500">롤링페이퍼 관리 및 설정</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!isHost ? (
            <form onSubmit={handleVerify} className="space-y-4">
              <p className="text-xs text-slate-600">
                방 생성 시 설정했던 <span className="font-bold text-slate-900">4~6자리 비밀번호</span>를 입력해주세요.
              </p>

              {errorMsg && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-600 font-medium">
                  {errorMsg}
                </div>
              )}

              <div className="relative">
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="방 관리자 비밀번호"
                  autoFocus
                  required
                  className="w-full pl-9 pr-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  확인 및 모드 진입
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-5">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-900">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold">방장 권한이 활성화되었습니다!</span>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    모든 메시지를 즉시 삭제할 수 있으며 보드 마감 및 설정을 변경할 수 있습니다.
                  </p>
                </div>
              </div>

              {/* Setting 1: Lock board / close writing */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <div>
                  <span className="text-xs font-bold text-slate-900">롤링페이퍼 작성 마감</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    마감하면 더 이상 새 메시지를 작성할 수 없습니다.
                  </p>
                </div>
                <button
                  onClick={handleToggleLock}
                  disabled={saving}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                    board.is_locked
                      ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  {board.is_locked ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                  <span>{board.is_locked ? '마감됨 (작성불가)' : '작성 가능'}</span>
                </button>
              </div>

              {/* Setting 2: D-day immediate release */}
              {new Date(board.open_at).getTime() > Date.now() && (
                <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-amber-950">지정일 공개 조기 해제</span>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      D-Day를 기다리지 않고 지금 즉시 모든 메시지를 공개합니다.
                    </p>
                  </div>
                  <button
                    onClick={handleOpenNow}
                    disabled={saving}
                    className="px-3 py-1.5 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    지금 즉시 공개
                  </button>
                </div>
              )}

              {/* Setting 3: Delete board entirely */}
              <div className="pt-2 border-t border-slate-100">
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full py-2 px-3 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>이 롤링페이퍼 방 영구 삭제</span>
                  </button>
                ) : (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-2">
                    <div className="flex items-center gap-1.5 font-bold">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>정말 삭제하시겠습니까?</span>
                    </div>
                    <p className="text-[11px]">
                      이 보드와 안에 작성된 모든 포스트잇이 영구적으로 삭제되며 복구할 수 없습니다.
                    </p>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-3 py-1 bg-white border border-rose-300 rounded text-slate-700 hover:bg-slate-50 cursor-pointer"
                      >
                        취소
                      </button>
                      <button
                        onClick={handleDeleteBoard}
                        disabled={saving}
                        className="px-3 py-1 bg-rose-600 text-white font-bold rounded hover:bg-rose-700 cursor-pointer disabled:opacity-50"
                      >
                        {saving ? '삭제 중...' : '네, 삭제합니다'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
