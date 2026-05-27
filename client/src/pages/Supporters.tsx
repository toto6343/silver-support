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
import { Star, MapPin, UserCheck } from 'lucide-react';

export default function Supporters() {
  const [supporters, setSupporters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSupporters = async () => {
      try {
        const res = await axios.get('http://localhost:3001/api/supporters');
        setSupporters(res.data);
      } catch (err) {
        console.error('Failed to fetch supporters', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSupporters();
  }, []);

  if (loading) return <div className="text-slate-500 font-medium">서포터 목록을 불러오는 중...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-slate-900">지역사회 서포터 관리</h3>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
            {supporters.filter(s => s.status === '활동 가능').length}명 활동 가능
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {supporters.map((supporter) => (
          <Card key={supporter.id} className="p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                  <UserCheck size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{supporter.name}</h4>
                  <p className="text-sm text-slate-500">{supporter.specialty}</p>
                </div>
              </div>
              <Badge variant={supporter.status === '활동 가능' ? 'default' : 'secondary'}>
                {supporter.status}
              </Badge>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <MapPin size={16} className="text-slate-400" />
                <span>{supporter.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Star size={16} className="text-yellow-500 fill-yellow-500" />
                <span className="font-medium text-slate-900">{supporter.rating}</span>
                <span className="text-slate-400">({supporter.completedTasks}회 완료)</span>
              </div>
            </div>

            <button className="w-full mt-6 py-2 text-sm font-medium text-primary border border-primary rounded-md hover:bg-primary hover:text-white transition-colors">
              상세 프로필 보기
            </button>
          </Card>
        ))}
      </div>

      <Card className="shadow-sm overflow-hidden mt-8">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>서포터명</TableHead>
              <TableHead>전문성</TableHead>
              <TableHead>위치</TableHead>
              <TableHead>평점</TableHead>
              <TableHead>상태</TableHead>
              <TableHead className="text-right">활동 기록</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {supporters.map((supporter) => (
              <TableRow key={supporter.id}>
                <TableCell className="font-medium">{supporter.name}</TableCell>
                <TableCell>{supporter.specialty}</TableCell>
                <TableCell>{supporter.location}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-yellow-500 fill-yellow-500" />
                    {supporter.rating}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={supporter.status === '활동 가능' ? 'outline' : 'secondary'} className={supporter.status === '활동 가능' ? 'text-emerald-600 border-emerald-200' : ''}>
                    {supporter.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{supporter.completedTasks}회</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
