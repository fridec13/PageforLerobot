import apiClient from './apiClient';

export type Contributor = {
  id: string;
  name: string;
  username: string;
  contributions: number;
  level: string;
  avatar?: string;
  badgeCount?: number;
};

export type LeaderboardPeriod = 'all' | 'month' | 'week' | 'day';

const LEADERBOARD_API = '/api/leaderboard';

/**
 * 리더보드 관련 서비스 함수들
 */
const leaderboardService = {
  /**
   * 기여자 리더보드 조회
   * @param period 기간 (전체, 월, 주, 일)
   * @param page 페이지 번호 (기본값: 1)
   * @param limit 페이지당 항목 수 (기본값: 10)
   * @returns 기여자 목록과 페이지네이션 정보
   */
  async getContributors(period: LeaderboardPeriod = 'all', page = 1, limit = 10) {
    try {
      const response = await apiClient.get(`${LEADERBOARD_API}/contributors`, {
        params: { period, page, limit }
      });
      
      return {
        contributors: response.data.contributors,
        pagination: response.data.pagination
      };
    } catch (error) {
      console.error('기여자 조회 중 오류 발생:', error);
      throw error;
    }
  },

  /**
   * 특정 기여자 상세 정보 조회
   * @param id 기여자 ID
   * @returns 기여자 상세 정보
   */
  async getContributorDetail(id: string) {
    try {
      const response = await apiClient.get(`${LEADERBOARD_API}/contributors/${id}`);
      return response.data;
    } catch (error) {
      console.error('기여자 상세 정보 조회 중 오류 발생:', error);
      throw error;
    }
  },

  /**
   * 최근 활동이 많은 기여자 조회
   * @param limit 조회할 기여자 수 (기본값: 5)
   * @returns 활동이 많은 기여자 목록
   */
  async getMostActiveContributors(limit = 5) {
    try {
      const response = await apiClient.get(`${LEADERBOARD_API}/most-active`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('활동이 많은 기여자 조회 중 오류 발생:', error);
      throw error;
    }
  },

  /**
   * 특정 범주(위키, 문서, 포럼 등)의 기여자 조회
   * @param category 범주 (wiki, docs, forum 등)
   * @param limit 조회할 기여자 수 (기본값: 10)
   * @returns 범주별 기여자 목록
   */
  async getCategoryContributors(category: string, limit = 10) {
    try {
      const response = await apiClient.get(`${LEADERBOARD_API}/category/${category}`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error(`${category} 범주 기여자 조회 중 오류 발생:`, error);
      throw error;
    }
  },

  /**
   * 명예의 전당 기여자 목록 (API 연결 전 임시 데이터)
   * @returns 기여자 목록
   */
  getMockContributors(): Contributor[] {
    return [
      {
        id: "1",
        name: "기여자1",
        username: "contributor1",
        contributions: 156,
        level: "Sapiens",
        avatar: "https://api.dicebear.com/7.x/lorelei/svg?seed=contrib1"
      },
      {
        id: "2",
        name: "기여자2",
        username: "contributor2",
        contributions: 98,
        level: "Expert",
        avatar: "https://api.dicebear.com/7.x/lorelei/svg?seed=contrib2"
      },
      {
        id: "3",
        name: "기여자3",
        username: "contributor3",
        contributions: 75,
        level: "Researcher",
        avatar: "https://api.dicebear.com/7.x/lorelei/svg?seed=contrib3"
      },
      {
        id: "4",
        name: "기여자4",
        username: "contributor4",
        contributions: 62,
        level: "Master",
        avatar: "https://api.dicebear.com/7.x/lorelei/svg?seed=contrib4"
      },
      {
        id: "5",
        name: "기여자5",
        username: "contributor5",
        contributions: 47,
        level: "Advanced",
        avatar: "https://api.dicebear.com/7.x/lorelei/svg?seed=contrib5"
      },
      {
        id: "6",
        name: "기여자6",
        username: "contributor6",
        contributions: 32,
        level: "Regular",
        avatar: "https://api.dicebear.com/7.x/lorelei/svg?seed=contrib6"
      }
    ];
  }
};

export default leaderboardService; 