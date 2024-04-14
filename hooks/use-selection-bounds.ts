import { shallow } from "@liveblocks/react";

import { Layer, XYWH } from "@/types/canvas";
import { useStorage, useSelf } from "@/liveblocks.config";

/**
 * Calculates the boundaries of a given array of layers.
 *
 * @param layers - The array of layers to calculate the boundaries for.
 * @returns The boundaries object containing the left, right, top, and bottom values.
 *          Returns null if the layers array is empty.
 */
const boundaries = (layers: Layer[]): XYWH | null => {
  const first = layers[0]; // Get the first layer
  if (!first) return null; // If there are no layers, return null

  // Initialize the boundaries: left, right, top, bottom
  let left = first.x; // Left boundary
  let right = first.x + first.width;
  let top = first.y;
  let bottom = first.y + first.height;

  // Loop through the layers using a for loop and update the boundaries with if statements:
  for (let i = 1; i < layers.length; i++) {
    // Get the x, y, width, and height of the layer
    const { x, y, width, height } = layers[i];

    if (left > x) left = x; // Update the left boundary

    if (right < x + width) right = x + width; // Update the right boundary

    if (top > y) top = y; // Update the top boundary

    if (bottom < y + height) bottom = y + height; // Update the bottom boundary
  }

  // Return the boundaries
  return { x: left, y: top, width: right - left, height: bottom - top };
};



/**
 * Custom hook that retrieves the selection bounds of the user's presence.
 * @returns The boundaries of the selected layers.
 */
export const useSelectionBounds = () => {
  // Get the selection from the user's presence
  const selection = useSelf((me) => me.presence.selection);

  // Return the selection bounds using the useStorage hook
  return useStorage((root) => { 
    const selectedLayers = selection
      .map((layerId) => root.layers.get(layerId)!)
      .filter(Boolean); // Get the selected layers from the root storage

    // Return the boundaries of the selected layers
    return boundaries(selectedLayers);
  }, shallow); // Use the shallow equality check
};
