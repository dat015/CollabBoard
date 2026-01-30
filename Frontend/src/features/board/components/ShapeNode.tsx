import { useRef } from "react";
import { Rect, Circle, Arrow, Group } from "react-konva";
import UrlImage from "./UrlImage";
import EditableText from "./EditableText";
import type { CanvasShape } from "../types/canvas";

interface ShapeNodeProps {
  shape: CanvasShape;
  onChange: (newAttrs: CanvasShape) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const ShapeNode = ({ shape, onChange, onMouseEnter, onMouseLeave }: ShapeNodeProps) => {
  const shapeRef = useRef<any>(null);

  const handleTransformEnd = () => {
    const node = shapeRef.current;
    if (!node) return;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    node.scaleX(1);
    node.scaleY(1);

    const newAttrs = {
      ...shape,
      x: node.x(),
      y: node.y(),
      rotation: node.rotation(),
    };

    if (shape.type === "arrow") {
      const newPoints = shape.points.map((p, i) =>
        i % 2 === 0 ? p * scaleX : p * scaleY
      );
      onChange({ ...newAttrs, points: newPoints } as any);
    } else if (shape.type === "text") {
       onChange({ ...newAttrs, fontSize: (shape.fontSize || 20) * scaleX } as any);
    } else {
       // @ts-ignore
       newAttrs.width = Math.max(5, node.width() * scaleX);
       // @ts-ignore
       newAttrs.height = Math.max(5, node.height() * scaleY);
       onChange(newAttrs as any);
    }
  };

  const commonProps = {
    ref: shapeRef,
    id: shape.id, // ID này rất quan trọng để MultiTransformer tìm thấy
    draggable: true,
    onClick: () => {}, 
    onDragEnd: (e: any) => {
      onChange({ ...shape, x: e.target.x(), y: e.target.y() });
    },
    onTransformEnd: handleTransformEnd,
    onMouseEnter,
    onMouseLeave,
  };

  const renderShape = () => {
    switch (shape.type) {
      case "rect": return <Rect {...shape} {...commonProps} />;
      case "circle": return <Circle {...shape} {...commonProps} />;
      case "image": return <UrlImage shape={shape} commonProps={commonProps} />;
      case "text": return <EditableText shape={shape} commonProps={commonProps} onChange={onChange} />;
      case "note": 
        return (
          <Group {...shape} {...commonProps}>
             <Rect width={shape.width} height={shape.height} fill={shape.fill} shadowBlur={5} cornerRadius={5} />
             <EditableText shape={{...shape, x: 10, y: 10, width: shape.width - 20, fill: '#333'}} commonProps={{}} onChange={(txt: any) => onChange({...shape, text: txt.text})} />
          </Group>
        );
      case "arrow":
        return (
          <Arrow
            {...shape}
            {...commonProps}
            points={shape.points}
            stroke={shape.stroke || "#000"} 
            strokeWidth={shape.strokeWidth || 2}
            fill={shape.stroke || "#000"} 
            pointerLength={10} 
            pointerWidth={10} 
            hitStrokeWidth={20}
          />
        );
      default: return null;
    }
  };

  return <>{renderShape()}</>;
};

export default ShapeNode;