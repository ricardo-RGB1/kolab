import { Camera } from "@/types/canvas";
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
  e:React.PointerEvent,
  camera: Camera,
) {
  return {
    x: Math.round(e.clientX) - camera.x,
    y: Math.round(e.clientY) - camera.y,
  }
}