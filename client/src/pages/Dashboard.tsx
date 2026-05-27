import { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Users, 
  Activity, 
  AlertCircle,
  UserCheck
} from 'lucide-react';
import MapView from '../components/MapView';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('http://localhost:3001/api/stats');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const chartData = stats?.chartData?.length > 0 ? stats.chartData : [
    { name: '의료/낙상', value: 45 },
    { name: '외출지원', value: 25 },
    { name: '정서지원', value: 15 },
    { name: '생활지원', value: 10 },
    { name: '기타', value: 5 },
  ];

  const regionData = stats?.regionData?.length > 0 ? stats.regionData : [
    { region: '전남', ratio: 28.9 },
    { region: '경북', ratio: 28.1 },
    { region: '강원', ratio: 27.4 },
    { region: '전북', ratio: 27.1 },
    { region: '부산', ratio: 25.8 },
    { region: '충남', ratio: 24.0 },
    { region: '경남', ratio: 23.9 },
    { region: '충북', ratio: 23.7 },
  ];

  if (loading) return <div className="flex items-center justify-center h-full text-slate-500 font-medium">통계 데이터를 불러오는 중...</div>;

  return (
    <div className="space-y-8">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">전체 요청</CardTitle>
            <Activity className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats?.total || 0}</div>
            <p className="text-xs text-slate-500 mt-1">+2 from last hour</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-red-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-red-600 uppercase tracking-wider">긴급 상황</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">{stats?.emergency || 0}</div>
            <p className="text-xs text-red-500 mt-1">즉시 대응 필요</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">대기 중</CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats?.pending || 0}</div>
            <p className="text-xs text-slate-500 mt-1">서포터 매칭 대기</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">활동 중 서포터</CardTitle>
            <UserCheck className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700">{stats?.activeSupporters || 0}</div>
            <p className="text-xs text-slate-500 mt-1">현재 투입 인력</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">지역별 고령인구 비율 (%)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="region" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#475569', fontSize: 12}}
                  width={40}
                />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  formatter={(value) => [`${value}%`, '고령인구 비율']}
                />
                <Bar dataKey="ratio" fill="#8884d8" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">요청 카테고리 분포</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(Number(percent) * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">실시간 응급 호출 및 인프라 현황 지도</CardTitle>
        </CardHeader>
        <CardContent>
          <MapView />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-8">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">시간대별 요청 현황</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { time: '09시', count: 4 },
                  { time: '11시', count: 7 },
                  { time: '13시', count: 12 },
                  { time: '15시', count: 18 },
                  { time: '17시', count: 10 },
                  { time: '19시', count: 6 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="count" fill="#475569" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
