import type { CanvasShape } from "@/features/board/types/canvas";

export type AnchorSide = 'top' | 'right' | 'bottom' | 'left';

// Lấy tâm của hình
export const getCenter = (shape: CanvasShape) => {
  if (shape.type === 'circle') return { x: shape.x, y: shape.y };
  if (shape.type === 'arrow') {
      const x = (shape.points[0] + shape.points[2]) / 2;
      const y = (shape.points[1] + shape.points[3]) / 2;
      return { x, y };
  }
  return {
    x: shape.x + (shape.width || 0) / 2,
    y: shape.y + (shape.height || 0) / 2,
  };
};

// Tính tọa độ điểm neo theo cạnh
export const getAnchorPoint = (shape: CanvasShape, side: AnchorSide) => {
  const width = shape.width || 0;
  const height = shape.height || 0;
  const x = shape.x;
  const y = shape.y;

  switch (side) {
    case 'top': return { x: x + width / 2, y: y };
    case 'right': return { x: x + width, y: y + height / 2 };
    case 'bottom': return { x: x + width / 2, y: y + height };
    case 'left': return { x: x, y: y + height / 2 };
    default: return { x, y };
  }
};

// Tìm điểm neo gần chuột nhất (Snapping)
export const getNearestAnchor = (shape: CanvasShape, mouseX: number, mouseY: number) => {
  const sides: AnchorSide[] = ['top', 'right', 'bottom', 'left'];
  let minDist = Infinity;
  let nearestSide: AnchorSide = 'top';

  sides.forEach(side => {
    const point = getAnchorPoint(shape, side);
    const dist = Math.sqrt(Math.pow(mouseX - point.x, 2) + Math.pow(mouseY - point.y, 2));
    if (dist < minDist) {
      minDist = dist;
      nearestSide = side;
    }
  });

  // Hút vào nếu khoảng cách < 20px
  if (minDist < 20) {
    return { side: nearestSide, ...getAnchorPoint(shape, nearestSide) };
  }
  return null;
};

// Tính lại mũi tên khi hình di chuyển
export const calculateArrowPoints = (startShape: CanvasShape, endShape: CanvasShape) => {
    const start = getCenter(startShape);
    const end = getCenter(endShape);
    return [start.x, start.y, end.x, end.y];
};