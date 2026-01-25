import React, { useState, useRef } from "react";
import { Stage, Layer } from "react-konva";
import { v4 as uuidv4 } from "uuid";
import ShapeNode from "./ShapeNode";
import Toolbar from "./Toolbar";
import { useImageUpload } from "../hooks/useImageUpload";
import type { CanvasShape, ToolType } from "../types/canvas";
import { calculateArrowPoints, getCenter } from "@/lib/math";

const Whiteboard = () => {
  const [tool, setTool] = useState<ToolType>("select");
  const [shapes, setShapes] = useState<CanvasShape[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const currentShapeId = useRef<string | null>(null);
  // Hook xử lý upload ảnh
  const handleImageLoaded = (base64: string) => {
    const newImage: CanvasShape = {
      id: uuidv4(),
      type: "image",
      x: 100,
      y: 100, // Vị trí mặc định
      width: 200,
      height: 200,
      src: base64,
    };
    setShapes((prev) => [...prev, newImage]);
    setTool("select");
  };

  const { fileInputRef, handleFileChange, triggerUpload } =
    useImageUpload(handleImageLoaded);

  // Xử lý tạo hình mới khi click
  const handleMouseDown = (e: any) => {
    // 1. Nếu đang ở mode Select
    if (tool === "select" || tool === "image") {
      const clickedOnEmpty = e.target === e.target.getStage();
      if (clickedOnEmpty) setSelectedId(null);
      return;
    }

    // 2. Nếu đang ở mode Vẽ
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    const newId = uuidv4();
    let newShape: CanvasShape | null = null;
    if (tool === "arrow") {
      // LOGIC MỚI: Kiểm tra xem có click lên hình nào không?
      // e.target.attrs.id là ID của shape ta gán trong ShapeNode
      const clickedShapeId = e.target.attrs.id;
      const startShape = shapes.find((s) => s.id === clickedShapeId);

      let startX = pos.x;
      let startY = pos.y;

      // Nếu click trúng hình, bắt đầu từ tâm hình đó
      if (startShape) {
        const center = getCenter(startShape);
        startX = center.x;
        startY = center.y;
      }

      newShape = {
        id: newId,
        type: "arrow",
        points: [startX, startY, pos.x, pos.y],
        stroke: "#000",
        strokeWidth: 2,
        startId: startShape ? startShape.id : null, // Lưu lại ID bắt đầu
        endId: null,
        x: 0,
        y: 0,
      };
    } else if (tool === "rect") {
      newShape = {
        id: newId,
        type: "rect",
        x: pos.x,
        y: pos.y,
        width: 100,
        height: 100,
        fill: "#ff7979",
      };
    } else if (tool === "circle") {
      newShape = {
        id: newId,
        type: "circle",
        x: pos.x,
        y: pos.y,
        radius: 50,
        fill: "#badc58",
      } as any;
    } else if (tool === "text") {
      newShape = {
        id: newId,
        type: "text",
        x: pos.x,
        y: pos.y,
        text: "Double click to edit",
        fontSize: 20,
        fill: "#000",
      };
    } else if (tool === "note") {
      newShape = {
        id: newId,
        type: "note",
        x: pos.x,
        y: pos.y,
        width: 150,
        height: 150,
        fill: "#fff740",
        text: "Ghi chú...",
      };
    }

    if (newShape) {
      setShapes([...shapes, newShape]);
      setTool("select");
      setSelectedId(newId);
    }
  };
  const handleMouseMove = (e: any) => {
    if (!isDrawing || !currentShapeId.current) return;

    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();

    // --- FIX QUAN TRỌNG: Kiểm tra nếu chuột ra khỏi màn hình ---
    if (!pos) return; 
    // ---------------------------------------------------------

    setShapes((prevShapes) =>
      prevShapes.map((shape) => {
        if (shape.id === currentShapeId.current) {
          if (shape.type === "arrow") {
            const startX = shape.points[0];
            const startY = shape.points[1];
            return {
              ...shape,
              points: [startX, startY, pos.x, pos.y],
            };
          }
          // ... (giữ nguyên logic rect/circle)
        }
        return shape;
      })
    );
  };

  // 3. MOUSE UP: Kết thúc vẽ
  const handleMouseUp = (e: any) => {
    if (isDrawing && currentShapeId.current) {
      // Tìm mũi tên đang vẽ dở
      const arrow = shapes.find((s) => s.id === currentShapeId.current);

      if (arrow && arrow.type === "arrow") {
        // Kiểm tra xem chuột có thả trên hình nào không?
        // e.target lúc này là cái hình dưới con chuột khi thả tay
        const droppedShapeId = e.target.attrs.id;
        const endShape = shapes.find((s) => s.id === droppedShapeId);

        // Nếu thả trúng một hình (và không phải chính hình bắt đầu)
        if (endShape && endShape.id !== arrow.startId) {
          // Tự động chỉnh lại điểm cuối vào tâm hình đích
          const endCenter = getCenter(endShape);

          // Cập nhật mũi tên: Gán endId và sửa lại points
          const updatedArrow = {
            ...arrow,
            endId: endShape.id,
            points: [
              arrow.points[0],
              arrow.points[1],
              endCenter.x,
              endCenter.y,
            ],
          };

          // Update state
          setShapes((prev) =>
            prev.map((s) => (s.id === arrow.id ? updatedArrow : s)),
          );
        }
      }
    }

    setIsDrawing(false);
    currentShapeId.current = null;
    setTool("select");
  };

  // Cập nhật lại shape khi resize/drag xong
  const handleShapeChange = (updatedShape: CanvasShape) => {
    setShapes((prevShapes) => {
      // 1. Cập nhật hình đang bị kéo
      const newShapes = prevShapes.map((s) =>
        s.id === updatedShape.id ? updatedShape : s,
      );

      // 2. Tìm và cập nhật tất cả mũi tên liên quan đến hình này
      return newShapes.map((shape) => {
        if (shape.type === "arrow") {
          // Nếu mũi tên này bắt đầu từ hình đang di chuyển
          if (shape.startId === updatedShape.id) {
            const endShape = newShapes.find((s) => s.id === shape.endId);
            if (endShape) {
              const newPoints = calculateArrowPoints(updatedShape, endShape);
              return { ...shape, points: newPoints };
            } else {
              // Nếu chỉ có đầu, cập nhật đầu, giữ nguyên đuôi
              const start = getCenter(updatedShape);
              return {
                ...shape,
                points: [start.x, start.y, shape.points[2], shape.points[3]],
              };
            }
          }

          // Nếu mũi tên này kết thúc tại hình đang di chuyển
          if (shape.endId === updatedShape.id) {
            const startShape = newShapes.find((s) => s.id === shape.startId);
            if (startShape) {
              const newPoints = calculateArrowPoints(startShape, updatedShape);
              return { ...shape, points: newPoints };
            } else {
              // Nếu chỉ có đuôi, cập nhật đuôi
              const end = getCenter(updatedShape);
              return {
                ...shape,
                points: [shape.points[0], shape.points[1], end.x, end.y],
              };
            }
          }
        }
        return shape;
      });
    });
  };

  return (
    <div className="relative w-full h-screen bg-gray-50 overflow-hidden">
      <Toolbar tool={tool} setTool={setTool} onImageUpload={triggerUpload} />

      {/* Input ẩn để upload ảnh */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove} // Thêm sự kiện này
        onMouseUp={handleMouseUp}
      >
        <Layer>
          {shapes.map((shape) => (
            <ShapeNode
              key={shape.id}
              shape={shape}
              isSelected={shape.id === selectedId}
              onSelect={() => {
                if (tool === "select") setSelectedId(shape.id);
              }}
              onChange={handleShapeChange}
            />
          ))}
        </Layer>
      </Stage>

      {/* Hướng dẫn UX */}
      <div className="absolute bottom-4 right-4 bg-white/80 p-2 text-xs text-gray-500 rounded backdrop-blur-sm pointer-events-none">
        Double click vào Text/Note để sửa nội dung
      </div>
    </div>
  );
};

export default Whiteboard;
