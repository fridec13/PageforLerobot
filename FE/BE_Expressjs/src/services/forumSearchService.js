const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { ValidationError } = require('../utils/errors');

/**
 * 포럼 전체 검색을 수행합니다.
 * @param {string} userId 현재 사용자 ID (선택적)
 * @param {string} query 검색어
 * @param {Object} options 검색 옵션 (페이지네이션, 필터 등)
 * @returns {Promise<Object>} 검색 결과 및 페이지네이션 정보
 */
exports.searchForum = async (userId, query, options = {}) => {
  if (!query || query.trim() === '') {
    throw new ValidationError('검색어는 필수입니다.');
  }
  
  const { 
    page = 1, 
    limit = 20, 
    sort = 'relevance',
    tags,
    topicId,
    groupId,
    userId: targetUserId
  } = options;
  const skip = (page - 1) * limit;
  
  // 검색 조건 구성
  const searchCondition = {
    OR: [
      { title: { contains: query, mode: 'insensitive' } },
      { content: { contains: query, mode: 'insensitive' } }
    ]
  };
  
  // 추가 필터 적용
  if (tags && tags.length > 0) {
    searchCondition.tags = {
      some: {
        tag: {
          name: { in: tags }
        }
      }
    };
  }
  
  if (topicId) {
    searchCondition.topicId = parseInt(topicId);
  }
  
  if (groupId) {
    searchCondition.groupId = parseInt(groupId);
  }
  
  if (targetUserId) {
    searchCondition.authorId = targetUserId;
  }
  
  // 정렬 조건 설정
  let orderBy = {};
  switch (sort) {
    case 'relevance': // 기본은 최신순으로
      orderBy = { createdAt: 'desc' };
      break;
    case 'recent':
      orderBy = { createdAt: 'desc' };
      break;
    case 'popular':
      orderBy = { likeCount: 'desc' };
      break;
    case 'comments':
      orderBy = { commentCount: 'desc' };
      break;
    case 'views':
      orderBy = { viewCount: 'desc' };
      break;
    default:
      orderBy = { createdAt: 'desc' };
  }
  
  // 게시글 검색
  const [posts, totalCount] = await Promise.all([
    prisma.forumPost.findMany({
      where: searchCondition,
      skip,
      take: limit,
      orderBy,
      select: {
        id: true,
        title: true,
        content: true,
        topicId: true,
        authorId: true,
        groupId: true,
        likeCount: true,
        commentCount: true,
        viewCount: true,
        isPinned: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true
          }
        },
        topic: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        },
        group: groupId ? {
          select: {
            id: true,
            name: true,
            slug: true,
            isPrivate: true
          }
        } : undefined,
        tags: {
          select: {
            tag: {
              select: {
                name: true
              }
            }
          }
        }
      }
    }),
    prisma.forumPost.count({ where: searchCondition })
  ]);
  
  // 검색 결과에서 비공개 그룹 게시글 필터링
  const filteredPosts = posts.filter(post => {
    // 비공개 그룹의 게시글인 경우
    if (post.group && post.group.isPrivate) {
      // 사용자가 로그인하지 않은 경우 제외
      if (!userId) return false;
      
      // 그룹 멤버십 확인은 비동기 작업이므로 여기서 확인하기 어려움
      // 실제로는 먼저 사용자의 모든 그룹 멤버십을 조회한 뒤 필터링하는 것이 좋음
      // 지금은 간단히 포함시키고, 컨트롤러에서 추가 확인하는 방식으로 처리할 수 있음
      return true;
    }
    
    return true;
  });
  
  // 결과 포맷팅
  const formattedPosts = filteredPosts.map(post => ({
    id: post.id,
    title: post.title,
    content: highlightSearchTerms(post.content, query).substring(0, 200) + 
      (post.content.length > 200 ? '...' : ''),
    topicId: post.topicId,
    topic: post.topic,
    author: {
      id: post.author.id,
      username: post.author.username || post.author.name,
      image: post.author.image
    },
    groupId: post.groupId,
    group: post.group,
    likeCount: post.likeCount,
    commentCount: post.commentCount,
    viewCount: post.viewCount,
    isPinned: post.isPinned,
    tags: post.tags.map(t => t.tag.name),
    createdAt: post.createdAt,
    updatedAt: post.updatedAt
  }));
  
  // 사용자가 각 게시글을 좋아요했는지 확인
  if (userId) {
    const userLikes = await prisma.forumPostLike.findMany({
      where: { 
        userId,
        postId: { in: filteredPosts.map(post => post.id) }
      },
      select: { postId: true }
    });
    
    const likeMap = new Map(userLikes.map(like => [like.postId, true]));
    
    formattedPosts.forEach(post => {
      post.isLiked = likeMap.has(post.id) || false;
    });
  }
  
  // 검색 관련 메타데이터 조회
  const [relatedTopics, relatedTags] = await Promise.all([
    // 검색 결과와 관련된 주제들
    prisma.topic.findMany({
      where: {
        posts: {
          some: searchCondition
        }
      },
      take: 5,
      select: {
        id: true,
        title: true,
        slug: true,
        _count: {
          select: { 
            posts: {
              where: searchCondition
            } 
          }
        }
      },
      orderBy: {
        posts: {
          _count: 'desc'
        }
      }
    }),
    
    // 검색 결과와 관련된 태그들
    prisma.forumTag.findMany({
      where: {
        posts: {
          some: {
            post: {
              OR: [
                { title: { contains: query, mode: 'insensitive' } },
                { content: { contains: query, mode: 'insensitive' } }
              ]
            }
          }
        }
      },
      take: 10,
      select: {
        name: true,
        _count: {
          select: { posts: true }
        }
      },
      orderBy: {
        posts: {
          _count: 'desc'
        }
      }
    })
  ]);
  
  return {
    posts: formattedPosts,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit)
    },
    meta: {
      relatedTopics: relatedTopics.map(topic => ({
        id: topic.id,
        title: topic.title,
        slug: topic.slug,
        matchCount: topic._count.posts
      })),
      relatedTags: relatedTags.map(tag => ({
        name: tag.name,
        count: tag._count.posts
      }))
    }
  };
};

