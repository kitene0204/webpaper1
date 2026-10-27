/**
 * Google Apps Script (GAS) Web App template for Rolling!
 * Matches PRD specification with LockService concurrency handling.
 */
export const GAS_SCRIPT_CODE = `/**
 * Rolling! (온라인 롤링페이퍼) Google Apps Script Web App API
 * 
 * 구글 스프레드시트의 [확장 프로그램] > [Apps Script]에 붙여넣고
 * [배포] > [새 배포] > [웹 앱] (액세스 권한: 모든 사용자)으로 배포하세요.
 */

const SPREADSHEET = SpreadsheetApp.getActiveSpreadsheet();

function getOrCreateSheet(sheetName, headers) {
  let sheet = SPREADSHEET.getSheetByName(sheetName);
  if (!sheet) {
    sheet = SPREADSHEET.insertSheet(sheetName);
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length)
      .setFontWeight("bold")
      .setBackground("#F1F5F9")
      .setHorizontalAlignment("center");
  }
  return sheet;
}

function initSheets() {
  getOrCreateSheet("Boards", [
    "board_id", "target_name", "title", "category", "theme_id", 
    "password", "is_locked", "open_at", "created_at"
  ]);
  getOrCreateSheet("Messages", [
    "message_id", "board_id", "author", "content", "card_color", 
    "font_style", "sticker_id", "password", "is_deleted", "created_at"
  ]);
}

function doGet(e) {
  initSheets();
  const action = e && e.parameter ? e.parameter.action : null;
  const boardId = e && e.parameter ? e.parameter.board_id : null;

  try {
    // 웹 브라우저에서 주소를 직접 입력하여 접속했을 때 안내 화면 표시
    if (!action) {
      const html = \`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Rolling! API Status</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background-color: #F8FAFC; color: #1E293B; }
            .card { background: white; padding: 32px; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.06); max-width: 480px; text-align: center; border: 1px solid #E2E8F0; }
            .badge { display: inline-block; padding: 6px 14px; background: #DCFCE7; color: #15803D; font-weight: bold; border-radius: 999px; font-size: 13px; margin-bottom: 16px; }
            h1 { font-size: 22px; margin: 0 0 10px; color: #0F172A; }
            p { font-size: 14px; line-height: 1.6; color: #64748B; margin: 0 0 20px; }
            .tip { background: #FEF3C7; border: 1px solid #FDE68A; color: #92400E; padding: 12px; border-radius: 12px; font-size: 13px; text-align: left; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="badge">✓ 정상 작동 중 (API Online)</div>
            <h1>Rolling! API 서버가 연결되었습니다!</h1>
            <p>구글 스프레드시트에 <strong>Boards</strong> 및 <strong>Messages</strong> 탭이 자동으로 생성되었습니다.<br>이 주소는 백엔드 통신용 URL입니다.</p>
            <div class="tip">
              💡 <strong>다음 단계:</strong><br>
              현재 브라우저 주소창의 <code>/exec</code> URL을 복사하여, <strong>Rolling! 롤링페이퍼 웹 앱 상단의 [구글 시트 연동 안내]</strong> 창에 붙여넣으시면 모든 데이터가 실시간으로 기록됩니다.
            </div>
          </div>
        </body>
        </html>
      \`;
      return HtmlService.createHtmlOutput(html).setTitle("Rolling! API Online");
    }

    if (action === "ping") {
      return jsonResponse({ success: true, message: "Rolling! GAS API connected successfully." });
    }

    if (action === "getBoard" && boardId) {
      const boardsSheet = SPREADSHEET.getSheetByName("Boards");
      const data = boardsSheet.getDataRange().getValues();
      const headers = data[0];
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]) === String(boardId)) {
          let board = {};
          headers.forEach((h, idx) => { board[h] = data[i][idx]; });
          return jsonResponse({ success: true, board: board });
        }
      }
      return jsonResponse({ success: false, message: "보드를 찾을 수 없습니다." });
    }

    if (action === "getMessages" && boardId) {
      const messagesSheet = SPREADSHEET.getSheetByName("Messages");
      const data = messagesSheet.getDataRange().getValues();
      const headers = data[0];
      const messages = [];
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][1]) === String(boardId) && data[i][8] !== true && String(data[i][8]).toUpperCase() !== "TRUE") {
          let msg = {};
          headers.forEach((h, idx) => { msg[h] = data[i][idx]; });
          messages.push(msg);
        }
      }
      return jsonResponse({ success: true, messages: messages });
    }

    return jsonResponse({ success: false, message: "올바르지 않은 요청입니다." });
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

function doPost(e) {
  initSheets();
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (e) {
    return jsonResponse({ success: false, message: "서버가 혼잡합니다. 잠시 후 다시 시도해주세요." });
  }

  try {
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;

    if (action === "createBoard") {
      const sheet = SPREADSHEET.getSheetByName("Boards");
      const b = payload.board;
      sheet.appendRow([
        b.board_id,
        b.target_name,
        b.title,
        b.category,
        b.theme_id,
        String(b.password),
        b.is_locked ? "TRUE" : "FALSE",
        b.open_at,
        b.created_at || new Date().toISOString()
      ]);
      return jsonResponse({ success: true, board_id: b.board_id });
    }

    if (action === "createMessage") {
      const sheet = SPREADSHEET.getSheetByName("Messages");
      const m = payload.message;
      sheet.appendRow([
        m.message_id,
        m.board_id,
        m.author,
        m.content,
        m.card_color,
        m.font_style,
        m.sticker_id,
        String(m.password),
        "FALSE",
        m.created_at || new Date().toISOString()
      ]);
      return jsonResponse({ success: true, message_id: m.message_id });
    }

    if (action === "deleteMessage") {
      const sheet = SPREADSHEET.getSheetByName("Messages");
      const data = sheet.getDataRange().getValues();
      const messageId = payload.message_id;
      const pwd = String(payload.password || "");
      const isHost = payload.is_host === true;

      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]) === String(messageId)) {
          if (isHost || String(data[i][7]) === pwd) {
            sheet.getRange(i + 1, 9).setValue("TRUE");
            return jsonResponse({ success: true });
          } else {
            return jsonResponse({ success: false, message: "비밀번호가 일치하지 않습니다." });
          }
        }
      }
      return jsonResponse({ success: false, message: "메시지를 찾을 수 없습니다." });
    }

    if (action === "lockBoard") {
      const sheet = SPREADSHEET.getSheetByName("Boards");
      const data = sheet.getDataRange().getValues();
      const boardId = payload.board_id;
      const pwd = String(payload.password || "");
      const isLocked = payload.is_locked === true;

      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]) === String(boardId)) {
          if (String(data[i][5]) === pwd) {
            sheet.getRange(i + 1, 7).setValue(isLocked ? "TRUE" : "FALSE");
            return jsonResponse({ success: true });
          } else {
            return jsonResponse({ success: false, message: "관리자 비밀번호가 틀렸습니다." });
          }
        }
      }
      return jsonResponse({ success: false, message: "보드를 찾을 수 없습니다." });
    }

    return jsonResponse({ success: false, message: "알 수 없는 작업입니다." });
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  } finally {
    lock.releaseLock();
  }
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
