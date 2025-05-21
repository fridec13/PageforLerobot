/**
 * 포럼 서비스 모듈 - 모든 포럼 관련 서비스를 통합
 */

const topicService = require('./forumTopicService');
const postService = require('./forumPostService');
const commentService = require('./forumCommentService');
const userService = require('./forumUserService');
const badgeService = require('./forumBadgeService');
const groupService = require('./forumGroupService');
const searchService = require('./forumSearchService');

/**
 * 주제 관련 서비스
 */
exports.getTopics = topicService.getTopics;
exports.getTopicDetail = topicService.getTopicDetail;
exports.followTopic = topicService.followTopic;
exports.unfollowTopic = topicService.unfollowTopic;

/**
 * 게시글 관련 서비스
 */
exports.getPosts = postService.getPosts;
exports.getPostsByTopic = postService.getPostsByTopic;
exports.getPostDetail = postService.getPostDetail;
exports.createPost = postService.createPost;
exports.updatePost = postService.updatePost;
exports.deletePost = postService.deletePost;
exports.likePost = postService.likePost;
exports.unlikePost = postService.unlikePost;

/**
 * 댓글 관련 서비스
 */
exports.getComments = commentService.getComments;
exports.createComment = commentService.createComment;
exports.updateComment = commentService.updateComment;
exports.deleteComment = commentService.deleteComment;
exports.likeComment = commentService.likeComment;
exports.unlikeComment = commentService.unlikeComment;

/**
 * 사용자 관련 서비스
 */
exports.getUsers = userService.getUsers;
exports.getUserDetail = userService.getUserDetail;
exports.getUserPosts = userService.getUserPosts;
exports.getUserComments = userService.getUserComments;
exports.followUser = userService.followUser;
exports.unfollowUser = userService.unfollowUser;

/**
 * 배지 관련 서비스
 */
exports.getBadges = badgeService.getBadges;
exports.getBadgeDetail = badgeService.getBadgeDetail;
exports.getBadgeUsers = badgeService.getBadgeUsers;
exports.getBadgeCategories = badgeService.getBadgeCategories;
exports.createBadge = badgeService.createBadge;
exports.awardBadgeToUser = badgeService.awardBadgeToUser;

/**
 * 그룹 관련 서비스
 */
exports.getGroups = groupService.getGroups;
exports.getGroupDetail = groupService.getGroupDetail;
exports.getGroupPosts = groupService.getGroupPosts;
exports.getGroupMembers = groupService.getGroupMembers;
exports.joinGroup = groupService.joinGroup;
exports.leaveGroup = groupService.leaveGroup;
exports.createGroup = groupService.createGroup;
exports.changeGroupMemberRole = groupService.changeGroupMemberRole;

/**
 * 검색 관련 서비스
 */
exports.searchForum = searchService.searchForum;
exports.getAutocompleteSuggestions = searchService.getAutocompleteSuggestions;
exports.getPopularSearchTerms = searchService.getPopularSearchTerms; 