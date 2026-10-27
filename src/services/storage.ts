import { Board, Message } from '../types';
import { INITIAL_BOARDS, INITIAL_MESSAGES } from './seedData';

const BOARDS_KEY = 'rolling_boards_v1';
const MESSAGES_KEY = 'rolling_messages_v1';
const GLOBAL_GAS_URL_KEY = 'rolling_global_gas_url';

export function getGlobalGasUrl(): string {
  try {
    return localStorage.getItem(GLOBAL_GAS_URL_KEY) || '';
  } catch {
    return '';
  }
}

export function setGlobalGasUrl(url: string): void {
  try {
    localStorage.setItem(GLOBAL_GAS_URL_KEY, url.trim());
  } catch (e) {
    console.error('Failed to save GAS URL:', e);
  }
}

export function initializeStorage(): void {
  try {
    if (!localStorage.getItem(BOARDS_KEY)) {
      localStorage.setItem(BOARDS_KEY, JSON.stringify(INITIAL_BOARDS));
    }
    if (!localStorage.getItem(MESSAGES_KEY)) {
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(INITIAL_MESSAGES));
    }
  } catch (e) {
    console.error('LocalStorage not available, running in-memory:', e);
  }
}

export async function getBoards(): Promise<Board[]> {
  try {
    initializeStorage();
    const raw = localStorage.getItem(BOARDS_KEY);
    return raw ? JSON.parse(raw) : INITIAL_BOARDS;
  } catch {
    return INITIAL_BOARDS;
  }
}

export async function saveBoardLocally(board: Board): Promise<void> {
  const boards = await getBoards();
  const existingIdx = boards.findIndex((b) => b.board_id === board.board_id);
  if (existingIdx !== -1) {
    boards[existingIdx] = { ...boards[existingIdx], ...board };
  } else {
    boards.unshift(board);
  }
  localStorage.setItem(BOARDS_KEY, JSON.stringify(boards));
}

export async function getBoard(boardId: string): Promise<Board | null> {
  const boards = await getBoards();
  let board = boards.find((b) => b.board_id === boardId);
  if (board) return board;

  // If not found locally, try fetching from Google Apps Script if URL is configured
  const gasUrl = getGlobalGasUrl();
  if (gasUrl) {
    try {
      const fetchUrl = gasUrl.includes('?')
        ? `${gasUrl}&action=getBoard&board_id=${encodeURIComponent(boardId)}`
        : `${gasUrl}?action=getBoard&board_id=${encodeURIComponent(boardId)}`;
      const res = await fetch(fetchUrl);
      const data = await res.json();
      if (data && data.success && data.board) {
        const remoteBoard: Board = {
          board_id: data.board.board_id || boardId,
          target_name: data.board.target_name || '선생님',
          title: data.board.title || '롤링페이퍼',
          category: data.board.category || 'teacher',
          theme_id: data.board.theme_id || 'chalkboard_green',
          password: String(data.board.password || '1234'),
          is_locked: data.board.is_locked === true || String(data.board.is_locked).toUpperCase() === 'TRUE',
          open_at: data.board.open_at || new Date().toISOString(),
          created_at: data.board.created_at || new Date().toISOString(),
          gas_url: gasUrl,
        };
        await saveBoardLocally(remoteBoard);
        return remoteBoard;
      }
    } catch (e) {
      console.warn('Failed to fetch board from GAS:', e);
    }
  }

  return null;
}

export async function createBoard(newBoard: Omit<Board, 'board_id' | 'created_at'>): Promise<Board> {
  const boards = await getBoards();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const board: Board = {
    ...newBoard,
    board_id: `b_${randomSuffix}`,
    created_at: new Date().toISOString(),
  };

  boards.unshift(board);
  localStorage.setItem(BOARDS_KEY, JSON.stringify(boards));

  // If board or global has GAS URL, attempt sync
  const targetGasUrl = board.gas_url || getGlobalGasUrl();
  if (targetGasUrl) {
    try {
      fetch(targetGasUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'createBoard', board }),
        mode: 'no-cors',
      }).catch((e) => console.warn('GAS sync warning:', e));
    } catch (e) {
      console.warn('GAS push failed:', e);
    }
  }

  return board;
}

export async function updateBoard(
  boardId: string,
  updates: Partial<Board>,
  password?: string
): Promise<{ success: boolean; message?: string }> {
  const boards = await getBoards();
  const idx = boards.findIndex((b) => b.board_id === boardId);
  if (idx === -1) return { success: false, message: '보드를 찾을 수 없습니다.' };

  if (password && boards[idx].password !== password) {
    return { success: false, message: '관리자 비밀번호가 일치하지 않습니다.' };
  }

  boards[idx] = { ...boards[idx], ...updates };
  localStorage.setItem(BOARDS_KEY, JSON.stringify(boards));

  // GAS lock sync if applicable
  const targetGasUrl = boards[idx].gas_url || getGlobalGasUrl();
  if (targetGasUrl && updates.is_locked !== undefined && password) {
    try {
      fetch(targetGasUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'lockBoard',
          board_id: boardId,
          password,
          is_locked: updates.is_locked,
        }),
        mode: 'no-cors',
      }).catch((e) => console.warn('GAS lock sync failed:', e));
    } catch (e) {
      console.warn(e);
    }
  }

  return { success: true };
}

export async function deleteBoard(
  boardId: string,
  password: string
): Promise<{ success: boolean; message?: string }> {
  const boards = await getBoards();
  const target = boards.find((b) => b.board_id === boardId);
  if (!target) return { success: false, message: '보드를 찾을 수 없습니다.' };
  if (target.password !== password) {
    return { success: false, message: '관리자 비밀번호가 일치하지 않습니다.' };
  }

  const filteredBoards = boards.filter((b) => b.board_id !== boardId);
  localStorage.setItem(BOARDS_KEY, JSON.stringify(filteredBoards));

  // Also remove its messages
  const messages = await getRawMessages();
  const filteredMessages = messages.filter((m) => m.board_id !== boardId);
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(filteredMessages));

  return { success: true };
}

