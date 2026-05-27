import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Users, 
  Settings, 
  Bell,
  AlertTriangle
} from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Dashboard from './pages/Dashboard';
import Requests from './pages/Requests';
import Supporters from './pages/Supporters';

const socket = io('http://localhost:3001');

const SettingsPlaceholder = () => (
  <div className="p-8 text-center bg-white rounded-lg shadow-sm">
    <h3 className="text-xl font-bold mb-4">시스템 설정</h3>
    <p className="text-slate-500">설정 페이지는 현재 준비 중입니다.</p>
  </div>
);

function App() {
  const [emergency, setEmergency] = useState<any>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  useEffect(() => {
    socket.on('emergency', (data) => {
      setEmergency(data);
      setIsAlertOpen(true);
      // Play alert sound if possible
    });

    return () => {
      socket.off('emergency');
    };
  }, []);

  return (
    <Router>
      <div className="flex h-screen bg-slate-50">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
          <div className="p-6 border-b border-slate-200">
            <h1 className="text-xl font-bold text-primary flex items-center gap-2">
              <span className="bg-primary text-white p-1 rounded">SS</span>
              Silver Support
            </h1>
            <p className="text-xs text-slate-500 mt-1">Admin Dashboard</p>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <Link to="/" className="flex items-center gap-3 px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-md transition-colors">
              <LayoutDashboard size={20} />
              <span>대시보드</span>
            </Link>
            <Link to="/requests" className="flex items-center gap-3 px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-md transition-colors">
              <ClipboardList size={20} />
              <span>요청 현황</span>
            </Link>
            <Link to="/supporters" className="flex items-center gap-3 px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-md transition-colors">
              <Users size={20} />
              <span>서포터 관리</span>
            </Link>
            <Link to="/settings" className="flex items-center gap-3 px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-md transition-colors">
              <Settings size={20} />
              <span>설정</span>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
            <h2 className="text-lg font-semibold">관리자 시스템</h2>
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
                <span className="text-sm font-medium">관리자 (김우혁)</span>
              </div>
            </div>
          </header>

          <div className="p-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/requests" element={<Requests />} />
              <Route path="/supporters" element={<Supporters />} />
              <Route path="/settings" element={<SettingsPlaceholder />} />
              <Route path="*" element={<Dashboard />} />
            </Routes>
          </div>
        </main>
      </div>

      {/* Emergency Alert Dialog */}
      <Dialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <DialogContent className="sm:max-w-[425px] border-red-200 bg-red-50">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="animate-pulse" />
              긴급 상황 발생!
            </DialogTitle>
            <DialogDescription className="text-red-700 font-medium">
              즉시 조치가 필요한 응급 요청이 접수되었습니다.
            </DialogDescription>
          </DialogHeader>
          {emergency && (
            <div className="bg-white p-4 rounded-lg border border-red-100 shadow-sm space-y-3">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">카테고리</span>
                <p className="font-bold text-slate-900">{emergency.category}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">내용 요약</span>
                <p className="text-slate-700">{emergency.summary}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {emergency.keywords.map((kw: string) => (
                  <span key={kw} className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                    #{kw}
                  </span>
                ))}
              </div>
            </div>
          )}
          <DialogFooter className="sm:justify-start">
            <Button variant="destructive" className="w-full" onClick={() => setIsAlertOpen(false)}>
              상황 확인 및 서포터 매칭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Router>
  );
}

export default App;
