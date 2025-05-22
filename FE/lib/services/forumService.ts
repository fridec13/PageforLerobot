import apiClient from "./apiClient";

// Topics 인터페이스
export interface Topic {
  id: number;
  title: string;
  description: string;
  slug: string;
  postCount: number;
  followersCount: number;
  isFollowing?: boolean;
  createdAt: string;
  updatedAt: string;
}

// ForumPost 인터페이스
export interface ForumPost {
  id: number;
  title: string;
  content: string;
  topicId: number;
  author: {
    id: number;
    username: string;
    image?: string;
  };
  groupId?: number;
  likeCount: number;
  commentCount: number;
  viewCount: number;
  isLiked?: boolean;
  isPinned?: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

// ForumComment 인터페이스
export interface ForumComment {
  id: number;
  content: string;
  postId: number;
  author: {
    id: number;
    username: string;
    image?: string;
  };
  likeCount: number;
  isLiked?: boolean;
  parentId?: number;
  createdAt: string;
  updatedAt: string;
}

// ForumUser 인터페이스
export interface ForumUser {
  id: number;
  username: string;
  image?: string;
  bio?: string;
  postCount: number;
  commentCount: number;
  followersCount: number;
  followingCount: number;
  isFollowing?: boolean;
  joinedAt: string;
  badges: ForumBadge[];
}

// ForumBadge 인터페이스
export interface ForumBadge {
  id: number;
  name: string;
  description: string;
  image?: string;
  criteria?: string;
  categoryId?: number;
  createdAt: string;
}

// ForumGroup 인터페이스
export interface ForumGroup {
  id: number;
  name: string;
  description: string;
  slug: string;
  memberCount: number;
  isPrivate: boolean;
  isMember?: boolean;
  createdAt: string;
  updatedAt: string;
}

// 페이지네이션 인터페이스
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
}

// 검색 파라미터 인터페이스
export interface SearchParams extends PaginationParams {
  query?: string;
  tags?: string[];
  topicId?: number;
  groupId?: number;
  userId?: number;
}

/**
 * 포럼 주제 관련 API
 */
// 주제 목록 조회
export const getTopics = async (params: PaginationParams = {}) => {
  try {
    const { page = 1, limit = 20, sort = "popular" } = params;
    const response = await apiClient.get("/forum/topics", {
      params: { page, limit, sort }
    });
    return response.data;
  } catch (error) {
    console.error("주제 목록 조회 오류:", error);
    throw error;
  }
};

// 주제 상세 조회
export const getTopicDetail = async (slug: string) => {
  try {
    const response = await apiClient.get(`/forum/topics/${slug}`);
    return response.data;
  } catch (error) {
    console.error(`주제 ${slug} 조회 오류:`, error);
    throw error;
  }
};

// 주제 팔로우
export const followTopic = async (id: number) => {
  try {
    const response = await apiClient.post(`/forum/topics/${id}/follow`);
    return response.data;
  } catch (error) {
    console.error("주제 팔로우 오류:", error);
    throw error;
  }
};

// 주제 언팔로우
export const unfollowTopic = async (id: number) => {
  try {
    const response = await apiClient.delete(`/forum/topics/${id}/follow`);
    return response.data;
  } catch (error) {
    console.error("주제 언팔로우 오류:", error);
    throw error;
  }
};

/**
 * 포럼 게시글 관련 API
 */
// 게시글 목록 조회
export const getPosts = async (params: SearchParams = {}) => {
  try {
    const response = await apiClient.get("/forum/posts", { params });
    return response.data;
  } catch (error) {
    console.error("게시글 목록 조회 오류:", error);
    throw error;
  }
};

// 주제별 게시글 목록 조회
export const getPostsByTopic = async (slug: string, params: PaginationParams = {}) => {
  try {
    const response = await apiClient.get(`/forum/topics/${slug}/posts`, { params });
    return response.data;
  } catch (error) {
    console.error(`주제 ${slug}의 게시글 목록 조회 오류:`, error);
    throw error;
  }
};

// 게시글 상세 조회
export const getPostDetail = async (id: number) => {
  try {
    const response = await apiClient.get(`/forum/posts/${id}`);
    return response.data;
  } catch (error) {
    console.error(`게시글 ${id} 조회 오류:`, error);
    throw error;
  }
};

// 게시글 등록
export const createPost = async (postData: Partial<ForumPost>) => {
  try {
    const response = await apiClient.post("/forum/posts", postData);
    return response.data;
  } catch (error) {
    console.error("게시글 등록 오류:", error);
    throw error;
  }
};

