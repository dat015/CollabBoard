import { MousePointer2, Square, Circle, Type, Image as ImageIcon, StickyNote, ArrowRight } from 'lucide-react';
import type { ToolType } from '../types/canvas';

interface ToolbarProps {
  tool: ToolType;
  setTool: (tool: ToolType) => void;
  onImageUpload: () => void;
}

const Toolbar = ({ tool, setTool, onImageUpload }: ToolbarProps) => {
  const tools = [
    { id: 'select', icon: <MousePointer2 />, label: 'Select' },
    { id: 'rect', icon: <Square />, label: 'Rect' },
    { id: 'circle', icon: <Circle />, label: 'Circle' },
    { id: 'text', icon: <Type />, label: 'Text' },
    { id: 'note', icon: <StickyNote />, label: 'Note' },
    { id: 'arrow', icon: <ArrowRight />, label: 'Arrow' },
  ];

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white p-2 rounded-xl shadow-lg border flex gap-2 z-50">
      {tools.map((t) => (
        <button
          key={t.id}
          className={`p-3 rounded-lg transition-colors ${
            tool === t.id ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-100 text-gray-600'
          }`}
          onClick={() => setTool(t.id as ToolType)}
          title={t.label}
        >
          {t.icon}
        </button>
      ))}

      {/* Nút Image riêng vì cần trigger input */}
      <button
        className={`p-3 rounded-lg transition-colors ${
             tool === 'image' ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-100 text-gray-600'
        }`}
        onClick={onImageUpload}
        title="Image"
      >
        <ImageIcon />
      </button>
    </div>
  );
};

export default Toolbar;