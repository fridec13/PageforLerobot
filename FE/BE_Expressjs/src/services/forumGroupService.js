const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { NotFoundError, ForbiddenError, ValidationError } = require('../utils/errors');

/**
 * 그룹 목록을 조회합니다.
 * @param {string} userId 현재 사용자 ID (선택적)
 * @param {Object} options 페이지네이션 옵션
 * @returns {Promise<Object>} 그룹 목록과 페이지네이션 정보
 */
exports.getGroups = async (userId, options = {}) => {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;
  
  // 그룹 목록 조회
  const [groups, totalCount] = await Promise.all([
    prisma.forumGroup.findMany({
      skip,
      take: limit,
      orderBy: [
        { memberCount: 'desc' },
        { name: 'asc' }
      ],
      select: {
        id: true,
        name: true,
        description: true,
        slug: true,
        memberCount: true,
        isPrivate: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            posts: true
          }
        }
      }
    }),
    prisma.forumGroup.count()
  ]);
  
  // 결과 포맷팅
  const formattedGroups = groups.map(group => ({
    id: group.id,
    name: group.name,
    description: group.description,
    slug: group.slug,
    memberCount: group.memberCount,
    isPrivate: group.isPrivate,
    postsCount: group._count.posts,
    createdAt: group.createdAt,
    updatedAt: group.updatedAt
  }));
  
  // 로그인한 사용자가 각 그룹의 멤버인지 확인
  if (userId) {
    const userMemberships = await prisma.groupMember.findMany({
      where: { 
        userId,
        groupId: { in: groups.map(group => group.id) }
      },
      select: { 
        groupId: true,
        role: true
      }
    });
    
    const membershipMap = new Map(userMemberships.map(m => [m.groupId, { isMember: true, role: m.role }]));
    
    formattedGroups.forEach(group => {
      const membership = membershipMap.get(group.id);
      group.isMember = !!membership;
      group.memberRole = membership ? membership.role : null;
    });
  }
  
  return {
    groups: formattedGroups,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit)
    }
  };
};

/**
 * 특정 그룹의 상세 정보를 조회합니다.
 * @param {string} userId 현재 사용자 ID (선택적)
 * @param {string} slug 그룹 슬러그
 * @returns {Promise<Object>} 그룹 상세 정보
 */
exports.getGroupDetail = async (userId, slug) => {
  // 그룹 정보 조회
  const group = await prisma.forumGroup.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      description: true,
      slug: true,
      memberCount: true,
      isPrivate: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          posts: true
        }
      }
    }
  });
  
  if (!group) {
    throw new NotFoundError('그룹을 찾을 수 없습니다.');
  }
  
  // 결과 포맷팅
  const formattedGroup = {
    id: group.id,
    name: group.name,
    description: group.description,
    slug: group.slug,
    memberCount: group.memberCount,
    isPrivate: group.isPrivate,
    postsCount: group._count.posts,
    createdAt: group.createdAt,
    updatedAt: group.updatedAt
  };
  
  // 로그인한 사용자의 그룹 멤버십 확인
  if (userId) {
    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: group.id,
          userId
        }
      },
      select: { role: true }
    });
    
    formattedGroup.isMember = !!membership;
    formattedGroup.memberRole = membership ? membership.role : null;
  }
  
  // 최근 가입한 멤버 5명 조회
  const recentMembers = await prisma.groupMember.findMany({
    where: { groupId: group.id },
    orderBy: { joinedAt: 'desc' },
    take: 5,
    select: {
      role: true,
      joinedAt: true,
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true
        }
      }
    }
  });
  
  formattedGroup.recentMembers = recentMembers.map(member => ({
    user: {
      id: member.user.id,
      username: member.user.username || member.user.name,
      image: member.user.image
    },
    role: member.role,
    joinedAt: member.joinedAt
  }));
  
  return formattedGroup;
};

/**
 * 그룹의 게시글 목록을 조회합니다.
 * @param {string} userId 현재 사용자 ID (선택적)
 * @param {string} slug 그룹 슬러그
 * @param {Object} options 페이지네이션 옵션
 * @returns {Promise<Object>} 게시글 목록과 페이지네이션 정보
 */
