# RoboSSAFYens 백엔드 서버

이 프로젝트는 RoboSSAFYens 웹 애플리케이션의 백엔드 서버입니다. Express.js와 PostgreSQL을 사용하여 구현되었습니다.

## 기술 스택

- **Node.js**: JavaScript 런타임
- **Express.js**: 웹 서버 프레임워크
- **PostgreSQL**: 관계형 데이터베이스
- **Prisma**: ORM(Object-Relational Mapping)
- **JSON Web Token(JWT)**: 인증

## 시작하기

### 사전 요구 사항

- Node.js(v14 이상)
- PostgreSQL(v13 이상)

### 설치

1. 패키지 설치:
```bash
npm install
```

2. 환경 변수 설정:
`.env.example` 파일을 참고하여 `.env` 파일을 생성하고 필요한 환경 변수를 설정합니다.

```
# 서버 설정
PORT=5000
NODE_ENV=development

# 데이터베이스 설정 (Prisma)
DATABASE_URL="postgresql://postgres:password@localhost:5432/robossafyens?schema=public"

# JWT 설정
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1d

# CORS 설정
FRONTEND_URL=http://localhost:3000
```

3. 데이터베이스 생성:
PostgreSQL에서 `.env` 파일에 지정한 이름의 데이터베이스를 생성합니다.

```sql
CREATE DATABASE robossafyens;
```

4. Prisma 마이그레이션 및 클라이언트 생성:
```bash
npx prisma migrate dev --name init
```

### 실행

개발 모드로 서버 실행:

```bash
npm run dev
```

프로덕션 모드로 서버 실행:

```bash
npm start
```

## API 문서

기본 API 엔드포인트: `http://localhost:5000/api`

### 인증 API

- `POST /api/auth/register`: 회원가입
- `POST /api/auth/login`: 로그인
- `POST /api/auth/forgot-password`: 비밀번호 찾기
- `POST /api/auth/reset-password`: 비밀번호 재설정

### 사용자 API

- `GET /api/users/me`: 현재 로그인한 사용자 정보 조회
- `PATCH /api/users/me`: 사용자 프로필 업데이트
- `POST /api/users/password`: 비밀번호 변경
- `GET /api/users/contributions`: 기여 내역 조회
- `GET /api/users/messages`: 메시지 목록 조회
- `PATCH /api/users/messages/:id`: 메시지 읽음 처리
- `DELETE /api/users/messages/:id`: 메시지 삭제
- `POST /api/users/messages`: 메시지 전송
- `GET /api/users/titles`: 칭호 목록 조회
- `POST /api/users/title`: 칭호 설정
- `GET /api/users/:id`: 특정 사용자 프로필 조회 (관리자/모더레이터 전용)

## 프로젝트 구조

```
src/
├── config/         # 설정 파일
├── controllers/    # 컨트롤러(비즈니스 로직)
├── middlewares/    # 미들웨어
├── routes/         # API 라우트
├── utils/          # 유틸리티 함수
│   └── prisma.js   # Prisma 클라이언트 인스턴스
└── index.js        # 애플리케이션 진입점
prisma/
└── schema.prisma   # Prisma 스키마 정의
```

## 데이터베이스 모델

현재 구현된 모델:

- **User**: 사용자 정보

추가 구현이 필요한 모델:

- **Contribution**: 기여 내역
- **Message**: 메시지
- **Badge**: 뱃지
- **UserBadge**: 사용자-뱃지 연결

## Prisma 스키마 확장 방법

추가 모델을 정의하려면 `prisma/schema.prisma` 파일을 다음과 같이 확장하세요:

```prisma
// 기여 내역 모델
model Contribution {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  type        String   // 기여 타입 (wiki, forum, docs 등)
  description String
  points      Int      @default(1)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// 메시지 모델
model Message {
  id         String    @id @default(uuid())
  senderId   String
  receiverId String
  content    String
  read       Boolean   @default(false)
  createdAt  DateTime  @default(now())
  readAt     DateTime?
  sender     User      @relation("SentMessages", fields: [senderId], references: [id])
  receiver   User      @relation("ReceivedMessages", fields: [receiverId], references: [id])
}

// User 모델에 관계 추가
model User {
  // ... 기존 필드
  contributions    Contribution[]
  sentMessages     Message[]      @relation("SentMessages")
  receivedMessages Message[]      @relation("ReceivedMessages")
}
```

모델을 추가한 후 마이그레이션을 실행하세요:

```bash
npx prisma migrate dev --name add_contributions_and_messages
```

## Next.js 프론트엔드와 연동

1. `/lib/services/apiClient.ts`의 `API_URL` 변수를 백엔드 서버 URL로 설정:
```typescript
const API_URL = 'http://localhost:5000/api';
```

2. `.env` 또는 `.env.local` 파일에 백엔드 URL 추가:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
``` 