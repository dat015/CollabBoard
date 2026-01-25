import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
// import LoginPage from '@/features/auth/components/LoginPage'; // Giả sử bạn đã tạo
// import Dashboard from '@/features/board/components/Dashboard';
import type { JSX } from "react";
import AuthLayout from "@/layout/AuthLayout";
import LoginPage from "@/features/auth/components/LoginPage";
import Whiteboard from "@/features/board/components/Whiteboard";

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
        {/* 1. AuthLayout đóng vai trò Wrapper UI chung */}
        <Route element={<AuthLayout />}>
          {/* 2. PublicRoute bảo vệ logic cho từng trang */}
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
                <div>Register Page Component</div>
              </PublicRoute>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {/* Dashboard Routes */}
      <Routes>
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Whiteboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<div>Dashboard Component</div>} />\{" "}
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
