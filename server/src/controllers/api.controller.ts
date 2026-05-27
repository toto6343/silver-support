import type { Request, Response } from 'express';
import { prisma } from '../lib/db.js';

export const getRequests = async (req: Request, res: Response) => {
  try {
    const requests = await prisma.request.findMany({
      orderBy: { timestamp: 'desc' }
    });
    // Convert comma-separated keywords back to array for the frontend
    const formattedRequests = requests.map(r => ({
      ...r,
      keywords: r.keywords.split(',')
    }));
    res.json(formattedRequests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
};

export const getSupporters = async (req: Request, res: Response) => {
  try {
    const supporters = await prisma.supporter.findMany();
    res.json(supporters);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch supporters' });
  }
};

export const getStats = async (req: Request, res: Response) => {
  try {
    const total = await prisma.request.count();
    const emergency = await prisma.request.count({ where: { urgency: '긴급' } });
    const pending = await prisma.request.count({ where: { status: '대기중' } });
    const activeSupporters = await prisma.supporter.count({ where: { status: '활동 중' } });
    
    // Fetch Region Stats
    const regionStats = await prisma.regionStat.findMany({
      where: {
        region: {
          not: '전국'
        }
      },
      orderBy: {
        elderlyRatio: 'desc'
      },
      take: 8 // Top 8 like the frontend mocked
    });

    const regionData = regionStats.map((r: any) => ({
      region: r.region.replace('광역시', '').replace('특별자치도', '').replace('특별자치시', '').replace('특별시', '').replace('도', '').substring(0, 2),
      ratio: r.elderlyRatio
    }));

    // Generate chartData based on Request categories
    const categories = await prisma.request.groupBy({
      by: ['category'],
      _count: {
        id: true
      }
    });

    const chartData = categories.map((c: any) => ({
      name: c.category,
      value: c._count.id
    }));
    
    res.json({
      total,
      emergency,
      pending,
      activeSupporters,
      regionData,
      chartData
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

export const getInfrastructure = async (req: Request, res: Response) => {
  try {
    const infra = await prisma.infrastructure.findMany({
      take: 500 // Limit for performance
    });
    res.json(infra);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch infrastructure' });
  }
};

export const assignSupporter = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { supporterId } = req.body;
  
  try {
    const request = await prisma.request.findUnique({ where: { id: parseInt(id!) } });
    const supporter = await prisma.supporter.findUnique({ where: { id: parseInt(supporterId!) } });
    
    if (request && supporter) {
      const updatedRequest = await prisma.request.update({
        where: { id: parseInt(id!) },
        data: {
          status: "처리중",
          assignedSupporter: supporter.name
        }
      });
      
      const updatedSupporter = await prisma.supporter.update({
        where: { id: parseInt(supporterId!) },
        data: { status: "활동 중" }
      });
      
      res.json({ 
        request: { ...updatedRequest, keywords: updatedRequest.keywords.split(',') }, 
        supporter: updatedSupporter 
      });
    } else {
      res.status(404).json({ message: "Request or Supporter not found" });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to assign supporter' });
  }
};
