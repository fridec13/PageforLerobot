import apiClient from "./apiClient";

export interface Post {
  id: number;
  title: string;
  content: string;
  category: string;
  author: {
    id: number;
    username: string;
  };
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
}

export interface Comment {
  id: number;
  content: string;
  author: {
    id: number;
    username: string;
  };
  postId: number;
  createdAt: string;
  updatedAt: string;
  likeCount: number;
}

export type SortOrder = "latest" | "popular" | "views";

export interface PostListParams {
  page?: number;
  limit?: number;
  sort?: SortOrder;
  category?: string;
  search?: string;
}

/**
 * 게시글 목록 조회
 */
export const getPosts = async (params: PostListParams = {}) => {
  const { page = 1, limit = 10, sort = "latest", category, search } = params;
  
  try {
    const response = await apiClient.get("/community/posts", {
      params: { page, limit, sort, category, search }
    });
    return response.data;
  } catch (error) {
    console.error("게시글 목록 조회 오류:", error);
    throw error;
  }
};

/**
 * 인기 게시글 목록 조회
 */
export const getPopularPosts = async (limit = 3) => {
  try {
    const response = await apiClient.get("/community/posts/popular", {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    console.error("인기 게시글 조회 오류:", error);
    throw error;
  }
};

/**
 * 특정 게시글 상세 조회
 */
export const getPostById = async (id: number | string) => {
  try {
    const response = await apiClient.get(`/community/posts/${id}`);
    return response.data;
  } catch (error) {
    console.error(`게시글 ${id} 조회 오류:`, error);
    throw error;
  }
};

/**
 * 게시글 등록
 */
export const createPost = async (postData: Omit<Post, "id" | "author" | "createdAt" | "updatedAt" | "viewCount" | "likeCount" | "commentCount">) => {
  try {
    const response = await apiClient.post("/community/posts", postData);
    return response.data;
  } catch (error) {
    console.error("게시글 등록 오류:", error);
    throw error;
  }
};

/**
 * 게시글 수정
 */
export const updatePost = async (id: number | string, postData: Partial<Post>) => {
  try {
    const response = await apiClient.put(`/community/posts/${id}`, postData);
    return response.data;
  } catch (error) {
    console.error(`게시글 ${id} 수정 오류:`, error);
    throw error;
  }
};

/**
 * 게시글 삭제
 */
export const deletePost = async (id: number | string) => {
  try {
    const response = await apiClient.delete(`/community/posts/${id}`);
    return response.data;
  } catch (error) {
    console.error(`게시글 ${id} 삭제 오류:`, error);
    throw error;
  }
};

/**
 * 게시글 검색
 */
export const searchPosts = async (query: string, params: Omit<PostListParams, "search"> = {}) => {
  try {
    const response = await apiClient.get("/community/posts/search", {
      params: { ...params, query }
    });
    return response.data;
  } catch (error) {
    console.error("게시글 검색 오류:", error);
    throw error;
  }
};

/**
 * 게시글 좋아요
 */
export const likePost = async (id: number | string) => {
  try {
    const response = await apiClient.post(`/community/posts/${id}/like`);
    return response.data;
  } catch (error) {
    console.error(`게시글 ${id} 좋아요 오류:`, error);
    throw error;
  }
};

/**
 * 게시글 좋아요 취소
 */
export const unlikePost = async (id: number | string) => {
  try {
    const response = await apiClient.delete(`/community/posts/${id}/like`);
    return response.data;
  } catch (error) {
    console.error(`게시글 ${id} 좋아요 취소 오류:`, error);
    throw error;
  }
};

/**
 * 댓글 목록 조회
 */
export const getComments = async (postId: number | string, page = 1, limit = 20) => {
  try {
    const response = await apiClient.get(`/community/posts/${postId}/comments`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error(`게시글 ${postId}의 댓글 목록 조회 오류:`, error);
    throw error;
  }
};

/**
 * 댓글 등록
 */
export const createComment = async (postId: number | string, content: string) => {
  try {
    const response = await apiClient.post(`/community/posts/${postId}/comments`, { content });
    return response.data;
  } catch (error) {
    console.error("댓글 등록 오류:", error);
    throw error;
  }
};

/**
 * 댓글 삭제
 */
export const deleteComment = async (postId: number | string, commentId: number | string) => {
  try {
    const response = await apiClient.delete(`/community/posts/${postId}/comments/${commentId}`);
    return response.data;
  } catch (error) {
    console.error(`댓글 ${commentId} 삭제 오류:`, error);
    throw error;
  }
};

/**
 * 댓글 좋아요
 */
export const likeComment = async (postId: number | string, commentId: number | string) => {
  try {
    const response = await apiClient.post(`/community/posts/${postId}/comments/${commentId}/like`);
    return response.data;
  } catch (error) {
    console.error(`댓글 ${commentId} 좋아요 오류:`, error);
    throw error;
  }
};

/**
 * 댓글 좋아요 취소
 */
export const unlikeComment = async (postId: number | string, commentId: number | string) => {
  try {
    const response = await apiClient.delete(`/community/posts/${postId}/comments/${commentId}/like`);
    return response.data;
  } catch (error) {
    console.error(`댓글 ${commentId} 좋아요 취소 오류:`, error);
    throw error;
  }
};

const communityService = {
  getPosts,
  getPopularPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  searchPosts,
  likePost,
  unlikePost,
  getComments,
  createComment,
  deleteComment,
  likeComment,
  unlikeComment,
};

export default communityService; 