async function getRawMessages(): Promise<Message[]> {
  try {
    initializeStorage();
    const raw = localStorage.getItem(MESSAGES_KEY);
    return raw ? JSON.parse(raw) : INITIAL_MESSAGES;
  } catch {
    return INITIAL_MESSAGES;
  }
}

export async function getMessages(boardId: string, gasUrl?: string): Promise<Message[]> {
  const all = await getRawMessages();
  let localMessages = all.filter((m) => m.board_id === boardId && !m.is_deleted);

  // Try fetching from Google Apps Script if gasUrl is available
  const targetGasUrl = gasUrl || getGlobalGasUrl();
  if (targetGasUrl) {
    try {
      const fetchUrl = targetGasUrl.includes('?')
        ? `${targetGasUrl}&action=getMessages&board_id=${encodeURIComponent(boardId)}`
        : `${targetGasUrl}?action=getMessages&board_id=${encodeURIComponent(boardId)}`;
      const res = await fetch(fetchUrl);
      const data = await res.json();
      if (data && data.success && Array.isArray(data.messages)) {
        const remoteMessages: Message[] = data.messages.map((m: any) => ({
          message_id: String(m.message_id),
          board_id: String(m.board_id),
          author: String(m.author || '익명'),
          content: String(m.content || ''),
          card_color: String(m.card_color || '#FFF9C4'),
          font_style: (m.font_style as any) || 'NanumPen',
          sticker_id: String(m.sticker_id || 'heart'),
          password: String(m.password || '1111'),
          is_deleted: m.is_deleted === true || String(m.is_deleted).toUpperCase() === 'TRUE',
          created_at: String(m.created_at || new Date().toISOString()),
        }));

        // Merge remote messages into local state
        const messageMap = new Map<string, Message>();
        localMessages.forEach((m) => messageMap.set(m.message_id, m));
        remoteMessages.forEach((m) => {
          if (!m.is_deleted) {
            messageMap.set(m.message_id, m);
          } else {
            messageMap.delete(m.message_id);
          }
        });

        const merged = Array.from(messageMap.values());
        // Save merged messages to localStorage
        const otherMessages = all.filter((m) => m.board_id !== boardId);
        localStorage.setItem(MESSAGES_KEY, JSON.stringify([...otherMessages, ...merged]));
        return merged;
      }
    } catch (e) {
      // Offline fallback
    }
  }

  return localMessages;
}

export async function createMessage(
  newMsg: Omit<Message, 'message_id' | 'created_at' | 'is_deleted'>,
  gasUrl?: string
): Promise<Message> {
  const all = await getRawMessages();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const rotation = Math.floor(Math.random() * 7) - 3; // -3 to 3 deg
  
  const msg: Message = {
    ...newMsg,
    message_id: `m_${randomSuffix}`,
    is_deleted: false,
    created_at: new Date().toISOString(),
    rotation,
  };

  all.push(msg);
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(all));

  // GAS sync
  const targetGasUrl = gasUrl || getGlobalGasUrl();
  if (targetGasUrl) {
    try {
      fetch(targetGasUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'createMessage', message: msg }),
        mode: 'no-cors',
      }).catch((e) => console.warn('GAS push msg warning:', e));
    } catch (e) {
      console.warn('GAS push msg failed:', e);
    }
  }

  return msg;
}

export async function deleteMessage(
  messageId: string,
  password?: string,
  isHost?: boolean,
  gasUrl?: string
): Promise<{ success: boolean; message?: string }> {
  const all = await getRawMessages();
  const idx = all.findIndex((m) => m.message_id === messageId);
  if (idx === -1) return { success: false, message: '메시지를 찾을 수 없습니다.' };

  if (!isHost) {
    if (!password || all[idx].password !== password) {
      return { success: false, message: '삭제 비밀번호 4자리가 일치하지 않습니다.' };
    }
  }

  all[idx].is_deleted = true;
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(all));

  // GAS sync
  const targetGasUrl = gasUrl || getGlobalGasUrl();
  if (targetGasUrl) {
    try {
      fetch(targetGasUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'deleteMessage',
          message_id: messageId,
          password: password || '',
          is_host: !!isHost,
        }),
        mode: 'no-cors',
      }).catch((e) => console.warn(e));
    } catch (e) {
      console.warn(e);
    }
  }

  return { success: true };
}

export async function updateMessagePosition(
  messageId: string,
  pos_x: number,
  pos_y: number
): Promise<void> {
  const all = await getRawMessages();
  const idx = all.findIndex((m) => m.message_id === messageId);
  if (idx !== -1) {
    all[idx].pos_x = pos_x;
    all[idx].pos_y = pos_y;
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(all));
  }
}

/**
 * Exports all messages of a board to standard CSV
 */
export function exportBoardToCSV(board: Board, messages: Message[]): string {
  const headers = ['메시지ID', '작성자', '본문 내용', '카드색상', '스티커', '작성일시'];
  const rows = messages.map((m) => [
    m.message_id,
    `"${(m.author || '익명').replace(/"/g, '""')}"`,
    `"${(m.content || '').replace(/"/g, '""')}"`,
    m.card_color,
    m.sticker_id,
    new Date(m.created_at).toLocaleString('ko-KR'),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  return '\uFEFF' + csvContent; // UTF-8 BOM for Korean Excel/Google Sheets compatibility
}

export function downloadCSVFile(csvContent: string, fileName: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
