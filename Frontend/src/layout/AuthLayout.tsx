import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-100 gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[#C7D306]">CollabBoard</h1>
      </div>
      <div className="w-[400px] sm:w-auto md:w-1/2 lg:w-1/3">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
