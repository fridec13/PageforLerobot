# RoboSSAFYens 프로젝트 가이드라인

이 문서는 RoboSSAFYens 프로젝트의 코드 구조 및 스타일 가이드라인을 제공합니다. Next.js 15에서의 라우팅 규칙을 준수하고 일관된 코드베이스를 유지하기 위한 규칙들이 포함되어 있습니다.

## Next.js 15 라우팅 가이드라인

Next.js 15에서는 라우팅 규칙이 더 엄격해졌습니다. 다음 사항에 주의해야 합니다:

### 중요 규칙

1. **라우팅 구조의 원칙**:
   - 같은 폴더 레벨에 동적 라우트와 일반 라우트가 공존할 수 없습니다.
   - 계층 구조는 최대 2단계로 제한합니다. (더 복잡한 구조는 중첩 폴더로 구성)
   - catch-all 라우트([...path])는 특별한 이유 없이 사용하지 않습니다.
   - 일반 동적 라우트([id] 또는 [slug])를 선호합니다.

2. **일관된 폴더 구조**:
   - 모든 주요 기능(docs, wiki, auth 등)은 동일한 패턴을 따라야 합니다.
   - 각 기능 폴더는 layout.tsx + page.tsx + 하위 폴더 구조를 유지합니다.

## 표준 폴더 구조

### 페이지 구조

```
app/
├── [기능명]/             # 예: docs, wiki, auth
│   ├── layout.tsx       # 공통 레이아웃
│   ├── page.tsx         # 메인 페이지 (목록)
│   ├── [id|slug]/       # 동적 라우트 (상세 페이지)
│   │   ├── page.tsx     # 상세 보기
│   │   └── edit/        # 중첩 동작 페이지 (예: 수정)
│   │       └── page.tsx
│   └── 기타 정적 페이지/ # 예: login, register
│       └── page.tsx
```

### 기능별 구조 예시

1. **auth**: 
   ```
   app/auth/
   ├── layout.tsx
   ├── login/
   │   └── page.tsx
   └── register/
       └── page.tsx
   ```

2. **wiki**:
   ```
   app/wiki/
   ├── layout.tsx
   ├── page.tsx         # 위키 목록
   └── [slug]/          # 개별 위키
       ├── page.tsx     # 위키 상세
       └── edit/        # 위키 편집
           └── page.tsx
   ```

3. **docs**:
   ```
   app/docs/
   ├── layout.tsx
   ├── page.tsx        # 문서 목록
   └── [id]/           # 개별 문서
       ├── page.tsx    # 문서 상세
       └── edit/       # 문서 편집
           └── page.tsx
   ```

### API 라우트 구조

```
app/api/
├── [기능명]/             # 예: docs, wiki, auth
│   ├── route.ts         # 목록, 생성 API
│   └── [id]/            # 개별 항목 API
│       └── route.ts     # 상세, 수정, 삭제 API
```

## Mock API 구현 가이드라인

프론트엔드와 백엔드의 역할을 명확하게 분리합니다:

### 프론트엔드 역할

- 타입 정의 및 인터페이스 설계
- Mock API 응답 구현
- 상태 관리 및 UI 렌더링

### 백엔드 역할 (FastAPI)

- 실제 데이터베이스 연동
- 비즈니스 로직 처리
- 인증 및 보안 처리

### 타입 정의 및 Mock 데이터

```
lib/
├── models/              # 타입 정의
│   ├── docs.ts          # 문서 관련 타입
│   ├── wiki.ts          # 위키 관련 타입
│   └── auth.ts          # 인증 관련 타입
└── mock-data/           # Mock 데이터
    ├── docs-data.ts     # 문서 Mock 데이터
    └── wiki-data.ts     # 위키 Mock 데이터
```

## 네이밍 컨벤션

- **컴포넌트 파일**: PascalCase (예: `Button.tsx`)
- **페이지 파일**: kebab-case (예: `user-profile.tsx`)
- **API 파일**: kebab-case (예: `user-auth.ts`)
- **함수명**: camelCase (예: `getUserData()`)
- **컴포넌트명**: PascalCase (예: `UserProfile`)
- **상수**: UPPER_SNAKE_CASE (예: `MAX_ITEMS`)

## 코드 스타일

- **들여쓰기**: 2 spaces
- **따옴표**: single quotes (`'`)
- **세미콜론**: 항상 사용
- **trailing comma**: es5 스타일 (배열, 객체 마지막 항목)

## API 구현 가이드라인

- 모든 API 라우트는 try-catch로 예외 처리 필수
- 일관된 JSON 응답 형식 사용 (성공/에러 메시지 포함)
- 응답 형식 예시:
  ```json
  {
    "success": true/false,
    "data": { ... },
    "error": "에러 메시지"
  }
  ```

## 컴포넌트 구현 가이드라인

- props 타입은 항상 interface로 정의
- 전역 상태는 Zustand 또는 Context API 사용
- 재사용 가능한 컴포넌트는 components 디렉토리에 배치

## 리팩토링 가이드

현재 catch-all 라우트([...path])를 사용하는 코드는 다음과 같이 변경해야 합니다:

| 이전 경로 | 새 경로 | 비고 |
|---------|--------|------|
| `/docs/[...path]` | `/docs/[id]` | 일반 동적 라우트로 변경 |
| `/api/docs/[...path]` | `/api/docs/[id]` | 일반 동적 라우트로 변경 |
| `/docs-home` | `/docs` | 표준 구조로 통합 |

모든 폴더 구조를 wiki, auth와 동일한 패턴으로 통일하고 불필요한 DB 연동 코드를 제거합니다.

## 충돌 해결 전략

1. **라우팅 충돌**:
   - Next.js 표준 패턴을 따라 구조 재구성
   - 기능 관련 코드는 도메인별로 분리 (docs, wiki, auth 등)

2. **API 경로 변경**:
   - API 변경 시 관련 클라이언트 코드도 함께 업데이트
   - 강력한 타입 안전성 유지 