import type { CanvasShape } from "@/features/board/types/canvas";

export const getCenter = (shape: CanvasShape) => {
  // 1. Xử lý trường hợp hình Tròn (Tâm chính là x, y)
  if (shape.type === 'circle') {
    return { x: shape.x, y: shape.y };
  }

  // 2. Xử lý trường hợp Mũi tên (Arrow không có width/height)
  // Ta có thể trả về điểm giữa của mũi tên hoặc tạm thời trả về x,y
  if (shape.type === 'arrow') {
    // Tính trung điểm của mũi tên dựa trên points
    const x = (shape.points[0] + shape.points[2]) / 2;
    const y = (shape.points[1] + shape.points[3]) / 2;
    return { x, y };
  }

  // 3. Xử lý các hình còn lại (Rect, Image, Text, Note)
  // Lúc này TypeScript đã thông minh tự hiểu: "À, nếu không phải circle hay arrow, 
  // thì chắc chắn là mấy hình có width/height rồi".
  
  // Tuy nhiên, TextShape có width là optional (width?), nên cần fallback || 0
  const width = shape.width || 0;
  const height = shape.height || 0;

  return {
    x: shape.x + width / 2,
    y: shape.y + height / 2,
  };
};

export const calculateArrowPoints = (startShape: CanvasShape, endShape: CanvasShape) => {
  const start = getCenter(startShape);
  const end = getCenter(endShape);

  // Thuật toán đơn giản: Nối từ tâm đến tâm
  return [start.x, start.y, end.x, end.y];
};