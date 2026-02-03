import { create } from 'zustand';
import * as signalR from '@microsoft/signalr';
import { throttle } from 'lodash';
import type { CanvasShape } from '@/features/board/types/canvas';
import { isTokenExpired } from '@/utils/jwt';
import axios from '@/lib/axios';

// --- TYPES ---
export interface UserCursor {
  id: string;    // ConnectionId của SignalR
  name: string;  // Tên hiển thị
  color: string; // Màu con trỏ
  x: number;
  y: number;
}

interface BoardState {
  shapes: CanvasShape[];
  cursors: Record<string, UserCursor>;
  connection: signalR.HubConnection | null;
  isConnected: boolean;
  mySessionId: string | null;

  initConnection: (boardId: string, userName: string) => Promise<void>;
  leaveBoard: () => void;
  
  emitShapeUpdate: (shape: CanvasShape) => void;
  emitShapeDelete: (ids: string[]) => void;
  emitCursorMove: (x: number, y: number) => void;

  upsertShape: (shape: CanvasShape) => void;
  removeShapes: (ids: string[]) => void;
  updateCursor: (userId: string, x: number, y: number) => void;
}

const throttledCursorSend = throttle((connection: signalR.HubConnection | null, boardId: string, x: number, y: number) => {
    if (connection?.state === signalR.HubConnectionState.Connected) {
        connection.invoke("MoveCursor", boardId, x, y).catch(console.error);
    }
}, 50);

const throttledShapeSend = throttle((connection: signalR.HubConnection | null, boardId: string, shape: CanvasShape) => {
    if (connection?.state === signalR.HubConnectionState.Connected) {
        connection.invoke("SendShape", boardId, shape).catch(console.error);
    }
}, 20);

let CURRENT_BOARD_ID = "";

export const useBoardStore = create<BoardState>((set, get) => ({
  shapes: [],
  cursors: {},
  connection: null, 
  isConnected: false,
  mySessionId: null,

  initConnection: async (boardId: string, userName: string) => {
    CURRENT_BOARD_ID = boardId;
    const BaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5188";
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${BaseUrl}/boardHub`,{
        accessTokenFactory: async () => {
          let accessToken = localStorage.getItem('token') || '';
          const refreshToken = localStorage.getItem('refreshToken');

          if (!accessToken) return '';

          if (isTokenExpired(accessToken) && refreshToken) {
            try {
              console.log("SignalR: Token hết hạn, đang refresh...");
              
              const response = await axios.post(`${BaseUrl}/api/auth/refresh-token`, {
                refreshToken
              });

              const newAccess = response.data.accessToken;
              const newRefresh = response.data.refreshToken;

              localStorage.setItem('accessToken', newAccess);
              localStorage.setItem('refreshToken', newRefresh);
              
              return newAccess;
            } catch (error) {
              console.error("SignalR Refresh Failed:", error);
              localStorage.clear();
              window.location.href = "/login";
              return '';
            }
          }

          // 3. Nếu còn hạn thì dùng luôn
          return accessToken;
        }
      })
      .withAutomaticReconnect() 
      .configureLogging(signalR.LogLevel.Information)
      .build();

    
    connection.on("ReceiveShape", (shape: CanvasShape) => {
        get().upsertShape(shape);
    });

    connection.on("ShapesDeleted", (ids: string[]) => {
        get().removeShapes(ids);
    });

    connection.on("CursorMoved", (userId: string, x: number, y: number) => {
        get().updateCursor(userId, x, y);
    });

    connection.on("UserJoined", (user: UserCursor) => {
         console.log("User Joined:", user);
         set(state => ({ cursors: { ...state.cursors, [user.id]: user } }));
    });

    connection.on("UserLeft", (userId: string) => {
         const newCursors = { ...get().cursors };
         delete newCursors[userId];
         set({ cursors: newCursors });
    });

    try {
        await connection.start();
        console.log("SignalR Connected. ID:", connection.connectionId);
        
        await connection.invoke("JoinBoard", boardId);

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


  emitShapeUpdate: (shape) => {
    get().upsertShape(shape);
    
    const { connection } = get();
    throttledShapeSend(connection, CURRENT_BOARD_ID, shape);
  },

  emitShapeDelete: (ids) => {
    get().removeShapes(ids);

    const { connection } = get();
    if (connection?.state === signalR.HubConnectionState.Connected) {
        connection.invoke("DeleteShapes", CURRENT_BOARD_ID, ids);
    }
  },

  emitCursorMove: (x, y) => {
    const { connection } = get();
    throttledCursorSend(connection, CURRENT_BOARD_ID, x, y);
  },


  upsertShape: (shape) => set((state) => {
      const index = state.shapes.findIndex(s => s.id === shape.id);
      
      if (index !== -1) {
         
          const newShapes = [...state.shapes];
          newShapes[index] = shape;
          return { shapes: newShapes };
      } else {
          return { shapes: [...state.shapes, shape] };
      }
  }),

  removeShapes: (ids) => set((state) => ({
      shapes: state.shapes.filter(s => !ids.includes(s.id))
  })),

  updateCursor: (userId, x, y) => set((state) => {
      const existingCursor = state.cursors[userId];
      
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