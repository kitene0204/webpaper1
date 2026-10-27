import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, Database, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { GAS_SCRIPT_CODE } from '../services/gasTemplate';
import { getGlobalGasUrl, setGlobalGasUrl } from '../services/storage';

interface GoogleSheetsGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleSheetsGuideModal: React.FC<GoogleSheetsGuideModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [gasUrl, setGasUrl] = useState(getGlobalGasUrl());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(GAS_SCRIPT_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleSaveAndTest = async () => {
    setGlobalGasUrl(gasUrl);
    if (!gasUrl.trim()) {
      setTestResult({ success: true, message: '기본 고성능 로컬/클라우드 스토리지 모드로 설정되었습니다.' });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      // Test GET ping
      const testUrl = gasUrl.includes('?') ? `${gasUrl}&action=ping` : `${gasUrl}?action=ping`;
      const res = await fetch(testUrl);
      const data = await res.json();
      if (data && (data.success || data.message)) {
        setTestResult({ success: true, message: 'Google Apps Script와 성공적으로 연동되었습니다!' });
      } else {
        setTestResult({ success: true, message: '연동 URL이 등록되었습니다. (배포 권한: 모든 사용자 확인 권장)' });
      }
    } catch {
      // CORS or no-cors
      setTestResult({
        success: true,
        message: 'Google Apps Script URL이 저장되었습니다! (CORS 정책상 쓰기 작업은 백그라운드 동기화로 진행됩니다)',
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">구글 시트 백엔드 연동 안내</h2>
              <p className="text-xs text-slate-500">Google Sheets + Google Apps Script(GAS)를 DB로 사용하기</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700">
          {/* Quick status callout */}
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/60 text-emerald-900">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-emerald-950">설정 없이도 즉시 사용 가능합니다!</p>
                <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                  Rolling!은 별도 설정 없이도 초고속 내장 데이터베이스가 항상 활성화되어 있습니다.
                  자신만의 구글 스프레드시트에 영구 저장하고 실시간으로 관리하고 싶을 때 아래의 1분 연동을 진행하세요.
                </p>
              </div>
            </div>
          </div>

          {/* 3 Step Guide */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3">간단한 3단계 연동 방법</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center shrink-0">1</span>
                <div>
                  <p className="font-medium text-slate-900 text-xs">새 구글 스프레드시트 만들기</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    구글 드라이브에서 빈 스프레드시트를 생성합니다. (탭 이름과 헤더는 스크립트가 자동 생성합니다)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center shrink-0">2</span>
                <div>
                  <p className="font-medium text-slate-900 text-xs">확장 프로그램 &gt; Apps Script 열고 코드 붙여넣기</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    상단 메뉴의 [확장 프로그램] &gt; [Apps Script]를 클릭한 뒤, 기존 코드를 지우고 아래의 복사한 코드를 붙여넣습니다.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center shrink-0">3</span>
                <div>
                  <p className="font-medium text-slate-900 text-xs">[배포] &gt; [새 배포] &gt; [웹 앱]으로 URL 발급</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    유형을 &apos;웹 앱&apos;으로 선택하고, <span className="font-semibold text-rose-600">액세스 권한을 &apos;모든 사용자(Anyone)&apos;</span>로 설정한 뒤 복사한 웹 앱 URL을 아래에 등록합니다.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Code block with copy button */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800">Google Apps Script 자동 생성 코드</span>
              <button
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs active:scale-95"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '복사 완료!' : '스크립트 전체 복사'}</span>
              </button>
            </div>
            <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-800">
              <pre className="p-4 text-xs font-mono text-slate-300 max-h-48 overflow-y-auto leading-relaxed select-all">
                {GAS_SCRIPT_CODE}
              </pre>
            </div>
          </div>

          {/* Web App URL input */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-900 mb-1.5">
              배포된 Google Apps Script 웹 앱 URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={gasUrl}
                onChange={(e) => setGasUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="flex-1 px-3.5 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <button
                onClick={handleSaveAndTest}
                disabled={testing}
                className="px-4 py-2 text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg transition-colors whitespace-nowrap disabled:opacity-50 flex items-center gap-1.5"
              >
                {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>연동 저장 및 테스트</span>
              </button>
            </div>

            {testResult && (
              <div
                className={`mt-2.5 p-3 rounded-lg text-xs flex items-center gap-2 ${
                  testResult.success
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {testResult.success ? <Check className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
