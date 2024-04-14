import { colorToCss } from "@/lib/utils";
import { EllipseLayer } from "@/types/canvas";

interface EllipseProps {
  id: string;
  layer: EllipseLayer;
  onPointerDown: (e: React.PointerEvent, id: string) => void;
  selectionColor?: string;
}

// The ellipse component and its properties using the EllipseLayer type
export const Ellipse = ({
  id,
  layer, // The layer object
  onPointerDown,
  selectionColor,
}: EllipseProps) => {

  const { x, y, width, height, fill } = layer;

  return (
    <ellipse
      className="drop-shadow-md"
      onPointerDown={(e) => onPointerDown(e, id)}
      style={{
        transform: `translate(
            ${x}px,
            ${y}px
        )`,
      }}
      cx={width / 2} // The x-coordinate of the center of the ellipse
      cy={height / 2} // The y-coordinate of the center of the ellipse
      rx={width / 2} // The x-radius of the ellipse
      ry={height / 2} // The y-radius of the ellipse
      fill={fill ? colorToCss(fill) : "#000"}
      stroke={selectionColor || "transparent"}
      strokeWidth="1"
    />
  );
}