import { Market } from './types';

export const markets: Market[] = [
  {
    id: 1,
    name: "온맘마켓 일산점",
    emoji: "🥬",
    area: "일산동구",
    address: "경기도 고양시 일산동구 중앙로 1234, 1층",
    followers: 142,
    coordinates: {
      lat: 37.6583,
      lng: 126.7684,
    },
  },
  {
    id: 2,
    name: "소도몰 인하대역점",
    emoji: "🍎",
    area: "인천 미추홀구",
    address: "인천광역시 미추홀구 인하로 100, 지하1층",
    followers: 89,
    coordinates: {
      lat: 37.4507,
      lng: 126.6574,
    },
  },
];
