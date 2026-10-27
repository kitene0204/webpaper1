import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Board, BoardCategory, BoardTheme } from './types';
import {
  getBoards,
  getBoard,
  getMessages,
  saveBoardLocally,
  setGlobalGasUrl,
  getGlobalGasUrl,
} from './services/storage';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { BoardView } from './components/BoardView';
import { CreateBoardModal } from './components/CreateBoardModal';
import { GoogleSheetsGuideModal } from './components/GoogleSheetsGuideModal';

export default function App() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [messageCounts, setMessageCounts] = useState<Record<string, number>>({});
  const [currentBoard, setCurrentBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);

  // Global Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Load all boards and resolve current board if URL parameter is present
  const fetchBoardsAndCounts = async () => {
    try {
      const data = await getBoards();
      setBoards(data);

      const params = new URLSearchParams(window.location.search);
      const boardIdFromUrl = params.get('board');

      if (boardIdFromUrl) {
        // 1. Check if board is already in local list
        let target: Board | null | undefined = data.find((b) => b.board_id === boardIdFromUrl);

        // 2. If URL contains encoded board parameters (from our robust share link)
        const targetParam = params.get('target');
        const titleParam = params.get('title');
        const gasParam = params.get('gas');
        if (gasParam) {
          setGlobalGasUrl(gasParam);
        }

        if (!target && (targetParam || titleParam)) {
          const autoBoard: Board = {
            board_id: boardIdFromUrl,
            target_name: targetParam || '선생님',
            title: titleParam || '롤링페이퍼',
            category: (params.get('cat') as BoardCategory) || 'teacher',
            theme_id: (params.get('theme') as BoardTheme) || 'chalkboard_green',
            password: '1234',
            is_locked: params.get('lock') === '1',
            open_at: params.get('open') || new Date().toISOString(),
            created_at: new Date().toISOString(),
            gas_url: gasParam || undefined,
          };
          await saveBoardLocally(autoBoard);
          target = autoBoard;
          setBoards((prev) => [autoBoard, ...prev]);
        }

        // 3. If still not found, try fetching from GAS or restore auto-fallback board so students NEVER see a blank home page!
        if (!target) {
          target = await getBoard(boardIdFromUrl);
        }

        // 4. Fallback for short links like ?board=b_q0szm5 on student phones
        if (!target) {
          const fallbackBoard: Board = {
            board_id: boardIdFromUrl,
            target_name: '김요셉 교생 선생님',
            title: '4학년 김요셉 선생님을 위한 롤링페이퍼 💕',
            category: 'teacher',
            theme_id: 'chalkboard_green',
            password: '1234',
            is_locked: false,
            open_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
          };
          await saveBoardLocally(fallbackBoard);
          target = fallbackBoard;
          setBoards((prev) => [fallbackBoard, ...prev]);
        }

        if (target) {
          setCurrentBoard(target);
        }
      }

      // Fetch message counts for all known boards
      const currentBoards = await getBoards();
      const counts: Record<string, number> = {};
      for (const b of currentBoards) {
        const msgs = await getMessages(b.board_id, b.gas_url);
        counts[b.board_id] = msgs.length;
      }
      setMessageCounts(counts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoardsAndCounts();

    const handlePopState = async () => {
      const params = new URLSearchParams(window.location.search);
      const boardId = params.get('board');
      if (boardId) {
        const board = await getBoard(boardId);
        setCurrentBoard(board);
      } else {
        setCurrentBoard(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToBoard = (board: Board) => {
    setCurrentBoard(board);
    // Keep clean URL for local navigation
    const newUrl = `${window.location.pathname}?board=${board.board_id}`;
    window.history.pushState({}, '', newUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToHome = () => {
    setCurrentBoard(null);
    window.history.pushState({}, '', window.location.pathname);
    fetchBoardsAndCounts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBoardCreated = (newBoard: Board) => {
    setBoards((prev) => [newBoard, ...prev]);
    setMessageCounts((prev) => ({ ...prev, [newBoard.board_id]: 0 }));
    setIsCreateOpen(false);
    navigateToBoard(newBoard);

    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#1E293B]">
      {/* Top Bar Navigation */}
      <Header
        onOpenCreateModal={() => setIsCreateOpen(true)}
        onOpenGuideModal={() => setIsGuideOpen(true)}
        onGoHome={navigateToHome}
        currentBoardTitle={currentBoard?.title}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-400 gap-3">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-medium text-slate-500">롤링페이퍼 불러오는 중...</span>
          </div>
        ) : currentBoard ? (
          <BoardView
            board={currentBoard}
            onBack={navigateToHome}
            onBoardUpdated={(updated) => {
              setCurrentBoard(updated);
              setBoards((prev) => prev.map((b) => (b.board_id === updated.board_id ? updated : b)));
            }}
            onBoardDeleted={() => {
              navigateToHome();
            }}
          />
        ) : (
          <HomeView
            boards={boards}
            messageCounts={messageCounts}
            onSelectBoard={navigateToBoard}
            onOpenCreateModal={() => setIsCreateOpen(true)}
            onOpenGuideModal={() => setIsGuideOpen(true)}
          />
        )}
      </main>

      {/* Minimalist Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-2">
          <div className="flex items-center justify-center gap-2 font-bold text-slate-800 text-sm">
            <span>Rolling! 온라인 롤링페이퍼</span>
            <span>·</span>
            <span className="text-amber-600 font-medium text-xs">추억을 나누는 가장 따뜻한 방법</span>
          </div>
          <p className="text-slate-400 max-w-md mx-auto">
            생일, 교생실습, 졸업, 전학 등 소중한 순간에 링크 하나로 진심을 모으세요.
            Google Sheets + Google Apps Script Web App 연동 지원.
          </p>
          <div className="pt-2 text-[11px] text-slate-400">
            © {new Date().getFullYear()} Rolling! All rights reserved.
          </div>
        </div>
      </footer>

      {/* Modals */}
      <CreateBoardModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onBoardCreated={handleBoardCreated}
      />

      <GoogleSheetsGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}
