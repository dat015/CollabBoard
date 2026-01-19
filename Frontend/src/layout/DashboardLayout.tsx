import { Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { LogOut, LayoutGrid } from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar cố định */}
      <nav className="h-16 bg-white border-b px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <LayoutGrid className="text-indigo-600 w-8 h-8" />
          <span className="text-xl font-bold text-gray-800">CollabBoard</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-600">
            Xin chào, {user?.displayName}
          </span>
          <button 
            onClick={logout}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-red-500 transition"
            title="Đăng xuất"
          >
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      {/* Nội dung chính (Danh sách bảng) */}
      <main className="max-w-7xl mx-auto py-8 px-6">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;