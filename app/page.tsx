import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F8FAF6] flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        {/* 로고 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="text-5xl">🥬</span>
            <h1 className="text-4xl font-bold text-[#111827]">온맘마켓</h1>
          </div>
          <p className="text-[#6B7280] text-lg">
            O2O 신선식품 공동구매 플랫폼 프로토타입
          </p>
        </div>

        {/* 앱 선택 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* 소비자 앱 */}
          <Link
            href="/consumer"
            className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="w-16 h-16 bg-[#E8F5E9] rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
              📱
            </div>
            <h2 className="text-xl font-bold text-[#111827] mb-2">소비자 앱</h2>
            <p className="text-[#6B7280] text-sm mb-4">
              공구 상품을 탐색하고 예약하세요
            </p>
            <ul className="text-sm text-[#6B7280] space-y-1">
              <li>• 공구 피드 (날짜/카테고리 필터)</li>
              <li>• 상품 예약하기</li>
              <li>• QR 픽업권 확인</li>
              <li>• 내 예약 관리</li>
            </ul>
            <div className="mt-4 text-[#609966] font-medium group-hover:underline">
              앱 실행하기 →
            </div>
          </Link>

          {/* 사장님 앱 */}
          <Link
            href="/store"
            className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="w-16 h-16 bg-[#E8F5E9] rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
              💼
            </div>
            <h2 className="text-xl font-bold text-[#111827] mb-2">사장님 앱</h2>
            <p className="text-[#6B7280] text-sm mb-4">
              예약을 관리하고 픽업을 처리하세요
            </p>
            <ul className="text-sm text-[#6B7280] space-y-1">
              <li>• 대시보드 (오늘 현황)</li>
              <li>• 예약 관리</li>
              <li>• QR 스캔 픽업</li>
              <li>• 상품 등록/관리</li>
            </ul>
            <div className="mt-4 text-[#609966] font-medium group-hover:underline">
              앱 실행하기 →
            </div>
          </Link>
        </div>

        {/* 연동 데모 */}
        <Link
          href="/demo"
          className="block bg-[#609966] text-white rounded-2xl p-6 text-center hover:bg-[#4A7A50] transition-colors"
        >
          <div className="flex items-center justify-center gap-4">
            <span className="text-3xl">⚡</span>
            <div>
              <h2 className="text-xl font-bold">연동 데모 보기</h2>
              <p className="text-white/80 text-sm mt-1">
                소비자 ↔ 사장님 실시간 연동 시연
              </p>
            </div>
          </div>
        </Link>

        {/* 프로젝트 정보 */}
        <div className="mt-12 text-center text-sm text-[#6B7280]">
          <p>온맘마켓의 핵심 사용자 경험을 직접 체험해보세요.</p>
          <p className="mt-1">소비자 예약부터 사장님의 QR 픽업 처리까지, 전체 플로우를 확인할 수 있습니다.</p>
        </div>
      </div>
    </div>
  );
}
