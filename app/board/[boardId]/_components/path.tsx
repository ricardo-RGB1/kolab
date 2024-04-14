import { getSvgPathFromStroke } from '@/lib/utils';
import getStroke from 'perfect-freehand'; 

interface PathProps {
    x: number; 
    y: number; 
    points: number[][];
    fill: string; 
    onPointerDown?: (e: React.PointerEvent) => void;
    stroke?: string;
}


/**
 * Renders a path component.
 * @param x - The x-coordinate of the path.
 * @param y - The y-coordinate of the path.
 * @param points - The points of the path.
 * @param fill - The fill color of the path.
 * @param onPointerDown - The event handler for pointer down event.
 * @param stroke - The stroke color of the path.
 * @returns The rendered path component.
 */
export const Path = ({
    x, 
    y, 
    points, 
    fill, 
    onPointerDown, 
    stroke, 
}: PathProps) => {
  return (
    <path 
        className='drop-shadow-md'
        onPointerDown={onPointerDown}
        d={getSvgPathFromStroke(
          getStroke(points, { // 
            size: 16,
            thinning: 0.5,
            smoothing: 0.5,
            streamline: 0.5,
        })
      )}
      style={{
        transform: `translate(${x}px, ${y}px)`,
      }}
      x={0}
      y={0}
      fill={fill}
      stroke={stroke}
      strokeWidth={1}
    />
  )
}