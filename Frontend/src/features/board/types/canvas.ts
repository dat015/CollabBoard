export type ToolType = 'select' | 'rect' | 'circle' | 'text' | 'image' | 'note' | 'arrow';

export interface BaseShape {
  id: string;
  type: ToolType;
  x: number;
  y: number;
  rotation?: number;
  scaleX?: number; // Cần thiết cho Text/Image
  scaleY?: number;
}

export interface RectangleShape extends BaseShape {
  type: 'rect';
  width: number;
  height: number;
  fill: string;
}

export interface CircleShape extends BaseShape {
  type: 'circle';
  radius: number;
  fill: string;
}

export interface ImageShape extends BaseShape {
  type: 'image';
  src: string; // URL của ảnh (base64 hoặc link)
  width: number;
  height: number;
}

export interface TextShape extends BaseShape {
  type: 'text';
  text: string;
  fontSize: number;
  fill: string;
  width?: number; // Để wrap text
height?: number;
}

export interface ArrowShape extends BaseShape {
  type: 'arrow';
  points: number[]; // [x1, y1, x2, y2, ...]
  stroke: string;
  strokeWidth: number;
  startId?: string | null; 
  endId?: string | null;
}

export interface NoteShape extends BaseShape {
  type: 'note';
  text: string;
  width: number;
  height: number;
  fill: string; // Màu nền note (thường là vàng)
}

// Cập nhật Union Type
export type CanvasShape = RectangleShape | CircleShape | ImageShape | TextShape | NoteShape | ArrowShape;