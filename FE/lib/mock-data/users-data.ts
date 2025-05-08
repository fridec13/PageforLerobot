import { ROLES, TITLES } from '../constants';

// 사용자 관련 타입
export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: string;
  title?: string;
  image?: string;
  contribution: number;
  badges: string[];
  createdAt: Date;
}

// Mock 사용자 데이터
export const mockUsers: MockUser[] = [
  {
    id: 'user_admin',
    name: '관리자',
    email: 'admin@robossafyens.com',
    role: ROLES.ADMIN,
    title: TITLES.SSAFYENS.name,
    image: 'https://api.dicebear.com/7.x/lorelei/svg?seed=admin',
    contribution: 120,
    badges: ['창립자', '핵심개발자'],
    createdAt: new Date('2023-01-01')
  },
  {
    id: 'user_moderator',
    name: '모더레이터',
    email: 'moderator@robossafyens.com',
    role: ROLES.MODERATOR,
    title: TITLES.MASTER.name,
    image: 'https://api.dicebear.com/7.x/lorelei/svg?seed=moderator',
    contribution: 75,
    badges: ['우수기여자'],
    createdAt: new Date('2023-02-01')
  },
  {
    id: 'user_editor1',
    name: '편집자1',
    email: 'editor1@example.com',
    role: ROLES.USER,
    title: TITLES.EXPERT.name,
    image: 'https://api.dicebear.com/7.x/lorelei/svg?seed=editor1',
    contribution: 35,
    badges: [],
    createdAt: new Date('2023-02-15')
  },
  {
    id: 'user_editor2',
    name: '편집자2',
    email: 'editor2@example.com',
    role: ROLES.USER,
    title: TITLES.CONTRIBUTOR.name,
    image: 'https://api.dicebear.com/7.x/lorelei/svg?seed=editor2',
    contribution: 18,
    badges: [],
    createdAt: new Date('2023-03-10')
  },
  {
    id: 'user_contributor1',
    name: '기여자1',
    email: 'contributor1@example.com',
    role: ROLES.USER,
    title: TITLES.CONTRIBUTOR.name,
    image: 'https://api.dicebear.com/7.x/lorelei/svg?seed=contributor1',
    contribution: 8,
    badges: [],
    createdAt: new Date('2023-04-05')
  },
  {
    id: 'user_contributor2',
    name: '기여자2',
    email: 'contributor2@example.com',
    role: ROLES.USER,
    title: TITLES.NEWCOMER.name,
    image: 'https://api.dicebear.com/7.x/lorelei/svg?seed=contributor2',
    contribution: 3,
    badges: [],
    createdAt: new Date('2023-05-01')
  }
];

// 메시지 관련 타입
export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  createdAt: Date;
}

// Mock 메시지 데이터
export const mockMessages: Message[] = [
  {
    id: 'msg_1',
    senderId: 'user_admin',
    receiverId: 'user_editor1',
    content: '작성한 ROS2 문서에 대해 감사드립니다. 좋은 정보였습니다.',
    read: false,
    createdAt: new Date('2023-05-10')
  },
  {
    id: 'msg_2',
    senderId: 'user_moderator',
    receiverId: 'user_contributor1',
    content: '기여해주신 내용이 승인되었습니다. 앞으로도 많은 기여 부탁드립니다.',
    read: true,
    createdAt: new Date('2023-05-15')
  },
  {
    id: 'msg_3',
    senderId: 'user_admin',
    receiverId: 'user_contributor2',
    content: '제안하신 변경사항에 약간의 수정이 필요합니다. 자세한 내용은 변경 요청 페이지를 확인해주세요.',
    read: false,
    createdAt: new Date('2023-05-18')
  }
]; 