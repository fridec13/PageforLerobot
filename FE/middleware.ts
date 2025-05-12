import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 보호된 경로에 대한 접근 확인
  if (isProtectedPath(pathname)) {
    const token = await getToken({ req: request })
    
    if (!token) {
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