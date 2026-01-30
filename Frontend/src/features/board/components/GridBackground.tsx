import React from 'react';
import { Shape } from 'react-konva';

interface GridBackgroundProps {
  scale: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

const GRID_SIZE = 20; 
const PAGE_WIDTH = 800; 
const PAGE_HEIGHT = 1100; 

const GridBackground = ({ scale, x, y, width, height }: GridBackgroundProps) => {
  return (
    <Shape
      sceneFunc={(ctx, shape) => {
        const startX = Math.floor((-x / scale) / GRID_SIZE) * GRID_SIZE;
        const startY = Math.floor((-y / scale) / GRID_SIZE) * GRID_SIZE;
        
        const endX = Math.floor((-x + width) / scale / GRID_SIZE) * GRID_SIZE;
        const endY = Math.floor((-y + height) / scale / GRID_SIZE) * GRID_SIZE;

        ctx.beginPath();
        
        ctx.strokeStyle = "#e0e0e0"; 
        ctx.lineWidth = 1 / scale; 

        for (let i = startX; i <= endX; i += GRID_SIZE) {
            if (i % PAGE_WIDTH !== 0) {
                ctx.moveTo(i, startY);
                ctx.lineTo(i, endY);
            }
        }

        for (let j = startY; j <= endY; j += GRID_SIZE) {
             if (j % PAGE_HEIGHT !== 0) {
                ctx.moveTo(startX, j);
                ctx.lineTo(endX, j);
             }
        }
        ctx.stroke();

        
        ctx.beginPath();
        ctx.strokeStyle = "#a0a0a0"; 
        ctx.setLineDash([10, 5]); 
        ctx.lineWidth = 1 / scale;

        const startPageX = Math.floor((-x / scale) / PAGE_WIDTH) * PAGE_WIDTH;
        const startPageY = Math.floor((-y / scale) / PAGE_HEIGHT) * PAGE_HEIGHT;

        for (let i = startPageX; i <= endX; i += PAGE_WIDTH) {
            ctx.moveTo(i, startY);
            ctx.lineTo(i, endY);
        }

        for (let j = startPageY; j <= endY; j += PAGE_HEIGHT) {
            ctx.moveTo(startX, j);
            ctx.lineTo(endX, j);
        }
        
        ctx.stroke();
        
        ctx.setLineDash([]); 
      }}
      listening={false} 
    />
  );
};

export default React.memo(GridBackground);