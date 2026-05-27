import { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { UserPlus, CheckCircle2 } from 'lucide-react';

export default function Requests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [supporters, setSupporters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isMatchDialogOpen, setIsMatchDialogOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [reqRes, supRes] = await Promise.all([
        axios.get('http://localhost:3001/api/requests'),
        axios.get('http://localhost:3001/api/supporters')
      ]);
      setRequests(reqRes.data);
      setSupporters(supRes.data);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssign = async (supporterId: number) => {
    if (!selectedRequest) return;
    try {
      await axios.post(`http://localhost:3001/api/requests/${selectedRequest.id}/assign`, {
        supporterId
      });
      setIsMatchDialogOpen(false);
      fetchData();
    } catch (err) {
      console.error('Failed to assign supporter', err);
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case '긴급':
        return <Badge variant="destructive" className="bg-red-600">긴급</Badge>;
      case '보통':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-100">보통</Badge>;
      default:
        return <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">일반</Badge>;
    }
  };

  if (loading) return <div className="text-slate-500 font-medium">요청 목록을 불러오는 중...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-slate-900">서비스 요청 현황</h3>
        <Badge variant="outline" className="px-3 py-1">실시간 업데이트 중</Badge>
      </div>

      <Card className="shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>카테고리</TableHead>
              <TableHead>긴급도</TableHead>
              <TableHead className="max-w-[300px]">AI 요약 내용</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>담당 서포터</TableHead>
              <TableHead className="text-right">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id} className="hover:bg-slate-50 transition-colors">
                <TableCell className="font-medium text-slate-500">#{request.id.toString().slice(-4)}</TableCell>
                <TableCell className="font-semibold text-slate-800">{request.category}</TableCell>
                <TableCell>{getUrgencyBadge(request.urgency)}</TableCell>
                <TableCell className="max-w-[300px] truncate text-slate-600" title={request.summary}>
                  {request.summary}
                </TableCell>
                <TableCell>
                  <Badge variant={request.status === '처리중' ? 'default' : 'secondary'} className="font-normal">
                    {request.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {request.assignedSupporter ? (
                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                      <CheckCircle2 size={16} className="text-emerald-500" />
                      {request.assignedSupporter}
                    </div>
                  ) : (
                    <span className="text-slate-400 text-sm italic">미지정</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {!request.assignedSupporter && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2"
                      onClick={() => {
                        setSelectedRequest(request);
                        setIsMatchDialogOpen(true);
                      }}
                    >
                      <UserPlus size={16} />
                      매칭
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Match Supporter Dialog */}
      <Dialog open={isMatchDialogOpen} onOpenChange={setIsMatchDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>서포터 매칭</DialogTitle>
            <DialogDescription>
              요청 내용에 적합한 인근 서포터를 추천합니다.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 my-4">
            <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">요청 요약</p>
              <p className="text-sm font-medium text-slate-800">{selectedRequest?.summary}</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-700">추천 서포터 목록</p>
              {supporters.filter(s => s.status === '활동 가능').map(supporter => (
                <div 
                  key={supporter.id} 
                  className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:border-primary hover:bg-slate-50 transition-all cursor-pointer group"
                  onClick={() => handleAssign(supporter.id)}
                >
                  <div>
                    <p className="font-bold text-slate-900">{supporter.name}</p>
                    <div className="flex gap-2 text-xs text-slate-500">
                      <span>{supporter.specialty}</span>
                      <span>•</span>
                      <span>{supporter.location}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-yellow-600">★ {supporter.rating}</p>
                    <p className="text-[10px] text-slate-400">매칭률 98%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsMatchDialogOpen(false)}>취소</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
