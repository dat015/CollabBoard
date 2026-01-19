import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
// import LoginPage from '@/features/auth/components/LoginPage'; // Giả sử bạn đã tạo
// import Dashboard from '@/features/board/components/Dashboard';
import type { JSX } from 'react';
import AuthLayout from '@/layout/AuthLayout';
import DashboardLayout from '@/layout/DashboardLayout';
import LoginPage from '@/features/auth/components/LoginPage';

// Component bảo vệ: Nếu chưa login thì đá về Login
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Component bảo vệ ngược: Nếu đã login thì không cho vào trang Login nữa
const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useAuthStore();
  return !isAuthenticated ? children : <Navigate to="/" />;
};

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Nhóm Authentication */}
        <Route element={<PublicRoute><AuthLayout /></PublicRoute>}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<div>Register Page</div>} />
        </Route>

        {/* Nhóm Dashboard (Cần đăng nhập) */}
        {/* <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/" element={<DashboardPage />} />
        </Route> */}

        {/* Nhóm Vẽ (Không dùng layout Dashboard, nhưng vẫn cần bảo vệ) */}
        {/* <Route path="/board/:roomId" element={
            <ProtectedRoute><BoardPage /></ProtectedRoute>
        } /> */}
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};