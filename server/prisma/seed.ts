import "dotenv/config"
import { PrismaClient } from '../generated/client/client.ts'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'
import iconv from 'iconv-lite'

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' })
const prisma = new PrismaClient({ adapter })

/**
 * 모든 데이터 파일이 UTF-8로 확인되었으므로,
 * 단순히 fs.readFileSync(path, 'utf8')를 사용하거나 Buffer를 string으로 변환합니다.
 */
function readUtf8File(filePath: string) {
  return fs.readFileSync(filePath, 'utf8');
}

async function main() {
  console.log('Cleaning up database...')
  await prisma.request.deleteMany()
  await prisma.supporter.deleteMany()
  await prisma.infrastructure.deleteMany()
  await prisma.regionStat.deleteMany()

  // 1. Mock Supporters
  const supporters = [
    {
      name: "이영희",
      specialty: "간호사",
      location: "서울 강북구",
      status: "활동 가능",
      rating: 4.9,
      completedTasks: 124,
      latitude: 37.6391,
      longitude: 127.0254
    },
    {
      name: "박철수",
      specialty: "요양보호사",
      location: "서울 강북구",
      status: "활동 중",
      rating: 4.8,
      completedTasks: 89,
      latitude: 37.6257,
      longitude: 127.0347
    },
    {
      name: "김민지",
      specialty: "사회복지사",
      location: "경기 파주시",
      status: "활동 가능",
      rating: 4.7,
      completedTasks: 56,
      latitude: 37.7511,
      longitude: 126.7797
    },
    {
      name: "정민호",
      specialty: "물리치료사",
      location: "제주 제주시",
      status: "활동 가능",
      rating: 4.9,
      completedTasks: 210,
      latitude: 33.5007,
      longitude: 126.5312
    }
  ]

  console.log('Seeding supporters...')
  for (const s of supporters) await prisma.supporter.create({ data: s })

  const dataDir = path.join(process.cwd(), '../data')

  // 2. 119 Emergency Requests
  console.log('Seeding 119 emergency requests...')
  const emergencyFile = path.join(dataDir, '119_sample.csv')
  if (fs.existsSync(emergencyFile)) {
    const decoded = readUtf8File(emergencyFile)
    const records = parse(decoded, { columns: true, skip_empty_lines: true })
    
    let count = 0;
    for (const record of records.slice(0, 30)) {
      const region = record['CLMTY_CTPV_NM'] || record['CTPV_NM'] || '미상';
      const sgg = record['CLMTY_SGG_NM'] || record['SGG_NM'] || '';
      const station = record['FRSTN_NM'] || '소방서';
      
      await prisma.request.create({
        data: {
          category: '의료/낙상',
          urgency: '긴급',
          summary: `[${region} ${sgg}] ${station} 긴급 출동 요청`,
          keywords: '119,긴급,구조,의료',
          status: count % 3 === 0 ? '처리중' : '대기중',
          timestamp: new Date().toISOString(),
          latitude: parseFloat(record['LAT']) || null,
          longitude: parseFloat(record['LOT']) || null
        }
      })
      count++;
    }

    const mockRequests = [
      { category: "외출지원", urgency: "일반", summary: "병원 동행 산책 요청", keywords: "산책,동행,병원", status: "대기중", timestamp: new Date().toISOString() },
      { category: "정서지원", urgency: "보통", summary: "말벗 및 정서적 지원 필요", keywords: "말벗,우울,상담", status: "대기중", timestamp: new Date().toISOString() },
      { category: "생활지원", urgency: "일반", summary: "장보기 보조 요청", keywords: "장보기,식료품", status: "대기중", timestamp: new Date().toISOString() },
    ]
    for (const r of mockRequests) await prisma.request.create({ data: r })
    console.log(`Seeded requests.`)
  }

  // 3. Infrastructure
  console.log('Seeding infrastructure (Dementia Centers)...')
  const dementiaFile = path.join(dataDir, '전국치매센터표준데이터.csv')
  if (fs.existsSync(dementiaFile)) {
    const decoded = readUtf8File(dementiaFile)
    const records = parse(decoded, { columns: true, skip_empty_lines: true })
    
    for (const record of records.slice(0, 200)) {
      await prisma.infrastructure.create({
        data: {
          name: record['치매센터명'] || record['시설명'] || '치매센터',
          type: '치매센터',
          address: record['소재지도로명주소'] || record['소재지지번주소'] || '',
          latitude: parseFloat(record['위도']) || null,
          longitude: parseFloat(record['경도']) || null,
          phone: record['운영기관전화번호'] || record['전화번호'] || null
        }
      })
    }
  }

  console.log('Seeding infrastructure (Community Centers)...')
  const communityFile = path.join(dataDir, '전국마을회관및경로당표준데이터.csv')
  if (fs.existsSync(communityFile)) {
    const decoded = readUtf8File(communityFile)
    const records = parse(decoded, { columns: true, skip_empty_lines: true })
    
    for (const record of records.slice(0, 200)) {
      await prisma.infrastructure.create({
        data: {
          name: record['시설명'] || record['마을회관명'] || '마을회관',
          type: '마을회관/경로당',
          address: record['소재지도로명주소'] || record['소재지지번주소'] || '',
          latitude: parseFloat(record['위도']) || null,
          longitude: parseFloat(record['경도']) || null,
          phone: record['전화번호'] || null
        }
      })
    }
  }

  // 4. Region Stats (Elderly Population)
  console.log('Seeding region stats (Elderly Population Ratio)...')
  const statFile = path.join(dataDir, '고령인구비율_시도_시_군_구__20260526195536.csv')
  if (fs.existsSync(statFile)) {
    const decoded = readUtf8File(statFile)
    const records = parse(decoded, { skip_empty_lines: true })
    
    for (let i = 2; i < records.length; i++) {
      const row = records[i];
      if (!row || row.length < 4) continue;
      
      const region = row[0].replace(/"/g, '').trim();
      const elderlyRatio = parseFloat(row[1]) || 0;
      const elderlyCount = parseInt(row[2]) || 0;
      const totalCount = parseInt(row[3]) || 0;

      if (!region || region === '행정구역별(1)') continue;

      await prisma.regionStat.create({
        data: {
          region,
          elderlyRatio,
          elderlyCount,
          totalCount
        }
      })
    }
    console.log(`Seeded region stats.`)
  }

  console.log('Seeding finished successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