// 게시글 수정
export const updatePost = async (id: number, postData: Partial<ForumPost>) => {
  try {
    const response = await apiClient.put(`/forum/posts/${id}`, postData);
    return response.data;
  } catch (error) {
    console.error(`게시글 ${id} 수정 오류:`, error);
    throw error;
  }
};

// 게시글 삭제
export const deletePost = async (id: number) => {
  try {
    const response = await apiClient.delete(`/forum/posts/${id}`);
    return response.data;
  } catch (error) {
    console.error(`게시글 ${id} 삭제 오류:`, error);
    throw error;
  }
};

// 게시글 좋아요
export const likePost = async (id: number) => {
  try {
    const response = await apiClient.post(`/forum/posts/${id}/like`);
    return response.data;
  } catch (error) {
    console.error(`게시글 ${id} 좋아요 오류:`, error);
    throw error;
  }
};

// 게시글 좋아요 취소
export const unlikePost = async (id: number) => {
  try {
    const response = await apiClient.delete(`/forum/posts/${id}/like`);
    return response.data;
  } catch (error) {
    console.error(`게시글 ${id} 좋아요 취소 오류:`, error);
    throw error;
  }
};

/**
 * 포럼 댓글 관련 API
 */
// 게시글 댓글 목록 조회
export const getComments = async (postId: number, params: PaginationParams = {}) => {
  try {
    const response = await apiClient.get(`/forum/posts/${postId}/comments`, { params });
    return response.data;
  } catch (error) {
    console.error(`게시글 ${postId}의 댓글 목록 조회 오류:`, error);
    throw error;
  }
};

// 댓글 등록
export const createComment = async (postId: number, content: string, parentId?: number) => {
  try {
    const response = await apiClient.post(`/forum/posts/${postId}/comments`, { 
      content,
      parentId
    });
    return response.data;
  } catch (error) {
    console.error("댓글 등록 오류:", error);
    throw error;
  }
};

// 댓글 수정
export const updateComment = async (postId: number, commentId: number, content: string) => {
  try {
    const response = await apiClient.put(`/forum/posts/${postId}/comments/${commentId}`, { content });
    return response.data;
  } catch (error) {
    console.error(`댓글 ${commentId} 수정 오류:`, error);
    throw error;
  }
};

// 댓글 삭제
export const deleteComment = async (postId: number, commentId: number) => {
  try {
    const response = await apiClient.delete(`/forum/posts/${postId}/comments/${commentId}`);
    return response.data;
  } catch (error) {
    console.error(`댓글 ${commentId} 삭제 오류:`, error);
    throw error;
  }
};

// 댓글 좋아요
export const likeComment = async (postId: number, commentId: number) => {
  try {
    const response = await apiClient.post(`/forum/posts/${postId}/comments/${commentId}/like`);
    return response.data;
  } catch (error) {
    console.error(`댓글 ${commentId} 좋아요 오류:`, error);
    throw error;
  }
};

// 댓글 좋아요 취소
export const unlikeComment = async (postId: number, commentId: number) => {
  try {
    const response = await apiClient.delete(`/forum/posts/${postId}/comments/${commentId}/like`);
    return response.data;
  } catch (error) {
    console.error(`댓글 ${commentId} 좋아요 취소 오류:`, error);
    throw error;
  }
};

/**
 * 포럼 사용자 관련 API
 */
// 사용자 목록 조회
export const getUsers = async (params: PaginationParams = {}) => {
  try {
    const response = await apiClient.get("/forum/users", { params });
    return response.data;
  } catch (error) {
    console.error("사용자 목록 조회 오류:", error);
    throw error;
  }
};

// 사용자 상세 정보 조회
export const getUserDetail = async (username: string) => {
  try {
    const response = await apiClient.get(`/forum/users/${username}`);
    return response.data;
  } catch (error) {
    console.error(`사용자 ${username} 조회 오류:`, error);
    throw error;
  }
};

// 사용자 게시글 목록 조회
export const getUserPosts = async (username: string, params: PaginationParams = {}) => {
  try {
    const response = await apiClient.get(`/forum/users/${username}/posts`, { params });
    return response.data;
  } catch (error) {
    console.error(`사용자 ${username}의 게시글 목록 조회 오류:`, error);
    throw error;
  }
};

// 사용자 댓글 목록 조회
export const getUserComments = async (username: string, params: PaginationParams = {}) => {
  try {
    const response = await apiClient.get(`/forum/users/${username}/comments`, { params });
    return response.data;
  } catch (error) {
    console.error(`사용자 ${username}의 댓글 목록 조회 오류:`, error);
    throw error;
  }
};

