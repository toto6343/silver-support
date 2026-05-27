# Silver Support Server ⚙️

실버 서포트 프로젝트의 백엔드 API 및 소켓 서버입니다.

## 🛠️ 사용된 기술
- **Node.js**: 자바스크립트 런타임
- **Express 5**: 웹 서버 프레임워크
- **Prisma**: 타입 안정성을 제공하는 ORM
- **SQLite**: 가볍고 설정이 간편한 파일 기반 데이터베이스
- **Socket.io**: 실시간 양방향 통신

## 🏃 실행 방법

### 의존성 설치 및 설정
```bash
npm install
npx prisma generate
```

### 개발 서버 실행
```bash
npm run dev
```

### 데이터베이스 관리 (Studio)
```bash
npx prisma studio
```

## 📁 주요 폴더 구조
- `src/controllers`: API 비즈니스 로직
- `src/routes`: API 엔드포인트 정의
- `src/sockets`: 소켓 통신 핸들러
- `prisma/`: 데이터베이스 스키마 및 마이그레이션 설정
