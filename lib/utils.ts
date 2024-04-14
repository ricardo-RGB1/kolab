import { Camera, Color, Layer, PathLayer, LayerType, Point, Side, XYWH } from "@/types/canvas";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// array of colors
const colors = ["#FF6633", "#FFB399", "#FF33FF", "#FFFF99", "#00B3E6"];

/**
 * Converts a connection ID to a color.
 * @param connectionId - The connection ID to convert.
 * @returns The color corresponding to the connection ID.
 */
export function connectionIdToColor(connectionId: number): string {
  return colors[connectionId % colors.length];
}

// In this code snippet, we have a utility function called connectionIdToColor that converts a connection ID to a color from an array of predefined colors. Let's break down the code:
// The function takes one argument, connectionId, which is expected to be a number. Inside the function, the connectionId is used to determine a color from the colors array. This is done by taking the modulus of the connectionId with the length of the colors array.

// The modulus operation (%) returns the remainder of the division of connectionId by the length of the colors array. This ensures that the index used to access the colors array is always within the bounds of the array.

// For example, if the colors array has 5 elements and the connectionId is 7, the index used would be 7 % 5 = 2. So, the third color in the colors array would be returned (arrays are 0-indexed in JavaScript and TypeScript).

// The function then returns the color that corresponds to the calculated index. This color is a string, as indicated by the function's return type annotation (: string).

// This function could be used in a scenario where you have multiple connections, each identified by a unique ID, and you want to assign a color to each connection for display purposes. The color assignment will be consistent as long as the colors array and the connectionId remain the same. This can be useful for visually distinguishing different connections or users in a collaborative application. If the number of connections exceeds the number of colors in the array, the colors will cycle back to the beginning of the array. This ensures that each connection is consistently associated with a color, even as new connections are added.

/**
 * Converts a pointer event to a canvas point relative to the camera.
 * @param e - The pointer event.
 * @param camera - The camera object.
 * @returns The converted canvas point.
 */
export function pointerEventToCanvasPoint(
  e: React.PointerEvent,
  camera: Camera
) {
  return {
    x: Math.round(e.clientX) - camera.x,
    y: Math.round(e.clientY) - camera.y,
  };
}

/**
 * Converts a Color object to a CSS color string.
 * The format of the CSS color string is #RRGGBB.
 * Thus, it returns an RBG color in hexadecimal format.
 * @param color - The Color object to convert.
 * @returns The CSS color string in the format #RRGGBB.
 */
export function colorToCss(color: Color) {
  // return a color in the format #RRGGBB
  return `#${color.r.toString(16).padStart(2, "0")}${color.g
    .toString(16)
    .padStart(2, "0")}${color.b.toString(16).padStart(2, "0")}`;
}

/**
 * Resizes the bounds based on the corner and point.
 *
 * @param bounds - The initial bounds to be resized.
 * @param corner - The corner of the bounds being resized.
 * @param point - The point where the resizing is happening.
 * @returns The resized bounds.
 */
export function resizeBounds(bounds: XYWH, corner: Side, point: Point): XYWH {
  const result = {
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
  };

  // Resize the bounds based on the corner and point: if the left side is being resized, update the x and width values
  if ((corner & Side.Left) === Side.Left) {
    result.x = Math.min(point.x, bounds.x + bounds.width);
    result.width = Math.abs(bounds.x + bounds.width - point.x);
  }

  // Resize the top side of the bounds based on the corner and point
  if ((corner & Side.Top) === Side.Top) {
    result.y = Math.min(point.y, bounds.y + bounds.height);
    result.height = Math.abs(bounds.y + bounds.height - point.y);
  }

  // Resize the right side of the bounds based on the corner and point
  if ((corner & Side.Right) === Side.Right) {
    result.x = Math.min(bounds.x, point.x);
    result.width = Math.abs(point.x - bounds.x);
  }

  // Resize the bottom side of the bounds based on the corner and point
  if ((corner & Side.Bottom) === Side.Bottom) {
    result.y = Math.min(bounds.y, point.y);
    result.height = Math.abs(point.y - bounds.y);
  }

  return result;
}



