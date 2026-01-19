import { MousePointer2, Square, Circle, Type, Image } from 'lucide-react';

const BoardPage = () => {
  return (
    <div className="h-screen w-screen bg-gray-100 relative overflow-hidden">
      
      {/* 1. Header (Floating) - Tên bảng & Nút Share */}
      <div className="absolute top-4 left-4 right-4 h-14 bg-white rounded-lg shadow-sm border px-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
            <button className="font-bold text-gray-700 hover:bg-gray-100 px-2 py-1 rounded">
                🔙 Dashboard
            </button>
            <div className="h-6 w-[1px] bg-gray-300 mx-2"></div>
            <h1 className="font-semibold text-lg">Project Alpha Brainstorm</h1>
        </div>
        <div className="flex -space-x-2">
            {/* Avatar những người đang online */}
            <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white"></div>
            <div className="w-8 h-8 rounded-full bg-red-500 border-2 border-white"></div>
            <button className="bg-indigo-600 text-white px-4 py-1.5 rounded-md ml-4 text-sm font-medium hover:bg-indigo-700">
                Share
            </button>
        </div>
      </div>

      {/* 2. Toolbar (Floating Left) - Công cụ vẽ */}
      <div className="absolute top-1/2 -translate-y-1/2 left-4 bg-white p-2 rounded-lg shadow-lg border flex flex-col gap-2 z-10">
        <ToolButton icon={<MousePointer2 />} active />
        <ToolButton icon={<Square />} />
        <ToolButton icon={<Circle />} />
        <ToolButton icon={<Type />} />
        <ToolButton icon={<Image />} />
      </div>

      {/* 3. CANVAS AREA (Vùng vẽ chính) */}
      <div className="w-full h-full cursor-crosshair">
          {/* Sau này ta sẽ gắn <canvas> vào đây */}
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 pointer-events-none">
              Canvas Area (Zoom: 100%)
          </div>
      </div>

      {/* 4. Zoom Controls (Floating Bottom Right) */}
      <div className="absolute bottom-4 right-4 bg-white p-1 rounded-lg shadow border flex gap-2 z-10">
          <button className="px-3 py-1 hover:bg-gray-100 rounded">-</button>
          <span className="px-2 py-1 text-sm">100%</span>
          <button className="px-3 py-1 hover:bg-gray-100 rounded">+</button>
      </div>
    </div>
  );
};

// Component con cho nút bấm đẹp
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ToolButton = ({ icon, active }: { icon: any, active?: boolean }) => (
    <button className={`p-2 rounded-md transition ${active ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-100 text-gray-600'}`}>
        {icon}
    </button>
);

export default BoardPage;