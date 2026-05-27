# Silver Support (실버 서포트) 👵👴

고령 인구 통계 데이터와 실시간 기술을 활용한 고령자 지원 플랫폼 프로젝트입니다.

## 🏗️ 프로젝트 구조

이 프로젝트는 다음과 같은 3개의 주요 폴더로 구성되어 있습니다:

- **[client](./client)**: React (Vite) 기반의 웹 프론트엔드
- **[server](./server)**: Node.js (Express + Prisma) 기반의 백엔드 API 및 소켓 서버
- **[data](./data)**: 프로젝트에 사용되는 공공 데이터 (CSV 형식)

## 🛠️ 기술 스택

### Frontend
- **Framework**: React 19 (TypeScript)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI, Lucide React
- **Real-time**: Socket.io-client

### Backend
- **Runtime**: Node.js
- **Framework**: Express 5
- **Database**: SQLite (managed by Prisma)
- **ORM**: Prisma
- **Real-time**: Socket.io
- **Data Processing**: csv-parse, iconv-lite

## 🚀 시작하기

### 1. 레포지토리 클론
```bash
git clone <repository-url>
cd silver-support
```

### 2. 백엔드 설정
```bash
cd server
npm install
npx prisma generate
npm run dev
```

### 3. 프론트엔드 설정
```bash
cd ../client
npm install
npm run dev
```

## 📊 데이터 구성 (data/)
- `119 신고접수 현황_2023_전국.csv`: 전국 119 신고 데이터
- `고령인구비율_시도_시_군_구_...csv`: 지역별 고령 인구 비율 통계
- `전국마을회관및경로당표준데이터.csv`: 경로당 및 마을회관 정보
- `전국치매센터표준데이터.csv`: 치매 지원 센터 정보