exports.getGroupPosts = async (userId, slug, options = {}) => {
  // 그룹 정보 조회
  const group = await prisma.forumGroup.findUnique({
    where: { slug },
    select: { 
      id: true,
      isPrivate: true
    }
  });
  
  if (!group) {
    throw new NotFoundError('그룹을 찾을 수 없습니다.');
  }
  
  // 비공개 그룹인 경우 접근 권한 확인
  if (group.isPrivate) {
    if (!userId) {
      throw new ForbiddenError('비공개 그룹의 게시글에 접근할 권한이 없습니다.');
    }
    
    const isMember = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: group.id,
          userId
        }
      }
    });
    
    if (!isMember) {
      throw new ForbiddenError('비공개 그룹의 게시글에 접근할 권한이 없습니다.');
    }
  }
  
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;
  
  // 게시글 목록 조회
  const [posts, totalCount] = await Promise.all([
    prisma.forumPost.findMany({
      where: { groupId: group.id },
      skip,
      take: limit,
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' }
      ],
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
    prisma.forumPost.count({
      where: { groupId: group.id }
    })
  ]);
  
  // 결과 포맷팅
  const formattedPosts = posts.map(post => ({
    id: post.id,
    title: post.title,
    content: post.content.substring(0, 200) + (post.content.length > 200 ? '...' : ''),
    topicId: post.topicId,
    topic: post.topic,
    author: {
      id: post.author.id,
      username: post.author.username || post.author.name,
      image: post.author.image
    },
    groupId: post.groupId,
    likeCount: post.likeCount,
    commentCount: post.commentCount,
    viewCount: post.viewCount,
    isPinned: post.isPinned,
    tags: post.tags.map(t => t.tag.name),
    createdAt: post.createdAt,
    updatedAt: post.updatedAt
  }));
  
  // 로그인한 사용자가 각 게시글을 좋아요했는지 확인
  if (userId) {
    const userLikes = await prisma.forumPostLike.findMany({
      where: { 
        userId,
        postId: { in: posts.map(post => post.id) }
      },
      select: { postId: true }
    });
    
    const likeMap = new Map(userLikes.map(like => [like.postId, true]));
    
    formattedPosts.forEach(post => {
      post.isLiked = likeMap.has(post.id) || false;
    });
  }
  
  return {
    posts: formattedPosts,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit)
    }
  };
};

/**
 * 그룹 멤버 목록을 조회합니다.
 * @param {string} slug 그룹 슬러그
 * @param {Object} options 페이지네이션 옵션
 * @returns {Promise<Object>} 멤버 목록과 페이지네이션 정보
 */
exports.getGroupMembers = async (slug, options = {}) => {
  // 그룹 정보 조회
  const group = await prisma.forumGroup.findUnique({
    where: { slug },
    select: { id: true }
  });
  
  if (!group) {
    throw new NotFoundError('그룹을 찾을 수 없습니다.');
  }
  
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;
  
  // 멤버 목록 조회
  const [members, totalCount] = await Promise.all([
    prisma.groupMember.findMany({
      where: { groupId: group.id },
      skip,
      take: limit,
      orderBy: [
        { 
          role: {
            sort: 'asc',
            nulls: 'last'
          }
        },
        { joinedAt: 'desc' }
      ],
      select: {
        role: true,
        joinedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            title: true
          }
        }
      }
    }),
    prisma.groupMember.count({
      where: { groupId: group.id }
    })
  ]);
  
  // 결과 포맷팅
  const formattedMembers = members.map(member => ({
    user: {
      id: member.user.id,
      username: member.user.username || member.user.name,
      image: member.user.image,
      bio: member.user.title
    },
    role: member.role,
    joinedAt: member.joinedAt
  }));
  
  return {
    members: formattedMembers,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit)
    }
  };
};

/**
 * 그룹에 가입합니다.
 * @param {string} userId 사용자 ID
 * @param {string} slug 그룹 슬러그
 * @returns {Promise<Object>} 결과 객체
 */
exports.joinGroup = async (userId, slug) => {
  // 그룹 정보 조회
  const group = await prisma.forumGroup.findUnique({
    where: { slug },
    select: { 
      id: true,
      name: true,
      isPrivate: true
    }
  });
  
  if (!group) {
    throw new NotFoundError('그룹을 찾을 수 없습니다.');
  }
  
  // 비공개 그룹인 경우 가입 제한 (초대 필요하도록 설정)
  if (group.isPrivate) {
    throw new ForbiddenError('비공개 그룹은 관리자의 초대가 필요합니다.');
  }
  
  // 이미 가입한 경우
  const existingMembership = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId: group.id,
        userId
      }
    }
  });
  
  if (existingMembership) {
    return { 
      isMember: true, 
      message: '이미 그룹에 가입되어 있습니다.' 
    };
  }
  
  // 그룹 가입 트랜잭션
  await prisma.$transaction([
    // 멤버 추가
    prisma.groupMember.create({
      data: {
        groupId: group.id,
        userId,
        role: 'member' // 기본 역할
      }
    }),
    
    // 그룹의 멤버 수 증가
    prisma.forumGroup.update({
      where: { id: group.id },
      data: {
        memberCount: { increment: 1 }
      }
    })
  ]);
  
  return {
    isMember: true,
    message: `${group.name} 그룹에 가입했습니다.`
  };
};

/**
 * 그룹에서 탈퇴합니다.
 * @param {string} userId 사용자 ID
 * @param {string} slug 그룹 슬러그
 * @returns {Promise<Object>} 결과 객체
 */