/**
 * Finds the intersection layer with a rectangle defined by two points.
 * @param layerIds - The array of layer IDs to check for intersection.
 * @param layers - The map of layers indexed by layer ID.
 * @param a - The first point defining the rectangle.
 * @param b - The second point defining the rectangle.
 * @returns The layer IDs of the intersecting layers.
 */
export function findIntersectionLayerWithRectangle(
  layerIds: readonly string[],
  layers: ReadonlyMap<string, Layer>,
  a: Point,
  b: Point,
) {
  // rectangle object with the top-left corner and dimensions
  const rect = {
    x: Math.min(a.x, b.x), // x-coordinate of the top-left corner of the rectangle
    y: Math.min(a.y, b.y), // y-coordinate of the top-left corner of the rectangle
    width: Math.abs(a.x - b.x), // width of the rectangle
    height: Math.abs(a.y - b.y), // height of the rectangle
  };

  // array to store the layerIds of the intersecting layers
  const ids = [];

  // Iterate over the layerIds array to find the intersection layer with the rectangle
  for (const layerId of layerIds) {
      const layer = layers.get(layerId);

      if (layer == null) {
        // if the layer is null, continue to the next iteration
        continue;
      }

      // destructure the layer object to get the x, y, width, and height properties
      const { x, y, width, height } = layer;

      // check if the rectangle intersects with the layer
      if (
        rect.x < x + width &&
        rect.x + rect.width > x &&
        rect.y < y + height &&
        rect.y + rect.height > y
      ) {
        ids.push(layerId); // add the layerId to the ids array
      }
  }

  return ids;
}


/**
 * Calculates the contrasting text color based on the given color.
 * @param color - The color object containing the RGB values.
 * @returns The contrasting text color, either "black" or "white".
 */
export function getContrastingTextColor(color: Color ) {
  // calculate the luminance of the color
  const luminance = 0.299 * color.r + 0.587 * color.g + 0.114 * color.b;
  return luminance > 182 ? "black" : "white";
}


/**
 * Converts an array of points into a PathLayer object.
 * 
 * @param points - The array of points representing the path.
 * @param color - The color of the path.
 * @returns The PathLayer object representing the path.
 * @throws Error if the array of points has less than two points.
 */
export function penPointsToPathLayer(
  points: number[][],
  color: Color,
): PathLayer {
  if (points.length < 2) {
    throw new Error("A path must have at least two points.");
  }

  let left = Number.POSITIVE_INFINITY;
  let top = Number.POSITIVE_INFINITY;
  let right = Number.NEGATIVE_INFINITY;
  let bottom = Number.NEGATIVE_INFINITY;

  // Find the bounding box of the points
  for (const point of points) {
    const [x, y] = point; 

    // if the x-coordinate is less than the current left value, update the left value
    if (left > x) {
      left = x; 
    }

    if (top > y) {
      top = y; 
    }

    if (right < x) {
      right = x; 
    }

    if (bottom < y) {
      bottom = y; 
    }
  }

  return {
    type: LayerType.Path, 
    x: left, 
    y: top,
    width: right - left,
    height: bottom - top,
    fill: color, 
    points: points.map(([x, y, pressure]) => [x - left, y - top, pressure]),
  }
}







/**
 * Converts a stroke array into an SVG path string.
 * @param stroke - The stroke array containing coordinate pairs.
 * @returns The SVG path string representing the stroke.
 */
export function getSvgPathFromStroke(stroke: number[][]) {
  if(!stroke.length) return ""; // if stroke is empty, return an empty string

  // reduce the stroke array to a single value
  const d = stroke.reduce( 
    (acc, [x0, y0], i, arr) => { 
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2); 
      return acc; 
    },
    ["M", ...stroke[0], "Q"] // initial value of the accumulator array
  ); 
  
  d.push("Z"); // push the Z command to close the path
  return d.join(" "); // join the array elements with a space and return the result
}


// The getSvgPathFromStroke function creates a path string that consists of quadratic Bézier curves between each point in the stroke array. It starts with the first point and then adds a curve ("Q") to the midpoint between each pair of points, with the second point of the pair as the control point. It also adds a "Z" at the end to close the path.