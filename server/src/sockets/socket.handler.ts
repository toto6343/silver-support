import { Server, Socket } from 'socket.io';
import { prisma } from '../lib/db.js';

export const setupSocketHandlers = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log('Admin connected:', socket.id);

    const locations = [
      "제주시 애월읍", "의정부시 신곡동", "평택시 안중읍", "원주시 우산동",
      "울산광역시 동구 전하동", "서천군 장항읍", "함안군 가야읍", "울진군 기성면",
      "서산시 예천동", "고창군 고창읍", "정읍시 수성동", "강릉시 옥천동",
      "김포시 장기동", "남양주시 조안면"
    ];

    const emergencyTypes = [
      { category: "의료/낙상", summary: "화장실에서 미끄러짐 사고 발생", keywords: "낙상,거동불가" },
      { category: "심혈관", summary: "갑작스러운 가슴 통증 및 식은땀 호소", keywords: "가슴통증,응급" },
      { category: "호흡기", summary: "호흡 곤란 및 천식 증상 악화", keywords: "호흡곤란,산소부족" },
      { category: "의식저하", summary: "침대에서 의식이 없는 상태로 발견", keywords: "의식불명,긴급출동" },
      { category: "생활안전", summary: "주방 가스 불을 켜둔 채 거동 불가 상태", keywords: "화재위험,안전확인" }
    ];

    // Simulation: Send a new emergency request every 15-30 seconds
    const sendEmergency = async () => {
      try {
        const randomLoc = locations[Math.floor(Math.random() * locations.length)];
        const randomType = emergencyTypes[Math.floor(Math.random() * emergencyTypes.length)];
        
        const newRequestData = {
          category: randomType.category,
          urgency: "긴급",
          summary: `[${randomLoc}] ${randomType.summary}`,
          keywords: randomType.keywords,
          status: "대기중",
        };

        const savedRequest = await prisma.request.create({
          data: newRequestData
        });

        const formattedRequest = {
          ...savedRequest,
          keywords: savedRequest.keywords.split(',')
        };

        io.emit('emergency', formattedRequest);
        console.log(`Sent emergency alert: ${randomType.category} at ${randomLoc}`);
      } catch (error) {
        console.error('Failed to create simulated emergency:', error);
      }
      
      const nextDelay = Math.random() * 15000 + 15000; // 15~30 seconds
      timeoutId = setTimeout(sendEmergency, nextDelay);
    };

    let timeoutId = setTimeout(sendEmergency, 10000);

    socket.on('disconnect', () => {
      console.log('Admin disconnected');
      clearTimeout(timeoutId);
    });
  });
};
