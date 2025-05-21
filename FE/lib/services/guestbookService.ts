import apiClient from './apiClient';

export type GuestbookEntry = {
  id: string;
  name: string;
  content: string;
  date: Date;
  userId?: string;
};

export type CreateGuestbookEntry = {
  content: string;
};

const GUESTBOOK_API = '/api/guestbook';

/**
 * 방명록 관련 서비스 함수들
 */
const guestbookService = {
  /**
   * 모든 방명록 항목 조회
   * @param page 페이지 번호 (기본값: 1)
   * @param limit 페이지당 항목 수 (기본값: 10)
   * @returns 방명록 항목 목록과 페이지네이션 정보
   */
  async getEntries(page = 1, limit = 10) {
    try {
      const response = await apiClient.get(`${GUESTBOOK_API}`, {
        params: { page, limit }
      });
      
      // 날짜 문자열을 Date 객체로 변환
      const entries = response.data.entries.map((entry: any) => ({
        ...entry,
        date: new Date(entry.date)
      }));
      
      return {
        entries,
        pagination: response.data.pagination
      };
    } catch (error) {
      console.error('방명록 조회 중 오류 발생:', error);
      throw error;
    }
  },

  /**
   * 새 방명록 항목 작성
   * @param entry 작성할 방명록 내용
   * @returns 생성된 방명록 항목
   */
  async createEntry(entry: CreateGuestbookEntry) {
    try {
      const response = await apiClient.post(`${GUESTBOOK_API}`, entry);
      return {
        ...response.data,
        date: new Date(response.data.date)
      };
    } catch (error) {
      console.error('방명록 작성 중 오류 발생:', error);
      throw error;
    }
  },

  /**
   * 방명록 항목 삭제
   * @param id 삭제할 방명록 ID
   * @returns 삭제 결과
   */
  async deleteEntry(id: string) {
    try {
      const response = await apiClient.delete(`${GUESTBOOK_API}/${id}`);
      return response.data;
    } catch (error) {
      console.error('방명록 삭제 중 오류 발생:', error);
      throw error;
    }
  },

  /**
   * 최근 방명록 항목 가져오기 (API 연결 전 임시 데이터)
   * @returns 방명록 항목 목록
   */
  getMockEntries(): GuestbookEntry[] {
    return [
      {
        id: "1",
        name: "방문자1",
        content: "멋진 사이트네요! 로봇 관련 지식을 얻을 수 있어 좋습니다.",
        date: new Date(2023, 4, 15)
      },
      {
        id: "2",
        name: "방문자2",
        content: "RoboDK 문서가 큰 도움이 되었습니다. 감사합니다!",
        date: new Date(2023, 4, 20)
      },
      {
        id: "3",
        name: "방문자3",
        content: "위키 정보가 정말 유용해요. 앞으로도 자주 방문할게요.",
        date: new Date(2023, 5, 5)
      }
    ];
  }
};

export default guestbookService; 