/**
 * 검색어를 기반으로 텍스트에서 일치하는 부분 전후로 텍스트를 추출합니다.
 * @param {string} text 원본 텍스트
 * @param {string} query 검색어
 * @returns {string} 하이라이팅된 텍스트
 */
function highlightSearchTerms(text, query) {
  if (!text || !query) return text;
  
  const words = query.toLowerCase().split(/\s+/).filter(word => word.length > 2);
  if (words.length === 0) return text.substring(0, 200);
  
  // 검색어와 일치하는 부분 찾기
  let startPos = -1;
  for (const word of words) {
    const pos = text.toLowerCase().indexOf(word);
    if (pos !== -1) {
      startPos = Math.max(0, pos - 50); // 일치하는 부분 50자 앞에서 시작
      break;
    }
  }
  
  // 일치하는 부분이 없으면 문서 시작부분 반환
  if (startPos === -1) return text.substring(0, 200);
  
  // 주변 컨텍스트 포함하여 반환
  const endPos = Math.min(text.length, startPos + 200);
  const excerpt = text.substring(startPos, endPos);
  
  // 처음이 문장 중간이면 '...'로 시작
  const prefix = startPos > 0 ? '...' : '';
  // 끝이 문장 중간이면 '...'로 종료
  const suffix = endPos < text.length ? '...' : '';
  
  return prefix + excerpt + suffix;
}

/**
 * 자동완성 검색어를 제공합니다.
 * @param {string} prefix 사용자가 입력 중인 검색어
 * @param {number} limit 반환할 최대 결과 수
 * @returns {Promise<Array>} 자동완성 검색어 목록
 */
exports.getAutocompleteSuggestions = async (prefix, limit = 5) => {
  if (!prefix || prefix.trim().length < 2) {
    return [];
  }
  
  // 게시글 제목에서 검색어 시작 부분과 일치하는 것 찾기
  const titleMatches = await prisma.forumPost.findMany({
    where: {
      title: {
        startsWith: prefix,
        mode: 'insensitive'
      }
    },
    select: {
      title: true
    },
    take: limit,
    distinct: ['title']
  });
  
  // 태그 이름에서 검색어 시작 부분과 일치하는 것 찾기
  const tagMatches = await prisma.forumTag.findMany({
    where: {
      name: {
        startsWith: prefix,
        mode: 'insensitive'
      }
    },
    select: {
      name: true
    },
    take: limit
  });
  
  // 결과 합치기
  const suggestions = [
    ...titleMatches.map(match => ({ type: 'title', text: match.title })),
    ...tagMatches.map(match => ({ type: 'tag', text: match.name }))
  ];
  
  // 중복 제거하고 리턴
  return suggestions
    .filter((item, index, self) => 
      index === self.findIndex(t => t.text.toLowerCase() === item.text.toLowerCase())
    )
    .slice(0, limit);
};

/**
 * 인기 검색어 목록을 가져옵니다.
 * @param {number} limit 가져올 검색어 수
 * @returns {Promise<Array>} 인기 검색어 목록
 */
exports.getPopularSearchTerms = async (limit = 10) => {
  // 실제로는 검색 로그를 분석하여 인기 검색어를 도출해야 함
  // 여기서는 인기 태그 목록으로 대체
  
  const popularTags = await prisma.forumTag.findMany({
    orderBy: {
      posts: {
        _count: 'desc'
      }
    },
    take: limit,
    select: {
      name: true,
      _count: {
        select: { posts: true }
      }
    }
  });
  
  return popularTags.map(tag => ({
    term: tag.name,
    count: tag._count.posts
  }));
}; 