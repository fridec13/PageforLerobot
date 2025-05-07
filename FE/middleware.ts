import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 인증이 필요한 경로 패턴
const PROTECTED_PATHS = [
  /^\/profile(\/.*)?$/,  // 프로필 페이지
  /^\/wiki\/edit(\/.*)?$/,  // 위키 편집
  /^\/docs\/commit(\/.*)?$/,  // 문서 변경 요청
]

// 인증 필요 여부 확인
const isProtectedPath = (path: string) => {
  return PROTECTED_PATHS.some(pattern => pattern.test(path))
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 보호된 경로에 대한 접근 확인
  if (isProtectedPath(pathname)) {
    // 쿠키에서 토큰(인증 상태) 확인
    const token = request.cookies.get('auth-storage')?.value
    
    // 인증되지 않은 경우 로그인 페이지로 리디렉션
    if (!token || !token.includes('"isAuthenticated":true')) {
      // 원래 URL을 쿼리 파라미터로 추가하여 로그인 후 돌아올 수 있도록 함
      const redirectUrl = new URL('/auth/login', request.url)
      redirectUrl.searchParams.set('returnUrl', pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }
  
  return NextResponse.next()
}

// 미들웨어가 적용될 경로 패턴 정의
export const config = {
  matcher: [
    // 프로필 페이지
    '/profile/:path*',
    // 위키 편집
    '/wiki/edit/:path*',
    // 문서 변경 요청
    '/docs/commit/:path*',
  ],
} 