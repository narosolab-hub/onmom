"use client";

import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

// 더미 데이터
const weeklyRevenue = [
  { day: '월', revenue: 128000, reservations: 12 },
  { day: '화', revenue: 215000, reservations: 21 },
  { day: '수', revenue: 189000, reservations: 18 },
  { day: '목', revenue: 263000, reservations: 27 },
  { day: '금', revenue: 341000, reservations: 34 },
  { day: '토', revenue: 412000, reservations: 42 },
  { day: '일', revenue: 298000, reservations: 29 },
];

const monthlyRevenue = [
  { month: '10월', revenue: 2840000 },
  { month: '11월', revenue: 3120000 },
  { month: '12월', revenue: 4250000 },
  { month: '1월', revenue: 3680000 },
  { month: '2월', revenue: 4120000 },
  { month: '3월', revenue: 2960000 },
];

const categoryData = [
  { name: '과일', value: 35, color: '#609966' },
  { name: '식품', value: 25, color: '#4A7A50' },
  { name: '건강식품', value: 18, color: '#81C784' },
  { name: '베이커리', value: 12, color: '#A5D6A7' },
  { name: '정육', value: 7, color: '#C8E6C9' },
  { name: '생활용품', value: 3, color: '#E8F5E9' },
];

const topProducts = [
  { title: '애플청포도 (신선)', emoji: '🍇', revenue: 228000, count: 33 },
  { title: '다이어트쾌변 30포', emoji: '🌿', revenue: 955200, count: 48 },
  { title: '한우 불고기 500g', emoji: '🥩', revenue: 329000, count: 10 },
  { title: '제주 감귤 3kg', emoji: '🍊', revenue: 417200, count: 28 },
  { title: '크림볼 12개입', emoji: '🥐', revenue: 63200, count: 8 },
];

const customerStats = [
  { label: '신규 고객', value: '38명', sub: '이번 달', color: '#609966' },
  { label: '재방문 고객', value: '104명', sub: '이번 달', color: '#4A7A50' },
  { label: '평균 구매액', value: '₩18,400', sub: '1인 기준', color: '#81C784' },
  { label: '노쇼율', value: '3.2%', sub: '이번 달', color: '#FF5C38' },
];

function formatRevenue(value: number) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  return `${value}`;
}

export default function AnalyticsPage() {
  return (
    <div className="p-8">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#111827]">매출 분석</h1>
        <p className="text-[#6B7280] mt-1">2024년 3월 기준 (더미 데이터)</p>
      </div>

      {/* 고객 통계 카드 */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {customerStats.map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl shadow-sm p-5">
            <p className="text-sm text-[#6B7280] mb-1">{stat.label}</p>
            <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-xs text-[#6B7280] mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* 주간 매출 추이 */}
        <div className="col-span-2 bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-semibold text-[#111827] mb-1">이번 주 매출 추이</h2>
          <p className="text-xs text-[#6B7280] mb-4">일별 매출 및 예약 건수</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weeklyRevenue}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
              <XAxis dataKey="day" fontSize={12} tickLine={false} axisLine={false} tick={{ fill: '#6B7280' }} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} tick={{ fill: '#6B7280' }} tickFormatter={formatRevenue} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                formatter={(value, name) => [
                  name === 'revenue' ? `₩${Number(value).toLocaleString()}` : `${value}건`,
                  name === 'revenue' ? '매출' : '예약',
                ]}
              />
              <Legend formatter={(val) => val === 'revenue' ? '매출' : '예약 건수'} />
              <Line type="monotone" dataKey="revenue" stroke="#609966" strokeWidth={2.5} dot={{ fill: '#609966', r: 4 }} />
              <Line type="monotone" dataKey="reservations" stroke="#A5D6A7" strokeWidth={2} strokeDasharray="4 4" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 카테고리 비중 */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-semibold text-[#111827] mb-1">카테고리별 매출</h2>
          <p className="text-xs text-[#6B7280] mb-4">이번 달 기준</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, '비중']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {categoryData.map(cat => (
              <div key={cat.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-[#6B7280]">{cat.name}</span>
                </div>
                <span className="font-semibold text-[#111827]">{cat.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* 월간 매출 */}
        <div className="col-span-2 bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-semibold text-[#111827] mb-1">월간 매출 현황</h2>
          <p className="text-xs text-[#6B7280] mb-4">최근 6개월</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
              <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} tick={{ fill: '#6B7280' }} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} tick={{ fill: '#6B7280' }} tickFormatter={formatRevenue} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                formatter={(value) => [`₩${Number(value).toLocaleString()}`, '매출']}
              />
              <Bar dataKey="revenue" fill="#609966" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 인기 상품 Top 5 */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-semibold text-[#111827] mb-1">인기 상품 Top 5</h2>
          <p className="text-xs text-[#6B7280] mb-4">이번 달 예약 기준</p>
          <div className="space-y-3">
            {topProducts.map((product, idx) => (
              <div key={product.title} className="flex items-center gap-3">
                <span className="text-sm font-bold text-[#6B7280] w-4">{idx + 1}</span>
                <span className="text-lg">{product.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#111827] truncate">{product.title}</p>
                  <p className="text-xs text-[#6B7280]">{product.count}건 · ₩{product.revenue.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
