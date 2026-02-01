import React from "react";
import { Group, Path, Text, Rect } from "react-konva";
import { useBoardStore } from "../../../stores/useBoardStore";

const UserCursors = () => {
  // Lấy danh sách con trỏ từ Store
  // Lưu ý: Store đã tự lọc bỏ con trỏ của chính mình (nếu logic store chuẩn)
  // hoặc ta chấp nhận render đè cũng không sao, nhưng tốt nhất là filter.
  const cursors = useBoardStore((state) => state.cursors);
  const mySessionId = useBoardStore((state) => state.mySessionId);

  return (
    <>
      {Object.values(cursors).map((cursor) => {
        // Không render chính mình (vì mình đã có chuột thật của OS)
        if (cursor.id === mySessionId) return null;

        return (
          <Group key={cursor.id} x={cursor.x} y={cursor.y}>
            {/* 1. Mũi tên chuột (SVG Path) */}
            <Path
              data="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19138L11.7841 12.3673H5.65376Z"
              fill={cursor.color}
              stroke="white"
              strokeWidth={1}
              shadowColor="black"
              shadowBlur={2}
              shadowOpacity={0.3}
            />

            {/* 2. Nhãn tên người dùng (Có nền màu) */}
            <Group x={12} y={12}>
              {/* Nền cho tên */}
              <Rect
                fill={cursor.color}
                cornerRadius={4}
                width={cursor.name.length * 8 + 10} // Tính width tương đối theo độ dài tên
                height={20}
                opacity={0.8}
              />
              {/* Tên */}
              <Text
                text={cursor.name}
                fontSize={12}
                fill="white"
                padding={4}
                fontStyle="bold"
                fontFamily="sans-serif"
              />
            </Group>
          </Group>
        );
      })}
    </>
  );
};

export default React.memo(UserCursors);