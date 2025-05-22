// 역할 상수
export const ROLES = {
  ADMIN: 'ADMIN',
  MODERATOR: 'MODERATOR',
  USER: 'USER',
} as const;

// 칭호 획득 조건
export const TITLES = {
  NEWCOMER: { name: '새싹', requiredContributions: 0 },
  CONTRIBUTOR: { name: '기여자', requiredContributions: 5 },
  EXPERT: { name: '전문가', requiredContributions: 20 },
  MASTER: { name: '마스터', requiredContributions: 50 },
  SSAFYENS: { name: 'SSAFYENS', manualGrantOnly: true },
} as const;

// 기여에 따른 칭호 획득
export function getTitleByContributions(count: number): string {
  if (count >= TITLES.MASTER.requiredContributions) return TITLES.MASTER.name;
  if (count >= TITLES.EXPERT.requiredContributions) return TITLES.EXPERT.name;
  if (count >= TITLES.CONTRIBUTOR.requiredContributions) return TITLES.CONTRIBUTOR.name;
  return TITLES.NEWCOMER.name;
} 