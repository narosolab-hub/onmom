"use client";

import { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Gonggu } from '@/data/types';
import { formatPrice, getDiscountRate, formatRelativeTime } from '@/lib/utils';

type TemplateId = 'arrived' | 'new_open' | 'closing_soon' | 'custom';

interface Template {
  id: TemplateId;
  emoji: string;
  label: string;
  desc: string;
  needsProduct: boolean;
}

const TEMPLATES: Template[] = [
  { id: 'arrived',      emoji: '📦', label: '입고 완료 공지',    desc: '픽업 가능 안내',     needsProduct: true  },
  { id: 'new_open',     emoji: '🆕', label: '새 공구 오픈 안내', desc: '공구 시작 공지',     needsProduct: true  },
  { id: 'closing_soon', emoji: '⚠️', label: '마감 임박 공지',    desc: '잔여 수량 안내',     needsProduct: true  },
  { id: 'custom',       emoji: '✏️', label: '직접 입력',         desc: '자유 메시지 작성',   needsProduct: false },
];

function buildMessage(templateId: TemplateId, marketName: string, address: string, gonggu?: Gonggu): string {
  switch (templateId) {
    case 'arrived':
      if (!gonggu) return '';
      return [
        `안녕하세요! ${marketName}입니다 🥬`,
        '',
        `✅ 입고 완료 안내`,
        '',
        `${gonggu.emoji} ${gonggu.title}`,
        `📅 픽업 기간: ${gonggu.pickupDate}`,
        `📍 픽업 장소: ${address}`,
        '',
        `예약하신 고객님들의 방문을 기다리겠습니다 😊`,
      ].join('\n');

    case 'new_open':
      if (!gonggu) return '';
      return [
        `안녕하세요! ${marketName}입니다 🥬`,
        '',
        `🎉 새로운 공구가 시작되었습니다!`,
        '',
        `${gonggu.emoji} ${gonggu.title}`,
        `💰 ₩${formatPrice(gonggu.price)} (${getDiscountRate(gonggu.originalPrice, gonggu.price)}% 할인)`,
        `📅 입고 예정: ${gonggu.arrivalDate}`,
        '',
        `지금 바로 예약하세요! 👇`,
        `[온맘마켓 앱에서 예약하기]`,
      ].join('\n');

    case 'closing_soon':
      if (!gonggu) return '';
      return [
        `안녕하세요! ${marketName}입니다 🥬`,
        '',
        `⚠️ 마감 임박 공지`,
        '',
        `${gonggu.emoji} ${gonggu.title}`,
        `잔여 수량: ${gonggu.total - gonggu.reserved}${gonggu.type === 'service' ? '건' : '개'}`,
        '',
        `아직 예약 못 하신 분들은 서둘러주세요! 🏃`,
        `[온맘마켓 앱에서 예약하기]`,
      ].join('\n');

    case 'custom':
      return `안녕하세요! ${marketName}입니다 🥬\n\n`;

    default:
      return '';
  }
}

interface SendLog {
  id: number;
  templateLabel: string;
  productTitle?: string;
  sentAt: string;
}

