# RoboSSAFYens

로봇 학습용 기술문서와 위키 페이지, QNA 포럼 게시판, 자유게시판, 3D 로봇 모델 컨트롤러를 제공하는 다중 접속 커뮤니티 사이트입니다.

## 프로젝트 개요

- 로봇 관련 기술문서 및 위키 제공
- 포럼 기반 QNA 시스템
- 자유 게시판
- 로봇 3D 모델 및 컨트롤러
- 다국어 지원 (한국어, 영어)

## 기술 스택

- **프론트엔드**: Next.js, TypeScript, Tailwind CSS
- **상태 관리**: Zustand
- **API 통신**: Axios
- **스타일링**: Shadcn UI
- **3D 렌더링**: Three.js

## 개발 환경 설정

### 시스템 요구사항

- Node.js 18.x 이상
- pnpm 8.x 이상

### 설치 및 실행 방법

1. **저장소 클론**

```bash
git clone https://github.com/your-username/robo-sapiens.git
cd robo-sapiens
```

2. **의존성 설치**

```bash
pnpm install
```

3. **개발 서버 실행**

```bash
pnpm dev
```

4. **빌드**

```bash
pnpm build
```

5. **프로덕션 서버 실행**

```bash
pnpm start
```

### 환경 변수 설정

`.env.local` 파일을 루트 디렉토리에 생성하고 다음 변수를 설정하세요:

```
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

## 주요 명령어

- `pnpm dev` - 개발 서버 실행 (http://localhost:3000)
- `pnpm build` - 프로덕션용 빌드 생성
- `pnpm start` - 프로덕션 서버 실행
- `pnpm lint` - 코드 린팅
- `pnpm test` - 테스트 실행 (설정된 경우)

## 프로젝트 구조

```
robo-sapiens/
├── app/              # Next.js 앱 디렉토리
│   ├── auth/         # 인증 관련 페이지
│   ├── docs/         # 기술 문서 페이지
│   ├── forum/        # 포럼 페이지
│   ├── profile/      # 사용자 프로필 페이지
│   ├── robocon/      # 로봇 컨트롤러 페이지
│   └── wiki/         # 위키 페이지
├── components/       # 재사용 가능한 컴포넌트
├── lib/              # 유틸리티, 서비스, 상태 관리
│   ├── models/       # 데이터 모델
│   ├── services/     # API 서비스
│   └── store/        # Zustand 상태 관리
├── public/           # 정적 파일
└── hooks/            # 커스텀 훅
```

## 기여 방법

1. 저장소 포크
2. 기능 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. 변경 사항 커밋 (`git commit -m 'Add some amazing feature'`)
4. 브랜치 푸시 (`git push origin feature/amazing-feature`)
5. Pull Request 생성

## 라이센스

[MIT](LICENSE) 