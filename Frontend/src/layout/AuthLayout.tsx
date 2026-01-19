import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="flex min-h-screen w-full">
      {/* Bên trái: Branding / Ảnh nền */}
      <div className="hidden lg:flex w-1/2 bg-gray-900 items-center justify-center text-white">
        <div className="max-w-md text-center">
          <h1 className="text-4xl font-bold mb-4">CollabBoard</h1>
          <p className="text-gray-400">Nơi ý tưởng thăng hoa cùng đồng đội.</p>
        </div>
      </div>

      {/* Bên phải: Form (Outlet là nơi render Login/Register) */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-8">
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;