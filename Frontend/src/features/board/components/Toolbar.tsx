import {
  MousePointer2,
  Square,
  Circle,
  Type,
  Image as ImageIcon,
  StickyNote,
  ArrowRight,
  Trash2,
} from "lucide-react";
import type { ToolType } from "../types/canvas";
import { Hand } from 'lucide-react';
interface ToolbarProps {
  tool: ToolType;
  setTool: (tool: ToolType) => void;
  onImageUpload: () => void;
  onDelete: () => void;

}

const Toolbar = ({ tool, setTool, onImageUpload, onDelete }: ToolbarProps) => {
  const tools = [
    { id: "select", icon: <MousePointer2 />, label: "Select" },
    { id: "rect", icon: <Square />, label: "Rect" },
    { id: "circle", icon: <Circle />, label: "Circle" },
    { id: "text", icon: <Type />, label: "Text" },
    { id: "note", icon: <StickyNote />, label: "Note" },
    { id: "arrow", icon: <ArrowRight />, label: "Arrow" },
    { id: 'hand', icon: <Hand />, label: 'Pan Tool' },
  ];

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white p-2 rounded-xl shadow-lg border flex gap-2 z-50">
      {tools.map((t) => (
        <button
          key={t.id}
          className={`p-3 rounded-lg transition-colors ${
            tool === t.id
              ? "bg-indigo-100 text-indigo-600"
              : "hover:bg-gray-100 text-gray-600"
          }`}
          onClick={() => setTool(t.id as ToolType)}
          title={t.label}
        >
          {t.icon}
        </button>
      ))}

      <button
        className={`p-3 rounded-lg transition-colors ${
          tool === "image"
            ? "bg-indigo-100 text-indigo-600"
            : "hover:bg-gray-100 text-gray-600"
        }`}
        onClick={onImageUpload}
        title="Image"
      >
        <ImageIcon />
      </button>
      <div className="w-[1px] h-8 bg-gray-200 mx-1"></div>

      <button
        className="p-3 rounded-lg transition-colors hover:bg-red-100 text-red-500"
        onClick={onDelete}
        title="Delete (Del/Backspace)"
      >
        <Trash2 size={20} />
      </button>
    </div>
  );
};

export default Toolbar;
