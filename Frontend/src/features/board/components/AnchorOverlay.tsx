import { getAnchorPoint, type AnchorSide } from "@/lib/math";
import { Circle, Group } from "react-konva";
import type { CanvasShape } from "../types/canvas";

interface AnchorOverlayProps {
  shape: CanvasShape;
  onDragStart: (side: AnchorSide, x: number, y: number) => void;
}

const AnchorOverlay = ({ shape, onDragStart }: AnchorOverlayProps) => {
  const sides: AnchorSide[] = ['top', 'right', 'bottom', 'left'];

  return (
    <Group>
      {sides.map((side) => {
        const { x, y } = getAnchorPoint(shape, side);
        return (
          <Circle
            key={side}
            x={x}
            y={y}
            radius={6}
            fill="#2980b9"
            opacity={0.6}
            stroke="white"
            strokeWidth={1}
            onMouseEnter={(e) => {
              const container = e.target.getStage()?.container();
              if (container) container.style.cursor = "crosshair";
              e.target.to({ scaleX: 1.5, scaleY: 1.5, duration: 0.1 });
            }}
            onMouseLeave={(e) => {
              const container = e.target.getStage()?.container();
              if (container) container.style.cursor = "default";
              e.target.to({ scaleX: 1, scaleY: 1, duration: 0.1 });
            }}
            // QUAN TRỌNG: Bắt sự kiện kéo từ điểm này
            onMouseDown={(e) => {
              e.cancelBubble = true; // Chặn không cho kéo hình bên dưới
              onDragStart(side, x, y);
            }}
          />
        );
      })}
    </Group>
  );
};

export default AnchorOverlay;