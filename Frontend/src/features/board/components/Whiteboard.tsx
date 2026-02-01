import React, { useState, useRef, useEffect } from "react";
import { Stage, Layer, Rect, Circle, Arrow } from "react-konva";
import { v4 as uuidv4 } from "uuid";
import ShapeNode from "./ShapeNode";
import Toolbar from "./Toolbar";
import MultiTransformer from "./MultiTransformer";
import AnchorOverlay from "./AnchorOverlay";
import GridBackground from "./GridBackground";
import { useImageUpload } from "../hooks/useImageUpload";
import type { CanvasShape, ToolType } from "../types/canvas";
import { calculateArrowPoints, getCenter, getNearestAnchor } from "@/lib/math";
import { Minus, Plus } from "lucide-react";

// --- IMPORT STORE ---
import { useBoardStore } from "../../../stores/useBoardStore";
import UserCursors from "./UserCursors";

// Helper lấy tọa độ chuẩn khi Zoom/Pan
const getRelativePointerPosition = (node: any) => {
  const transform = node.getAbsoluteTransform().copy();
  transform.invert();
  const pos = node.getStage().getPointerPosition();
  return transform.point(pos);
};

const Whiteboard = () => {
  // --- STORE INTEGRATION ---
  // Lấy danh sách shapes từ Store (Single Source of Truth)
  const shapes = useBoardStore((state) => state.shapes);
  
  // Lấy các actions
  const { 
    initConnection, 
    emitShapeUpdate, 
    emitShapeDelete, 
    emitCursorMove 
  } = useBoardStore();

  // --- LOCAL UI STATE (Không cần share cho người khác) ---
  const [tool, setTool] = useState<ToolType>("select");
  const [stageScale, setStageScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectionBox, setSelectionBox] = useState<{ x: number; y: number; width: number; height: number; isVisible: boolean; } | null>(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const currentShapeId = useRef<string | null>(null);
  
  const [hoveredShapeId, setHoveredShapeId] = useState<string | null>(null);
  const [tempConnection, setTempConnection] = useState<{ startId: string; startSide: string; startX: number; startY: number; endX: number; endY: number; } | null>(null);
  const [snapPreview, setSnapPreview] = useState<{ x: number; y: number; } | null>(null);

  const layerRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- 1. KHỞI TẠO KẾT NỐI ---
  useEffect(() => {
    // Tạo tên ngẫu nhiên cho session này (Thực tế sẽ lấy từ Auth)
    const randomName = "User " + Math.floor(Math.random() * 1000);
    initConnection("board-1", randomName);
  }, []);

  // --- 2. XỬ LÝ UPLOAD ẢNH ---
  const { handleFileChange, triggerUpload } = useImageUpload(
    (base64) => {
      const newImage: CanvasShape = {
        id: uuidv4(),
        type: "image",
        x: 100, y: 100, width: 200, height: 200,
        src: base64,
      };
      // Gửi lên server
      emitShapeUpdate(newImage);
      setTool("select");
    }
  );

  // --- 3. XỬ LÝ ZOOM/PAN ---
  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const scaleBy = 1.1;
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    if (newScale < 0.1 || newScale > 5) return;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    setStageScale(newScale);
    setStagePos({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  };

  const handleAnchorDragStart = (shapeId: string, side: string, startX: number, startY: number) => {
    setTempConnection({ startId: shapeId, startSide: side, startX, startY, endX: startX, endY: startY });
    setIsDrawing(true);
  };

  // --- 4. MOUSE DOWN ---
  const handleMouseDown = (e: any) => {
    if (tempConnection) return;
    if (tool === "hand") return;

    const stage = e.target.getStage();
    const pos = getRelativePointerPosition(stage);
    const clickedOnEmpty = e.target === stage;

    // A. LOGIC SELECT
    if (tool === "select") {
      if (clickedOnEmpty) {
        setSelectedIds(new Set());
        setSelectionBox({ x: pos.x, y: pos.y, width: 0, height: 0, isVisible: true });
      } else {
        const clickedId = e.target.attrs.id;
        if (clickedId) {
          const newSelected = new Set(selectedIds);
          if (e.evt.shiftKey) {
            if (newSelected.has(clickedId)) newSelected.delete(clickedId);
            else newSelected.add(clickedId);
          } else {
            if (!newSelected.has(clickedId)) {
              newSelected.clear();
              newSelected.add(clickedId);
            }
          }
          setSelectedIds(newSelected);
        }
      }
      return;
    }

    // B. LOGIC VẼ HÌNH
    setIsDrawing(true);
    const newId = uuidv4();
    currentShapeId.current = newId;
    let newShape: CanvasShape | null = null;

    if (tool === "rect") newShape = { id: newId, type: "rect", x: pos.x, y: pos.y, width: 0, height: 0, fill: "#ff7979" };
    else if (tool === "circle") newShape = { id: newId, type: "circle", x: pos.x, y: pos.y, radius: 0, fill: "#badc58" } as any;
    else if (tool === "note") newShape = { id: newId, type: "note", x: pos.x, y: pos.y, width: 150, height: 150, fill: "#fff740", text: "Note" };
    else if (tool === "arrow") newShape = { id: newId, type: "arrow", points: [pos.x, pos.y, pos.x, pos.y], stroke: "#000", strokeWidth: 2, x: 0, y: 0 };

    if (newShape) {
      // THAY ĐỔI: Gửi lên Store thay vì setShapes local
      emitShapeUpdate(newShape);
      setSelectedIds(new Set([newId]));
    }
  };

  // --- 5. MOUSE MOVE ---
  const handleMouseMove = (e: any) => {
    const stage = e.target.getStage();
    const pos = getRelativePointerPosition(stage);
    if (!pos) return;

    // --- REAL-TIME CURSOR ---
    // Gửi vị trí chuột lên server (Store đã có throttle)
    emitCursorMove(pos.x, pos.y);

    // A. KÉO DÂY ANCHOR
    if (tempConnection) {
      let endX = pos.x, endY = pos.y;
      const targetShape = shapes.find(
        (s) => s.id !== tempConnection.startId && s.type !== "arrow" &&
          pos.x >= s.x && pos.x <= s.x + (s.width || 0) &&
          pos.y >= s.y && pos.y <= s.y + (s.height || 0)
      );

      if (targetShape) {
        const snap = getNearestAnchor(targetShape, pos.x, pos.y);
        if (snap) {
          endX = snap.x; endY = snap.y;
          setSnapPreview({ x: endX, y: endY });
        } else setSnapPreview(null);
      } else setSnapPreview(null);

      setTempConnection({ ...tempConnection, endX, endY });
      return;
    }

    // B. SELECTION BOX
    if (selectionBox && selectionBox.isVisible) {
      setSelectionBox({ ...selectionBox, width: pos.x - selectionBox.x, height: pos.y - selectionBox.y });
      return;
    }

    // C. VẼ HÌNH (DRAWING)
    if (!isDrawing || !currentShapeId.current) return;
    
    // Tìm hình đang vẽ trong Store
    const currentShape = shapes.find(s => s.id === currentShapeId.current);
    if (currentShape) {
        // Tạo bản copy để sửa
        let updatedShape = { ...currentShape };

        if (updatedShape.type === "arrow") updatedShape.points = [updatedShape.points[0], updatedShape.points[1], pos.x, pos.y];
        else if (updatedShape.type === "rect") { updatedShape.width = pos.x - updatedShape.x; updatedShape.height = pos.y - updatedShape.y; }
        else if (updatedShape.type === "circle") { updatedShape.radius = Math.sqrt(Math.pow(pos.x - updatedShape.x, 2) + Math.pow(pos.y - updatedShape.y, 2)); }
        
        // THAY ĐỔI: Gửi update lên Store
        emitShapeUpdate(updatedShape as CanvasShape);
    }
  };

  // --- 6. MOUSE UP ---
  const handleMouseUp = (e: any) => {
    const stage = e.target.getStage();
    const pos = getRelativePointerPosition(stage);

    // A. KẾT THÚC DÂY KẾT NỐI
    if (tempConnection) {
      const targetShape = shapes.find((s) => {
        if (s.id === tempConnection.startId || s.type === "arrow") return false;
        return (
          pos.x >= s.x && pos.x <= s.x + (s.width || 0) &&
          pos.y >= s.y && pos.y <= s.y + (s.height || 0)
        );
      });

      if (targetShape) {
        let endX = pos.x, endY = pos.y;
        if (snapPreview) { endX = snapPreview.x; endY = snapPreview.y; } 
        else {
          const snap = getNearestAnchor(targetShape, pos.x, pos.y);
          if (snap) { endX = snap.x; endY = snap.y; }
          else { const c = getCenter(targetShape); endX = c.x; endY = c.y; }
        }

        const newArrow: CanvasShape = {
          id: uuidv4(), type: "arrow", stroke: "#000", strokeWidth: 2,
          startId: tempConnection.startId, endId: targetShape.id,
          points: [tempConnection.startX, tempConnection.startY, endX, endY],
          x: 0, y: 0,
        };
        // THAY ĐỔI: Gửi lên Store
        emitShapeUpdate(newArrow);
      }
      setTempConnection(null); setSnapPreview(null); setIsDrawing(false);
      return;
    }

    // B. KẾT THÚC SELECTION BOX
    if (selectionBox && selectionBox.isVisible) {
      const box = {
        x: selectionBox.width > 0 ? selectionBox.x : selectionBox.x + selectionBox.width,
        y: selectionBox.height > 0 ? selectionBox.y : selectionBox.y + selectionBox.height,
        width: Math.abs(selectionBox.width), height: Math.abs(selectionBox.height),
      };
      const newSelected = new Set<string>();
      shapes.forEach((s) => {
        const center = getCenter(s);
        if (center.x >= box.x && center.x <= box.x + box.width && center.y >= box.y && center.y <= box.y + box.height) {
          newSelected.add(s.id);
        }
      });
      setSelectedIds(newSelected);
      setSelectionBox(null);
      return;
    }

    setIsDrawing(false);
    currentShapeId.current = null;
    if (tool !== "select" && tool !== "hand") setTool("select");
  };

  // --- 7. HANDLE SHAPE CHANGE (TRANSFORM / DRAG) ---
  const handleShapeChange = (updatedShape: CanvasShape) => {
    // 1. Gửi update hình chính
    emitShapeUpdate(updatedShape);

    // 2. Cập nhật dây chuyền (Cascade) cho các mũi tên
    shapes.forEach((shape) => {
        if (shape.type === "arrow") {
            let changed = false;
            let newPoints = shape.points;

            if (shape.startId === updatedShape.id) {
                const end = shapes.find((s) => s.id === shape.endId);
                // Lưu ý: shapes ở đây có thể chưa kịp cập nhật updatedShape mới nhất (do độ trễ react),
                // nên ta dùng updatedShape truyền vào để tính toán
                if (end) {
                    newPoints = calculateArrowPoints(updatedShape, end);
                    changed = true;
                }
            }
            if (shape.endId === updatedShape.id) {
                const start = shapes.find((s) => s.id === shape.startId);
                if (start) {
                    newPoints = calculateArrowPoints(start, updatedShape);
                    changed = true;
                }
            }

            if (changed) {
                emitShapeUpdate({ ...shape, points: newPoints });
            }
        }
    });
  };

  // --- 8. DELETE FUNCTION ---
  const deleteShapes = () => {
    if (selectedIds.size === 0) return;
    const idsToDelete = new Set(selectedIds);

    // Tìm mũi tên liên quan
    shapes.forEach((shape) => {
      if (shape.type === "arrow") {
        if ((shape.startId && idsToDelete.has(shape.startId)) || (shape.endId && idsToDelete.has(shape.endId))) {
          idsToDelete.add(shape.id);
        }
      }
    });

    // Gửi lệnh xóa lên Store
    emitShapeDelete(Array.from(idsToDelete));
    setSelectedIds(new Set());
    
    // Clear transformer nodes
    if (layerRef.current) {
       const tr = layerRef.current.findOne("Transformer");
       if(tr) tr.nodes([]);
    }
  };

  return (
    <div className="relative w-full h-screen bg-gray-50 overflow-hidden">
      <Toolbar tool={tool} setTool={setTool} onImageUpload={triggerUpload} onDelete={deleteShapes} />
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        draggable={tool === "hand"}
        onWheel={handleWheel}
        scaleX={stageScale}
        scaleY={stageScale}
        x={stagePos.x}
        y={stagePos.y}
        onDragEnd={(e) => {
          if (e.target === e.target.getStage()) {
            setStagePos({ x: e.target.x(), y: e.target.y() });
          }
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <Layer>
          <GridBackground scale={stageScale} x={stagePos.x} y={stagePos.y} width={window.innerWidth} height={window.innerHeight} />
        </Layer>
        
        <Layer ref={layerRef}>
          {shapes.map((shape) => (
            <ShapeNode
              key={shape.id}
              shape={shape}
              onChange={handleShapeChange}
              onMouseEnter={() => !isDrawing && !tempConnection && tool !== "hand" && setHoveredShapeId(shape.id)}
              onMouseLeave={() => !isDrawing && !tempConnection && setHoveredShapeId(null)}
            />
          ))}

          {/* HIỂN THỊ CHUỘT CỦA NGƯỜI KHÁC */}
          <UserCursors />

          {/* Anchor Overlay */}
          {hoveredShapeId && !tempConnection && !isDrawing && tool !== "hand" && (() => {
            const shape = shapes.find((s) => s.id === hoveredShapeId);
            if (shape && shape.type !== "arrow") {
              return <AnchorOverlay shape={shape} onDragStart={(side, x, y) => handleAnchorDragStart(shape.id, side, x, y)} />;
            }
          })()}

          {tempConnection && (
            <Arrow points={[tempConnection.startX, tempConnection.startY, tempConnection.endX, tempConnection.endY]} stroke="#00a1ff" strokeWidth={2} dash={[10, 5]} />
          )}

          {snapPreview && <Circle x={snapPreview.x} y={snapPreview.y} radius={5} fill="#00a1ff" />}

          {selectionBox && selectionBox.isVisible && (
            <Rect {...selectionBox} fill="rgba(0,161,255,0.3)" stroke="#00a1ff" />
          )}

          <MultiTransformer selectedIds={selectedIds} layerRef={layerRef} />
        </Layer>
      </Stage>

      {/* UI ZOOM CONTROL */}
      <div className="absolute bottom-4 left-4 bg-white shadow-md p-2 rounded-lg flex items-center gap-2 z-50 border">
        <button className="p-1 hover:bg-gray-100 rounded" onClick={() => setStageScale((s) => Math.max(0.1, s / 1.2))}>
          <Minus size={16} />
        </button>
        <span className="text-sm font-medium w-12 text-center">
          {Math.round(stageScale * 100)}%
        </span>
        <button className="p-1 hover:bg-gray-100 rounded" onClick={() => setStageScale((s) => Math.min(5, s * 1.2))}>
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
};

export default Whiteboard;