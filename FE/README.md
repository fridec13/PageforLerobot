# Robot Offset Simulator

3D 로봇 모델을 통한 오프셋 시뮬레이션 도구

## 🤖 주요 기능

- **3D 로봇 시뮬레이션**: URDF 파일을 통한 실시간 로봇 모델 렌더링
- **관절 제어**: 각 관절의 개별적인 각도 조정 및 오프셋 설정
- **다중 로봇 지원**: 여러 로봇을 동시에 시뮬레이션
- **STL 모델 뷰어**: 개별 STL 파일 로드 및 검사
- **직관적인 UI**: 슬라이더를 통한 쉬운 조작

## 🛠️ 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript
- **3D 렌더링**: Three.js, React Three Fiber, React Three Drei
- **로봇 모델**: URDF Loader, STL Loader
- **UI 컴포넌트**: Radix UI, Tailwind CSS
- **스타일링**: Tailwind CSS

## 🚀 시작하기

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

### 프로덕션 빌드

```bash
npm run build
npm start
```

## 📁 프로젝트 구조

```
├── app/                          # Next.js App Router
│   ├── robocon/offsetsim/        # Offset Simulator 페이지
│   │   ├── page.tsx              # 메인 시뮬레이터
│   │   └── stlloaderpage.tsx     # STL 로더
│   ├── layout.tsx                # 루트 레이아웃
│   └── page.tsx                  # 홈 페이지
├── components/                   # React 컴포넌트
│   ├── layout/                   # 레이아웃 컴포넌트
│   └── ui/                       # UI 컴포넌트
├── lib/                          # 유틸리티 라이브러리
│   ├── urdf-loader/              # URDF 로더 라이브러리
│   └── utils.ts                  # 유틸리티 함수
└── public/                       # 정적 파일
    └── models/                   # 3D 모델 파일들
```

## 🎯 사용법

1. 브라우저에서 `http://localhost:3000` 접속
2. 자동으로 Offset Simulator로 리다이렉트
3. 로봇 모델 추가/제거
4. 슬라이더를 통해 관절 각도 조정
5. 오프셋 값 설정 및 저장/불러오기

## 📋 지원 모델

- SO-100 5DOF 로봇 팔
- 표준 URDF 형식 모델
- STL 메시 파일

## 🌐 배포

### Vercel 배포

```bash
npm install -g vercel
vercel
```

### Docker 배포

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📄 라이선스

MIT License 