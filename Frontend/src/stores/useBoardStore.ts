import { create } from 'zustand';
import * as signalR from '@microsoft/signalr';
import { throttle } from 'lodash';
import type { CanvasShape } from '@/features/board/types/canvas';

// --- TYPES ---
export interface UserCursor {
  id: string;    // ConnectionId của SignalR
  name: string;  // Tên hiển thị
  color: string; // Màu con trỏ
  x: number;
  y: number;
}

interface BoardState {
  // DATA
  shapes: CanvasShape[];
  cursors: Record<string, UserCursor>; // Lưu con trỏ người khác (Key là ID)
  connection: signalR.HubConnection | null;
  isConnected: boolean;
  mySessionId: string | null; // ID của chính mình để tránh xử lý tin nhắn của mình gửi

  // ACTIONS (GỌI TỪ UI)
  initConnection: (boardId: string, userName: string) => Promise<void>;
  leaveBoard: () => void;
  
  emitShapeUpdate: (shape: CanvasShape) => void;
  emitShapeDelete: (ids: string[]) => void;
  emitCursorMove: (x: number, y: number) => void;

  // INTERNAL HELPERS (CẬP NHẬT STATE LOCAL)
  upsertShape: (shape: CanvasShape) => void;
  removeShapes: (ids: string[]) => void;
  updateCursor: (userId: string, x: number, y: number) => void;
}

// --- THROTTLING (BÓP BĂNG THÔNG) ---
// Tại sao phải để ngoài store? Để nó không bị tạo lại mỗi lần render.

// Chỉ gửi vị trí chuột 50ms/lần (20fps) - Đủ mượt mà không sập server
const throttledCursorSend = throttle((connection: signalR.HubConnection | null, boardId: string, x: number, y: number) => {
    if (connection?.state === signalR.HubConnectionState.Connected) {
        connection.invoke("MoveCursor", boardId, x, y).catch(console.error);
    }
}, 50);

// Chỉ gửi cập nhật hình 20ms/lần - Tránh spam khi đang resize/drag liên tục
const throttledShapeSend = throttle((connection: signalR.HubConnection | null, boardId: string, shape: CanvasShape) => {
    if (connection?.state === signalR.HubConnectionState.Connected) {
        connection.invoke("SendShape", boardId, shape).catch(console.error);
    }
}, 20);

// Biến cục bộ lưu BoardId (để dùng trong các hàm ngoài store)
let CURRENT_BOARD_ID = "";

export const useBoardStore = create<BoardState>((set, get) => ({
  // --- INITIAL STATE ---
  shapes: [],
  cursors: {},
  connection: null, 
  isConnected: false,
  mySessionId: null,

  // --- CONNECTION LOGIC ---
  initConnection: async (boardId: string, userName: string) => {
    CURRENT_BOARD_ID = boardId;
    const BaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5188";
    // 1. Cấu hình SignalR
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${BaseUrl}/boardHub`,{
        accessTokenFactory: () => {
          const token = localStorage.getItem('token') || ''; 
          
          if (!token) {
            console.warn("Không tìm thấy Token trong LocalStorage!");
          }
          return token;
        }
      })
      .withAutomaticReconnect() // Tự động kết nối lại khi rớt mạng
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // 2. Đăng ký các sự kiện lắng nghe (LISTENERS)
    
    // A. Nhận hình mới/sửa từ người khác
    connection.on("ReceiveShape", (shape: CanvasShape) => {
        get().upsertShape(shape);
    });

    // B. Nhận lệnh xóa từ người khác
    connection.on("ShapesDeleted", (ids: string[]) => {
        get().removeShapes(ids);
    });

    // C. Nhận vị trí chuột người khác
    connection.on("CursorMoved", (userId: string, x: number, y: number) => {
        // userId là ConnectionId của người gửi
        get().updateCursor(userId, x, y);
    });

    // D. Người khác vào phòng -> Thêm cursor ảo
    connection.on("UserJoined", (user: UserCursor) => {
         console.log("User Joined:", user);
         // Thêm vào state cursors
         set(state => ({ cursors: { ...state.cursors, [user.id]: user } }));
    });

    // E. Người khác thoát -> Xóa cursor
    connection.on("UserLeft", (userId: string) => {
         const newCursors = { ...get().cursors };
         delete newCursors[userId];
         set({ cursors: newCursors });
    });

    // 3. Bắt đầu kết nối
    try {
        await connection.start();
        console.log("SignalR Connected. ID:", connection.connectionId);
        
        // Gọi hàm JoinBoard ở Backend để báo danh
        await connection.invoke("JoinBoard", boardId); // Backend cần sửa để nhận thêm userName nếu muốn

        set({ 
            connection, 
            isConnected: true,
            mySessionId: connection.connectionId 
        });
    } catch (err) {
        console.error("SignalR Connection Error: ", err);
    }
  },

  leaveBoard: () => {
      const { connection } = get();
      if (connection) {
          connection.stop();
          set({ connection: null, isConnected: false, shapes: [], cursors: {} });
      }
  },

  // --- OPTIMISTIC UI ACTIONS (Xử lý Local trước -> Gửi Server sau) ---

  emitShapeUpdate: (shape) => {
    // 1. Cập nhật ngay lập tức trên màn hình mình (cho mượt)
    get().upsertShape(shape);
    
    // 2. Gửi lên server (có throttle để tránh spam)
    const { connection } = get();
    throttledShapeSend(connection, CURRENT_BOARD_ID, shape);
  },

  emitShapeDelete: (ids) => {
    // 1. Xóa ngay lập tức local
    get().removeShapes(ids);

    // 2. Gửi lệnh xóa lên server (không cần throttle vì xóa ít khi spam)
    const { connection } = get();
    if (connection?.state === signalR.HubConnectionState.Connected) {
        connection.invoke("DeleteShapes", CURRENT_BOARD_ID, ids);
    }
  },

  emitCursorMove: (x, y) => {
    // Không cần update local cursor của mình (vì chuột thật đã hiển thị rồi)
    // Chỉ cần gửi lên server để người khác thấy
    const { connection } = get();
    throttledCursorSend(connection, CURRENT_BOARD_ID, x, y);
  },

  // --- INTERNAL STATE MODIFIERS (Hàm thuần túy sửa state) ---

  upsertShape: (shape) => set((state) => {
      // Tìm xem hình đã tồn tại chưa
      const index = state.shapes.findIndex(s => s.id === shape.id);
      
      if (index !== -1) {
          // UPDATE: Nếu có rồi thì thay thế
          // Chỉ update nếu dữ liệu mới thực sự khác (tối ưu render)
          const newShapes = [...state.shapes];
          newShapes[index] = shape;
          return { shapes: newShapes };
      } else {
          // INSERT: Nếu chưa có thì thêm mới
          return { shapes: [...state.shapes, shape] };
      }
  }),

  removeShapes: (ids) => set((state) => ({
      shapes: state.shapes.filter(s => !ids.includes(s.id))
  })),

  updateCursor: (userId, x, y) => set((state) => {
      // Logic: Nếu chưa có user này trong list thì tạo tạm (hoặc đợi UserJoined)
      // Ở đây ta update tọa độ
      const existingCursor = state.cursors[userId];
      
      // Tạo một cursor tạm nếu chưa có thông tin đầy đủ (fallback)
      const cursorData = existingCursor || { 
          id: userId, 
          name: 'Anonymous', 
          color: '#ccc', 
          x, y 
      };

      return {
          cursors: {
              ...state.cursors,
              [userId]: { ...cursorData, x, y }
          }
      };
  })
}));