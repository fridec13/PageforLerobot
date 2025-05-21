const GuestbookModel = require('../models/guestbook.model');

/**
 * 방명록 컨트롤러
 */
const GuestbookController = {
  /**
   * 모든 방명록 항목 조회
   * @param {Object} req 요청 객체
   * @param {Object} res 응답 객체
   */
  async getEntries(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      
      // 관리자인 경우 승인되지 않은 항목도 포함
      const includeUnapproved = req.user && req.user.role === 'ADMIN';
      
      const result = await GuestbookModel.findAll({ 
        page, 
        limit, 
        includeUnapproved 
      });
      
      res.status(200).json(result);
    } catch (error) {
      console.error('방명록 조회 오류:', error);
      res.status(500).json({ message: '방명록을 조회하는 중 오류가 발생했습니다.' });
    }
  },
  
  /**
   * 방명록 항목 생성
   * @param {Object} req 요청 객체
   * @param {Object} res 응답 객체
   */
  async createEntry(req, res) {
    try {
      const { content } = req.body;
      
      if (!content || content.trim().length === 0) {
        return res.status(400).json({ message: '내용을 입력해주세요.' });
      }
      
      // 사용자가 로그인한 경우 ID 사용, 아니면 익명
      const userId = req.user ? req.user.id : null;
      
      const newEntry = await GuestbookModel.create({
        content,
        userId
      });
      
      // 사용자 정보 가공 - 익명 사용자 경우 처리
      const formattedEntry = {
        id: newEntry.id,
        content: newEntry.content,
        date: newEntry.createdAt,
        name: userId && newEntry.user ? newEntry.user.name : '익명',
        userImage: userId && newEntry.user ? newEntry.user.image : null
      };
      
      res.status(201).json(formattedEntry);
    } catch (error) {
      console.error('방명록 작성 오류:', error);
      res.status(500).json({ message: '방명록을 작성하는 중 오류가 발생했습니다.' });
    }
  },
  
  /**
   * 방명록 항목 삭제 (작성자 또는 관리자만 가능)
   * @param {Object} req 요청 객체
   * @param {Object} res 응답 객체
   */
  async deleteEntry(req, res) {
    try {
      const { id } = req.params;
      
      // 삭제하려는 항목 조회
      const entry = await GuestbookModel.findById(id);
      
      if (!entry) {
        return res.status(404).json({ message: '존재하지 않는 방명록입니다.' });
      }
      
      // 본인 작성 또는 관리자 권한 확인
      if (
        !req.user || 
        (entry.userId !== req.user.id && req.user.role !== 'ADMIN')
      ) {
        return res.status(403).json({ message: '방명록 삭제 권한이 없습니다.' });
      }
      
      await GuestbookModel.delete(id);
      
      res.status(200).json({ message: '방명록이 삭제되었습니다.' });
    } catch (error) {
      console.error('방명록 삭제 오류:', error);
      res.status(500).json({ message: '방명록을 삭제하는 중 오류가 발생했습니다.' });
    }
  },
  
  /**
   * 방명록 승인 상태 변경 (관리자 전용)
   * @param {Object} req 요청 객체
   * @param {Object} res 응답 객체
   */
  async updateApproval(req, res) {
    try {
      const { id } = req.params;
      const { isApproved } = req.body;
      
      // 관리자 권한 확인
      if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: '관리자만 이용할 수 있는 기능입니다.' });
      }
      
      if (typeof isApproved !== 'boolean') {
        return res.status(400).json({ message: '승인 상태는 boolean 값이어야 합니다.' });
      }
      
      // 항목 존재 여부 확인
      const entry = await GuestbookModel.findById(id);
      
      if (!entry) {
        return res.status(404).json({ message: '존재하지 않는 방명록입니다.' });
      }
      
      // 승인 상태 업데이트
      const updatedEntry = await GuestbookModel.updateApprovalStatus(id, isApproved);
      
      res.status(200).json({ 
        message: `방명록이 ${isApproved ? '승인' : '숨김'} 처리되었습니다.`,
        entry: {
          id: updatedEntry.id,
          isApproved: updatedEntry.isApproved
        }
      });
    } catch (error) {
      console.error('방명록 승인 상태 변경 오류:', error);
      res.status(500).json({ message: '방명록 상태를 변경하는 중 오류가 발생했습니다.' });
    }
  }
};

module.exports = GuestbookController; 