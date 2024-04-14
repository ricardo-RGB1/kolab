import { colorToCss } from "@/lib/utils";
import { RectangleLayer } from "@/types/canvas";

interface RectangleProps {
  id: string;
  layer: RectangleLayer;
  onPointerDown: (e: React.PointerEvent, id: string) => void;
  selectionColor?: string;
}

/**
 * Renders a rectangle.
 * @param id - The ID of the rectangle.
 * @param layer - The rectangle layer object.
 * @param onPointerDown - The event handler for the pointer down event.
 * @param selectionColor - The color of the selection.
 * @returns The rendered rectangle component.
 */
export const Rectangle = ({
  id,
  layer, // The layer object
  onPointerDown,
  selectionColor,
}: RectangleProps) => {
  
  const { x, y, width, height, fill } = layer;
  return (
    <rect
      className="drop-shadow-md"
      onPointerDown={(e) => onPointerDown(e, id)}
      style={{
        transform: `translate(${x}px, ${y}px)`,
      }}
      x={0}
      y={0}
      width={width}
      height={height}
      strokeWidth={1}
      fill={fill ? colorToCss(fill) : "#000"}
      stroke={selectionColor || "transparent"}
    />
  );
}
