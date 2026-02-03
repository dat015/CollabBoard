import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
// import LoginPage from '@/features/auth/components/LoginPage'; // Giả sử bạn đã tạo
// import Dashboard from '@/features/board/components/Dashboard';
import type { JSX, ReactNode } from "react";
import AuthLayout from "@/layout/AuthLayout";
import LoginPage from "@/features/auth/components/LoginPage";
import Whiteboard from "@/features/board/components/Whiteboard";
import HomePage from "@/features/home/components/HomePage";
import DashboardLayout from "@/layout/DashboardLayout";

// Component bảo vệ: Nếu chưa login thì đá về Login
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
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
        <Route element={<AuthLayout />}>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />

          <Route
            path="/register"
            element={
              <PublicRoute>
                <div>Register Page</div>
              </PublicRoute>
            }
          />
        </Route>

        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout /> 
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<HomePage />} />
          <Route path="/board" element={<Whiteboard />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};