// 사용자 팔로우
export const followUser = async (username: string) => {
  try {
    const response = await apiClient.post(`/forum/users/${username}/follow`);
    return response.data;
  } catch (error) {
    console.error(`사용자 ${username} 팔로우 오류:`, error);
    throw error;
  }
};

// 사용자 언팔로우
export const unfollowUser = async (username: string) => {
  try {
    const response = await apiClient.delete(`/forum/users/${username}/follow`);
    return response.data;
  } catch (error) {
    console.error(`사용자 ${username} 언팔로우 오류:`, error);
    throw error;
  }
};

/**
 * 포럼 배지 관련 API
 */
// 배지 목록 조회
export const getBadges = async (params: PaginationParams = {}) => {
  try {
    const response = await apiClient.get("/forum/badges", { params });
    return response.data;
  } catch (error) {
    console.error("배지 목록 조회 오류:", error);
    throw error;
  }
};

// 배지 상세 조회
export const getBadgeDetail = async (id: number) => {
  try {
    const response = await apiClient.get(`/forum/badges/${id}`);
    return response.data;
  } catch (error) {
    console.error(`배지 ${id} 조회 오류:`, error);
    throw error;
  }
};

// 배지를 획득한 사용자 목록 조회
export const getBadgeUsers = async (id: number, params: PaginationParams = {}) => {
  try {
    const response = await apiClient.get(`/forum/badges/${id}/users`, { params });
    return response.data;
  } catch (error) {
    console.error(`배지 ${id}를 획득한 사용자 목록 조회 오류:`, error);
    throw error;
  }
};

/**
 * 포럼 그룹 관련 API
 */
// 그룹 목록 조회
export const getGroups = async (params: PaginationParams = {}) => {
  try {
    const response = await apiClient.get("/forum/groups", { params });
    return response.data;
  } catch (error) {
    console.error("그룹 목록 조회 오류:", error);
    throw error;
  }
};

// 그룹 상세 조회
export const getGroupDetail = async (slug: string) => {
  try {
    const response = await apiClient.get(`/forum/groups/${slug}`);
    return response.data;
  } catch (error) {
    console.error(`그룹 ${slug} 조회 오류:`, error);
    throw error;
  }
};

// 그룹 게시글 목록 조회
export const getGroupPosts = async (slug: string, params: PaginationParams = {}) => {
  try {
    const response = await apiClient.get(`/forum/groups/${slug}/posts`, { params });
    return response.data;
  } catch (error) {
    console.error(`그룹 ${slug}의 게시글 목록 조회 오류:`, error);
    throw error;
  }
};

// 그룹 멤버 목록 조회
export const getGroupMembers = async (slug: string, params: PaginationParams = {}) => {
  try {
    const response = await apiClient.get(`/forum/groups/${slug}/members`, { params });
    return response.data;
  } catch (error) {
    console.error(`그룹 ${slug}의 멤버 목록 조회 오류:`, error);
    throw error;
  }
};

// 그룹 가입
export const joinGroup = async (slug: string) => {
  try {
    const response = await apiClient.post(`/forum/groups/${slug}/join`);
    return response.data;
  } catch (error) {
    console.error(`그룹 ${slug} 가입 오류:`, error);
    throw error;
  }
};

// 그룹 탈퇴
export const leaveGroup = async (slug: string) => {
  try {
    const response = await apiClient.delete(`/forum/groups/${slug}/leave`);
    return response.data;
  } catch (error) {
    console.error(`그룹 ${slug} 탈퇴 오류:`, error);
    throw error;
  }
};

/**
 * 포럼 검색 관련 API
 */
// 포럼 전체 검색
export const searchForum = async (query: string, params: SearchParams = {}) => {
  try {
    const response = await apiClient.get("/forum/search", {
      params: { query, ...params }
    });
    return response.data;
  } catch (error) {
    console.error("포럼 검색 오류:", error);
    throw error;
  }
};

// 전체 서비스 객체 생성
const forumService = {
  // 주제
  getTopics,
  getTopicDetail,
  followTopic,
  unfollowTopic,
  
  // 게시글
  getPosts,
  getPostsByTopic,
  getPostDetail,
  createPost,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  
  // 댓글
  getComments,
  createComment,
  updateComment,
  deleteComment,
  likeComment,
  unlikeComment,
  
  // 사용자
  getUsers,
  getUserDetail,
  getUserPosts,
  getUserComments,
  followUser,
  unfollowUser,
  
  // 배지
  getBadges,
  getBadgeDetail,
  getBadgeUsers,
  
  // 그룹
  getGroups,
  getGroupDetail,
  getGroupPosts,
  getGroupMembers,
  joinGroup,
  leaveGroup,
  
  // 검색
  searchForum
};

export default forumService; 