exports.leaveGroup = async (userId, slug) => {
  // 그룹 정보 조회
  const group = await prisma.forumGroup.findUnique({
    where: { slug },
    select: { 
      id: true,
      name: true
    }
  });
  
  if (!group) {
    throw new NotFoundError('그룹을 찾을 수 없습니다.');
  }
  
  // 멤버십 확인
  const membership = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId: group.id,
        userId
      }
    },
    select: { role: true }
  });
  
  if (!membership) {
    return { 
      isMember: false, 
      message: '그룹의 멤버가 아닙니다.' 
    };
  }
  
  // 마지막 관리자인 경우 탈퇴 방지
  if (membership.role === 'admin') {
    const adminCount = await prisma.groupMember.count({
      where: {
        groupId: group.id,
        role: 'admin'
      }
    });
    
    if (adminCount <= 1) {
      throw new ForbiddenError('그룹의 마지막 관리자는 탈퇴할 수 없습니다. 먼저 다른 멤버에게 관리자 권한을 위임해주세요.');
    }
  }
  
  // 그룹 탈퇴 트랜잭션
  await prisma.$transaction([
    // 멤버십 삭제
    prisma.groupMember.delete({
      where: {
        groupId_userId: {
          groupId: group.id,
          userId
        }
      }
    }),
    
    // 그룹의 멤버 수 감소
    prisma.forumGroup.update({
      where: { id: group.id },
      data: {
        memberCount: { decrement: 1 }
      }
    })
  ]);
  
  return {
    isMember: false,
    message: `${group.name} 그룹에서 탈퇴했습니다.`
  };
};

/**
 * 새 그룹을 생성합니다.
 * @param {string} userId 사용자 ID
 * @param {Object} groupData 그룹 데이터
 * @returns {Promise<Object>} 생성된 그룹 정보
 */
exports.createGroup = async (userId, groupData) => {
  const { name, description, isPrivate = false } = groupData;
  
  // 필수 데이터 검증
  if (!name) {
    throw new ValidationError('그룹 이름은 필수 항목입니다.');
  }
  
  // 슬러그 생성
  const slug = name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // 특수문자 제거
    .replace(/\s+/g, '-') // 공백을 하이픈으로 변경
    .replace(/-+/g, '-'); // 여러 하이픈을 하나로 합침
  
  // 슬러그 중복 확인
  const existingGroup = await prisma.forumGroup.findUnique({
    where: { slug }
  });
  
  if (existingGroup) {
    throw new ValidationError('동일한 이름의 그룹이 이미 존재합니다.');
  }
  
  // 그룹 생성 트랜잭션
  const group = await prisma.$transaction(async (tx) => {
    // 그룹 생성
    const newGroup = await tx.forumGroup.create({
      data: {
        name,
        description: description || '',
        slug,
        isPrivate,
        memberCount: 1 // 생성자 포함
      }
    });
    
    // 생성자를 관리자로 추가
    await tx.groupMember.create({
      data: {
        groupId: newGroup.id,
        userId,
        role: 'admin'
      }
    });
    
    return newGroup;
  });
  
  return {
    id: group.id,
    name: group.name,
    description: group.description,
    slug: group.slug,
    isPrivate: group.isPrivate,
    memberCount: group.memberCount,
    createdAt: group.createdAt,
    isMember: true,
    memberRole: 'admin'
  };
};

/**
 * 그룹 멤버의 역할을 변경합니다. (관리자 전용)
 * @param {string} adminId 관리자 ID
 * @param {string} groupSlug 그룹 슬러그
 * @param {string} targetUserId 대상 사용자 ID
 * @param {string} newRole 새 역할 (admin, moderator, member)
 * @returns {Promise<Object>} 결과 객체
 */
exports.changeGroupMemberRole = async (adminId, groupSlug, targetUserId, newRole) => {
  // 유효한 역할인지 검증
  const validRoles = ['admin', 'moderator', 'member'];
  if (!validRoles.includes(newRole)) {
    throw new ValidationError('유효하지 않은 역할입니다. admin, moderator, member 중 하나여야 합니다.');
  }
  
  // 그룹 정보 조회
  const group = await prisma.forumGroup.findUnique({
    where: { slug: groupSlug },
    select: { id: true }
  });
  
  if (!group) {
    throw new NotFoundError('그룹을 찾을 수 없습니다.');
  }
  
  // 관리자 권한 확인
  const adminMembership = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId: group.id,
        userId: adminId
      }
    },
    select: { role: true }
  });
  
  if (!adminMembership || adminMembership.role !== 'admin') {
    throw new ForbiddenError('그룹 멤버 역할을 변경할 권한이 없습니다.');
  }
  
  // 대상 사용자 멤버십 확인
  const targetMembership = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId: group.id,
        userId: targetUserId
      }
    },
    select: { role: true }
  });
  
  if (!targetMembership) {
    throw new NotFoundError('그룹에 해당 멤버가 존재하지 않습니다.');
  }
  
  // 마지막 관리자 역할 변경 방지
  if (targetMembership.role === 'admin' && newRole !== 'admin') {
    const adminCount = await prisma.groupMember.count({
      where: {
        groupId: group.id,
        role: 'admin'
      }
    });
    
    if (adminCount <= 1) {
      throw new ForbiddenError('그룹의 마지막 관리자 역할은 변경할 수 없습니다.');
    }
  }
  
  // 역할 업데이트
  await prisma.groupMember.update({
    where: {
      groupId_userId: {
        groupId: group.id,
        userId: targetUserId
      }
    },
    data: { role: newRole }
  });
  
  return {
    success: true,
    message: '멤버 역할이 업데이트되었습니다.'
  };
}; 