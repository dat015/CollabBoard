import { useRef, useEffect } from "react";
import { Rect, Circle, Text, Group, Transformer, Arrow } from "react-konva";
import UrlImage from "./UrlImage";
import type { CanvasShape } from "../types/canvas";
import EditableText from "./EditableText";

interface ShapeNodeProps {
  shape: CanvasShape;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (newAttrs: CanvasShape) => void;
}

const ShapeNode = ({
  shape,
  isSelected,
  onSelect,
  onChange,
}: ShapeNodeProps) => {
  const shapeRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  // 1. Gắn Transformer vào Shape khi được chọn
  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  // 2. Logic xử lý Resize (Transform End)
  const handleTransformEnd = () => {
    const node = shapeRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    // Reset scale về 1 để tránh méo stroke/text, cập nhật width/height thực tế
    node.scaleX(1);
    node.scaleY(1);

    const newAttrs = {
      ...shape,
      x: node.x(),
      y: node.y(),
      rotation: node.rotation(),
    };
    if (shape.type === "arrow") {
      // Mũi tên bị kéo giãn -> nhân tọa độ các điểm với tỷ lệ scale
      const newPoints = shape.points.map((p, i) => {
        // Điểm chẵn là X, lẻ là Y
        return i % 2 === 0 ? p * scaleX : p * scaleY;
      });

      return onChange({
        ...newAttrs,
        points: newPoints,
      } as any);
    }
    // Xử lý riêng cho từng loại (Text resize fontSize, Hình resize width/height)
    if (shape.type === "text") {
      // Text chỉ scale fontSize, không đổi width để tránh vỡ chữ
      // newAttrs.fontSize = shape.fontSize * scaleX;
      // Hoặc đơn giản hơn: giữ nguyên scale cho Text nếu không muốn tính toán phức tạp
      node.scaleX(scaleX);
      node.scaleY(scaleY);
      return onChange({ ...newAttrs, scaleX, scaleY } as any);
    } else {
      // Các hình học cơ bản
      // @ts-ignore
      newAttrs.width = Math.max(5, node.width() * scaleX);
      // @ts-ignore
      newAttrs.height = Math.max(5, node.height() * scaleY);
      onChange(newAttrs as CanvasShape);
    }
  };

  // 3. Props chung cho tất cả các hình
  const commonProps = {
    ref: shapeRef,
    id: shape.id,
    draggable: isSelected,
    onClick: onSelect,
    onTap: onSelect,
    onDragEnd: (e: any) => {
      onChange({
        ...shape,
        x: e.target.x(),
        y: e.target.y(),
      });
    },
    onTransformEnd: handleTransformEnd,
  };

  // 4. Render UI
  const renderShape = () => {
    switch (shape.type) {
      case "rect":
        return <Rect {...shape} {...commonProps} />;

      case "circle":
        return <Circle {...shape} {...commonProps} />;

      case "image":
        return <UrlImage shape={shape} commonProps={commonProps} />;

      case "text":
        return (
          <EditableText
            shape={shape}
            commonProps={commonProps}
            onChange={onChange}
          />
        );

      case "note":
        // Với Note, ta cũng có thể dùng EditableText đè lên
        return (
          <Group {...shape} {...commonProps}>
            <Rect
              width={shape.width}
              height={shape.height}
              fill={shape.fill}
              shadowBlur={5}
              shadowOpacity={0.1}
              cornerRadius={5}
            />
            {/* Thay thế Text thường bằng EditableText */}
            {/* Cần điều chỉnh x,y một chút để chữ không dính sát lề note */}
            <EditableText
              shape={{
                ...shape,
                x: 10, // Padding trái 10px so với Note
                y: 10, // Padding trên 10px so với Note
                width: shape.width - 20, // Trừ padding
                fill: "#333", // Màu chữ của note
              }}
              // Lưu ý: commonProps của Note đã dùng cho Group cha rồi,
              // nên ở đây ta chỉ cần truyền props chỉnh sửa text thôi, không cần drag text chạy lung tung trong note
              commonProps={{}}
              onChange={(newTextShape: any) => {
                // Khi text thay đổi, ta cập nhật lại thuộc tính text của cả cái Note cha
                onChange({
                  ...shape,
                  text: newTextShape.text,
                });
              }}
            />
          </Group>
        );

      case "arrow":
        return (
          <Arrow
            {...shape}
            {...commonProps}
            points={shape.points}
            stroke={shape.stroke || "#000"} // Fallback màu đen nếu thiếu
            strokeWidth={shape.strokeWidth || 2}
            fill={shape.stroke || "#000"} // Màu mũi nhọn
            // --- FIX VẤN ĐỀ "KHÔNG CÓ ĐUÔI" ---
            // Nếu bạn muốn mũi tên 2 đầu, uncomment dòng dưới:
            // pointerAtBeginning={true}

            pointerLength={10}
            pointerWidth={10}
            hitStrokeWidth={20}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      {renderShape()}
      {isSelected && (
        <Transformer
          ref={trRef}
          enabledAnchors={
            shape.type === "arrow" ? ["middle-left", "middle-right"] : undefined
          }
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) return oldBox;
            return newBox;
          }}
        />
      )}
    </>
  );
};

export default ShapeNode;
