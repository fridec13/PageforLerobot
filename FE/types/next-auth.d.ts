import NextAuth, { DefaultSession } from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  /**
   * Session에서 사용자 정보 확장
   */
  interface Session {
    user: {
      id: string;
      role: string;
      title?: string;
    } & DefaultSession['user']
  }

  /**
   * User 인터페이스 확장
   */
  interface User {
    id: string;
    role: string;
    title?: string;
  }
}

declare module 'next-auth/jwt' {
  /**
   * JWT 토큰 확장
   */
  interface JWT {
    id: string;
    role: string;
    title?: string;
  }
}