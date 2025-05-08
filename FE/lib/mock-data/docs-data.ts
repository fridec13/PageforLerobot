import { Document, DocumentHistory, Category, DocumentChangeRequest } from '../models/docs';

// Mock 카테고리 데이터
export const mockCategories: Category[] = [
  {
    id: 'cat_robodk',
    name: 'RoboDK',
    path: 'robodk',
    description: 'RoboDK 관련 문서'
  },
  {
    id: 'cat_onshape',
    name: 'Onshape',
    path: 'onshape',
    description: 'Onshape 관련 문서'
  },
  {
    id: 'cat_ros2',
    name: 'ROS2',
    path: 'ros2',
    description: 'ROS2 관련 문서'
  },
  {
    id: 'cat_lerobot',
    name: 'LeRobot',
    path: 'lerobot',
    description: 'LeRobot 관련 문서'
  }
];

// Mock 문서 데이터
export const mockDocuments: Document[] = [
  {
    id: 'doc_1',
    title: 'RoboDK 소개',
    content: '# RoboDK 소개\n\nRoboDK는 로봇 시뮬레이션 및 프로그래밍을 위한 소프트웨어입니다. 이 문서에서는 RoboDK의 기본 개념과 사용법에 대해 알아봅니다.',
    path: 'robodk/introduction',
    categoryId: 'cat_robodk',
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-01-15'),
    createdBy: 'user_admin',
    lastEditedBy: 'user_admin',
    isPublished: true,
    version: 1
  },
  {
    id: 'doc_2',
    title: 'RoboDK 설치 가이드',
    content: '# RoboDK 설치 가이드\n\n이 문서에서는 RoboDK를 설치하는 방법을 단계별로 안내합니다.\n\n## 시스템 요구사항\n\n- Windows 10 이상\n- macOS 10.14 이상\n- Linux (Ubuntu 18.04 이상)',
    path: 'robodk/installation',
    categoryId: 'cat_robodk',
    createdAt: new Date('2023-01-20'),
    updatedAt: new Date('2023-02-10'),
    createdBy: 'user_admin',
    lastEditedBy: 'user_editor1',
    isPublished: true,
    version: 2
  },
  {
    id: 'doc_3',
    title: 'Onshape 기초',
    content: '# Onshape 기초\n\nOnshape는 클라우드 기반 CAD 소프트웨어입니다. 이 문서에서는 Onshape의 기본 기능과 인터페이스에 대해 알아봅니다.',
    path: 'onshape/basics',
    categoryId: 'cat_onshape',
    createdAt: new Date('2023-02-01'),
    updatedAt: new Date('2023-02-01'),
    createdBy: 'user_admin',
    lastEditedBy: 'user_admin',
    isPublished: true,
    version: 1
  },
  {
    id: 'doc_4',
    title: 'ROS2 설치 가이드',
    content: '# ROS2 설치 가이드\n\n이 문서에서는 ROS2(Robot Operating System 2)를 설치하는 방법을 안내합니다.',
    path: 'ros2/installation',
    categoryId: 'cat_ros2',
    createdAt: new Date('2023-03-05'),
    updatedAt: new Date('2023-03-05'),
    createdBy: 'user_editor1',
    lastEditedBy: 'user_editor1',
    isPublished: true,
    version: 1
  },
  {
    id: 'doc_5',
    title: 'LeRobot 프로그래밍 가이드',
    content: '# LeRobot 프로그래밍 가이드\n\n이 문서에서는 LeRobot의 프로그래밍 방법에 대해 설명합니다.',
    path: 'lerobot/programming',
    categoryId: 'cat_lerobot',
    createdAt: new Date('2023-04-10'),
    updatedAt: new Date('2023-04-15'),
    createdBy: 'user_editor2',
    lastEditedBy: 'user_editor2',
    isPublished: true,
    version: 2
  }
];

// Mock 문서 이력 데이터
export const mockDocumentHistories: DocumentHistory[] = [
  {
    id: 'hist_1',
    documentId: 'doc_2',
    content: '# RoboDK 설치 가이드\n\n이 문서에서는 RoboDK를 설치하는 방법을 안내합니다.',
    version: 1,
    editedBy: 'user_admin',
    editedAt: new Date('2023-01-20'),
    changeDescription: '최초 작성'
  },
  {
    id: 'hist_2',
    documentId: 'doc_5',
    content: '# LeRobot 프로그래밍 가이드\n\n이 문서는 작성 중입니다.',
    version: 1,
    editedBy: 'user_editor2',
    editedAt: new Date('2023-04-10'),
    changeDescription: '최초 작성'
  }
];

// Mock 변경 요청 데이터
export const mockChangeRequests: DocumentChangeRequest[] = [
  {
    id: 'req_1',
    documentId: 'doc_1',
    proposedContent: '# RoboDK 소개\n\nRoboDK는 로봇 시뮬레이션 및 프로그래밍을 위한 소프트웨어입니다. 이 문서에서는 RoboDK의 기본 개념과 사용법에 대해 알아봅니다.\n\n## 주요 기능\n\n- 로봇 시뮬레이션\n- 오프라인 프로그래밍\n- CAD 통합',
    proposedBy: 'user_contributor1',
    status: 'pending',
    createdAt: new Date('2023-05-20'),
    reviewedBy: null,
    reviewedAt: null,
    reviewComment: null
  },
  {
    id: 'req_2',
    documentId: 'doc_3',
    proposedContent: '# Onshape 기초\n\nOnshape는 클라우드 기반 CAD 소프트웨어입니다. 이 문서에서는 Onshape의 기본 기능과 인터페이스에 대해 알아봅니다.\n\n## 특징\n\n- 클라우드 기반으로 어디서나 접근 가능\n- 실시간 협업 기능\n- 버전 관리 시스템',
    proposedBy: 'user_contributor2',
    status: 'approved',
    createdAt: new Date('2023-05-15'),
    reviewedBy: 'user_admin',
    reviewedAt: new Date('2023-05-16'),
    reviewComment: '좋은 내용 추가입니다.'
  },
  {
    id: 'req_3',
    documentId: 'doc_4',
    proposedContent: '# ROS2 설치 가이드\n\n이 문서에서는 ROS2(Robot Operating System 2)를 설치하는 방법을 안내합니다.\n\n내용이 부족합니다.',
    proposedBy: 'user_contributor3',
    status: 'rejected',
    createdAt: new Date('2023-05-18'),
    reviewedBy: 'user_admin',
    reviewedAt: new Date('2023-05-19'),
    reviewComment: '내용이 너무 부족합니다. 더 구체적인 설치 단계를 추가해주세요.'
  }
]; 