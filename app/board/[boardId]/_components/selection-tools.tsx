"use client";

import { BringToFront, SendToBack, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Hint } from "@/components/hint";
import { useSelectionBounds } from "@/hooks/use-selection-bounds";
import { useMutation, useSelf } from "@/liveblocks.config";
import { Camera, Color } from "@/types/canvas";
import { memo } from "react";
import { ColorPicker } from "./color-picker";
import { useDeleteLayers } from "@/hooks/use-delete-layers";

interface SelectionToolsProps {
  camera: Camera;
  setLastUsedColor: (color: Color) => void; // This is a function that takes a Color as an argument and returns void
}

/**
 * Renders the selection tools component.
 * @param camera - The camera object.
 * @param setLastUsedColor - The function to set the last used color.
 * @returns The rendered selection tools component.
 */
export const SelectionTools = memo(
  ({ camera, setLastUsedColor }: SelectionToolsProps) => {
    // get the selection from the current user's presence
    const selection = useSelf((me) => me.presence.selection);

    /**
     * Moves the selected layers to the front of the layer stack.
     *
     * @param {Object} storage - The storage object.
     */
    const moveToFront = useMutation(
      ({ storage }) => {
        const liveLayerIds = storage.get("layerIds");
        // create an empty array to hold the indices of the selected layers
        const indices: number[] = [];

        const arr = liveLayerIds.toImmutable(); // convert the liveLayerIds to an array

        // loop through the array of layers and get the indices of the selected layers
        arr.forEach((item, index) => {
          // check if the current layer is in the selection
          if (selection.includes(item)) {
            indices.push(index);
          }
        });

        // loop through the indices of the selected layers and move them to the front of the layer stack
        indices.reverse().forEach((currentIndex, i) => {
          liveLayerIds.move(currentIndex, arr.length - 1 - i);// move the selected layers to the front of the layer stack
        });
      },
      [selection]
    );

    /**
     * Moves the selected layers to the back of the layer stack.
     * @param {Object} storage - The storage object.
     */
    const moveToBack = useMutation(
      ({ storage }) => {
        const liveLayerIds = storage.get("layerIds");
        // create an empty array to hold the indices of the selected layers
        const indices: number[] = [];

        const arr = liveLayerIds.toImmutable(); // convert the liveLayerIds to an array

        // loop through the array of layers and get the indices of the selected layers
        arr.forEach((item, index) => {
          // check if the current layer is in the selection
          if (selection.includes(item)) {
            indices.push(index);
          }
        });

        // loop through the indices of the selected layers and move them to the back of the layer stack
        indices.forEach((currentIndex, i) => {
          liveLayerIds.move(currentIndex, i);
        });
      },
      [selection]
    );

    /**
     * Sets the fill color of the selected layers.
     *
     * @param {Object} storage - The storage object.
     * @param {Color} fill - The fill color to set.
     */
    const setFill = useMutation(
      ({ storage }, fill: Color) => {
        const liveLayers = storage.get("layers");
        setLastUsedColor(fill);

        // For each layer in the selection, set the fill color
        selection.forEach((id) => {
          liveLayers.get(id)?.set("fill", fill);
        });
      },
      [selection, setLastUsedColor]
    );

    const deleteLayers = useDeleteLayers(); // get the deleteLayers function

    // get the selection bounds
    const selectionBounds = useSelectionBounds();

    if (!selectionBounds) return null;

    // calculate the x and y coordinates of the selection
    const x = selectionBounds.width / 2 + selectionBounds.x + camera.x;
    const y = selectionBounds.y + camera.y;

    return (
      <div
        className="flex absolute p-3 rounded-xl bg-white shadow-md border select-none"
        style={{
          transform: `translate(
            calc(${x}px - 50%),
            calc(${y - 16}px - 100%)
             )`,
        }}
      >
        <ColorPicker onChange={setFill} />

        <div className="flex items-center pl-2 ml-2 border-l border-neutral-200">
          {/* A div to hold the two Hint buttons */}
          <div className="flex flex-row gap-y-0.5 ">
            <Hint label="Bring to front">
              <Button variant="board" size="icon" onClick={moveToFront}>
                <BringToFront />
              </Button>
            </Hint>
            <Hint label="Send to back" side="bottom">
              <Button variant="board" size="icon" onClick={moveToBack}>
                <SendToBack />
              </Button>
            </Hint>
          </div>
          {/* A div to hold the delete button */}
          <div className="flex flex-col items-center pl-2">
            <Hint label="Delete">
              <Button variant="board" size="icon" onClick={deleteLayers}>
                <Trash2 />
              </Button>
            </Hint>
          </div>
        </div>
      </div>
    );
  }
);

SelectionTools.displayName = "SelectionTools"; // the string to identify the component in the React DevTools