export default function AlimtalkPage() {
  const { markets, gongguList } = useApp();
  const market = markets[0];

  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('arrived');
  const [selectedGongguId, setSelectedGongguId] = useState<number | ''>('');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendLog, setSendLog] = useState<SendLog[]>([]);
  const [logCounter, setLogCounter] = useState(1);

  const template = TEMPLATES.find(t => t.id === selectedTemplate)!;
  const selectedGonggu = gongguList.find(g => g.id === Number(selectedGongguId));

  // 템플릿 변경 시 메시지 자동 생성
  const handleTemplateChange = (id: TemplateId) => {
    setSelectedTemplate(id);
    setSelectedGongguId('');
    const msg = buildMessage(id, market?.name ?? '', market?.address ?? '');
    setMessage(msg);
  };

  // 상품 변경 시 메시지 재생성
  const handleGongguChange = (gongguId: number | '') => {
    setSelectedGongguId(gongguId);
    const gonggu = gongguList.find(g => g.id === Number(gongguId));
    const msg = buildMessage(selectedTemplate, market?.name ?? '', market?.address ?? '', gonggu);
    setMessage(msg);
  };

  // 복사
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
    } catch {
      const el = document.createElement('textarea');
      el.value = message;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // 발송 (시뮬레이션)
  const handleSend = () => {
    const log: SendLog = {
      id: logCounter,
      templateLabel: template.label,
      productTitle: selectedGonggu?.title,
      sentAt: new Date().toISOString(),
    };
    setSendLog(prev => [log, ...prev]);
    setLogCounter(n => n + 1);
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  const canSend = message.trim().length > 0 && (!template.needsProduct || selectedGongguId !== '');

  // 템플릿별로 연관 상품 필터
  const relevantGonggu = useMemo(() => {
    if (selectedTemplate === 'arrived') return gongguList.filter(g => g.status === 'arrived');
    if (selectedTemplate === 'closing_soon') return gongguList.filter(g => g.status === 'closing' || (g.total - g.reserved) <= 5);
    return gongguList.filter(g => g.status === 'open' || g.status === 'closing' || g.status === 'upcoming');
  }, [selectedTemplate, gongguList]);

  return (
    <div className="p-8 max-w-3xl">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#111827]">채널 알림 발송</h1>
        <p className="text-[#6B7280] mt-1">카카오 오픈채팅방에 공지를 발송하세요</p>
      </div>

      {/* 발송 채널 */}
      <div className="bg-[#FEE500]/20 border border-[#FEE500] rounded-2xl p-5 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#FEE500] rounded-2xl flex items-center justify-center text-2xl">💬</div>
          <div>
            <p className="font-semibold text-[#111827]">{market?.name ?? '온맘마켓'} 오픈채팅방</p>
            <p className="text-sm text-[#6B7280] mt-0.5">멤버 {market?.followers ?? 0}명</p>
          </div>
        </div>
        <button
          className="px-4 py-2 bg-[#FEE500] text-[#111827] rounded-xl text-sm font-semibold hover:bg-yellow-300 transition-colors"
          onClick={() => alert('채팅방 링크가 연결됩니다 (프로토타입)')}
        >
          채팅방 열기 →
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* 왼쪽: 설정 */}
        <div className="space-y-5">
          {/* 템플릿 선택 */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <p className="text-sm font-semibold text-[#111827] mb-3">템플릿 선택</p>
            <div className="space-y-2">
              {TEMPLATES.map(t => (
                <button
                  key={t.id}
                  onClick={() => handleTemplateChange(t.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-colors text-left ${
                    selectedTemplate === t.id
                      ? 'border-[#609966] bg-[#E8F5E9]'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <span className="text-xl">{t.emoji}</span>
                  <div>
                    <p className={`text-sm font-semibold ${selectedTemplate === t.id ? 'text-[#4A7A50]' : 'text-[#111827]'}`}>
                      {t.label}
                    </p>
                    <p className="text-[11px] text-[#6B7280]">{t.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 상품 연결 */}
          {template.needsProduct && (
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <p className="text-sm font-semibold text-[#111827] mb-3">
                상품 연결 <span className="text-[#FF5C38]">*</span>
              </p>
              {relevantGonggu.length === 0 ? (
                <p className="text-sm text-[#6B7280]">해당하는 상품이 없습니다.</p>
              ) : (
                <select
                  value={selectedGongguId}
                  onChange={e => handleGongguChange(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#609966]"
                >
                  <option value="">상품을 선택하세요</option>
                  {relevantGonggu.map(g => (
                    <option key={g.id} value={g.id}>
                      {g.emoji} {g.title}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* 발송 기록 */}
          {sendLog.length > 0 && (
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <p className="text-sm font-semibold text-[#111827] mb-3">발송 기록</p>
              <div className="space-y-2">
                {sendLog.slice(0, 5).map(log => (
                  <div key={log.id} className="flex items-start gap-2 text-xs text-[#6B7280]">
                    <span className="mt-0.5">✓</span>
                    <div>
                      <p className="text-[#111827] font-medium">{log.templateLabel}</p>
                      {log.productTitle && <p>{log.productTitle}</p>}
                      <p>{formatRelativeTime(log.sentAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 오른쪽: 메시지 편집 + 발송 */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-[#111827]">메시지 편집</p>
              <span className="text-xs text-[#6B7280]">{message.length}자</span>
            </div>

            {/* 카카오 메시지 미리보기 스타일 */}
            <div className="mb-3 p-3 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <p className="text-[10px] text-[#6B7280] mb-1.5 font-medium">미리보기</p>
              <div className="flex gap-2">
                <div className="w-8 h-8 bg-[#FEE500] rounded-full flex items-center justify-center text-sm flex-shrink-0">🥬</div>
                <div className="bg-white rounded-xl rounded-tl-none px-3 py-2 text-xs text-[#111827] shadow-sm max-w-full">
                  <pre className="whitespace-pre-wrap font-sans leading-relaxed break-words">
                    {message || '메시지를 입력해주세요'}
                  </pre>
                </div>
              </div>
            </div>

            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={10}
              placeholder="메시지를 직접 입력하거나 템플릿을 선택해주세요"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#609966] resize-none font-mono"
            />
            <p className="text-[10px] text-[#6B7280] mt-1">템플릿 선택 후 직접 수정할 수 있습니다</p>
          </div>

          {/* 버튼 */}
          <div className="flex gap-3">
            <button
              onClick={handleCopy}
              disabled={!message.trim()}
              className={`flex-1 py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                copied
                  ? 'bg-[#111827] text-white'
                  : 'bg-gray-100 text-[#111827] hover:bg-gray-200 disabled:opacity-40'
              }`}
            >
              {copied ? '✓ 복사됨!' : '📋 복사하기'}
            </button>
            <button
              onClick={handleSend}
              disabled={!canSend}
              className={`flex-1 py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                sent
                  ? 'bg-[#4A7A50] text-white'
                  : 'bg-[#609966] text-white hover:bg-[#4A7A50] disabled:opacity-40 disabled:cursor-not-allowed'
              }`}
            >
              {sent ? '✓ 발송 완료!' : '📱 발송하기'}
            </button>
          </div>

          {sent && (
            <div className="bg-[#E8F5E9] rounded-xl p-4 text-sm text-[#4A7A50]">
              <p className="font-semibold mb-1">✅ 채팅방에 발송되었습니다</p>
              <p className="text-xs text-[#6B7280]">복사하기 후 채팅방에 직접 붙여넣기도 가능합니다</p>
            </div>
          )}

          <div className="bg-gray-50 rounded-xl p-4 text-xs text-[#6B7280] space-y-1">
            <p className="font-medium text-[#111827]">💡 사용 안내</p>
            <p>• <strong>복사하기</strong>: 메시지를 클립보드에 복사합니다</p>
            <p>• 카카오 오픈채팅방에 직접 붙여넣기 하세요</p>
            <p>• <strong>발송하기</strong>: 카카오 API 연동 시 자동 발송됩니다</p>
          </div>
        </div>
      </div>
    </div>
  );
}
