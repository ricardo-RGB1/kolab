"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import { nanoid } from "nanoid";
import {
  useHistory,
  useCanRedo,
  useCanUndo,
  useMutation,
  useStorage,
  useOthersMapped,
  useSelf,
} from "@/liveblocks.config";
import {
  CanvasState,
  CanvasMode,
  Camera,
  Color,
  Point,
  LayerType,
  Side,
  XYWH,
} from "@/types/canvas";
import { Info } from "./info";
import { Participants } from "./participants";
import { Toolbar } from "./toolbar";
import { CursorsPresence } from "./cursors-presence";
import {
  colorToCss,
  connectionIdToColor,
  findIntersectionLayerWithRectangle,
  penPointsToPathLayer,
  pointerEventToCanvasPoint,
  resizeBounds,
} from "@/lib/utils";
import { LiveObject } from "@liveblocks/client";
import { LayerPreview } from "./layer-preview";
import { SelectionBox } from "./selection-box";
import { SelectionTools } from "./selection-tools";
import { Path } from "./path";
import { useDisabledScrollBounce } from "@/hooks/use-disable-scroll-bounce";
import { useDeleteLayers } from "@/hooks/use-delete-layers";

const MAX_LAYERS = 100;

interface CanvasProps {
  boardId: string;
}

/**
 * Canvas component represents the main drawing area of the board.
 * It manages the state of the canvas and provides tools for undo and redo actions.
 */
export const Canvas = ({ boardId }: CanvasProps) => {
  // Define the list of layer ids:
  const layerIds = useStorage((root) => root.layerIds);
  const pencilDraft = useSelf((me) => me.presence.pencilDraft);

  // The current state of the canvas
  const [canvasState, setCanvasState] = useState<CanvasState>({
    mode: CanvasMode.None,
  });

  // The last used color
  const [lastUsedColor, setLastUsedColor] = useState<Color>({
    r: 0,
    g: 0,
    b: 0,
  });

  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0 });

  // history, canRedo, and canUndo are provided by the useLiveBlocks hook
  const history = useHistory();
  const canRedo = useCanRedo();
  const canUndo = useCanUndo();
  useDisabledScrollBounce(); // Disable scroll bounce effect on the body element

  /**
   * Inserts a new layer into the canvas.
   *
   * @param storage - The storage object.
   * @param setMyPresence - The function to set the user's presence.
   * @param layerType - The type of the layer to insert.
   * @param position - The position of the layer.
   */
  const insertLayer = useMutation(
    (
      { storage, setMyPresence },
      layerType:
        | LayerType.Ellipse
        | LayerType.Rectangle
        | LayerType.Text
        | LayerType.Note,
      position: Point
    ) => {
      const liveLayers = storage.get("layers");
      if (liveLayers.size >= MAX_LAYERS) {
        return;
      }

      const liveLayerIds = storage.get("layerIds");
      const nanoId = nanoid();
      const layer = new LiveObject({
        type: layerType,
        x: position.x,
        y: position.y,
        height: 100,
        width: 100,
        fill: lastUsedColor,
      });
      liveLayerIds.push(nanoId); // Add the layer id to the list of layer ids
      liveLayers.set(nanoId, layer); // Add the layer to the layers map

      setMyPresence({ selection: [nanoId] }, { addToHistory: true }); // Set the user's presence
      setCanvasState({ mode: CanvasMode.None }); // Reset the canvas mode
    },
    [lastUsedColor]
  );

  /**
   * Translates the selected layers on the canvas.
   *
   * @param {Object} storage - The storage object.
   * @param {Object} self - The self object.
   * @param {Point} point - The new point to translate the layers to.
   */
  const translateSelectedLayers = useMutation(
    ({ storage, self }, point: Point) => {
      // if canvas mode is anything other than translating, return
      if (canvasState.mode !== CanvasMode.Translating) {
        return;
      }

      const offset = {
        x: point.x - canvasState.current.x,
        y: point.y - canvasState.current.y,
      };

      const liveLayers = storage.get("layers");

      // For each layer in the user's selection, update the x and y values.
      for (const id of self.presence.selection) {
        const layer = liveLayers.get(id);
        if (layer) {
          layer.update({
            x: layer.get("x") + offset.x,
            y: layer.get("y") + offset.y,
          });
        }
      }

      // Set the canvas state with the new current point
      setCanvasState({ mode: CanvasMode.Translating, current: point });
    },
    [canvasState]
  );

  /**
   * Clears the selection of layers.
   * If there are layers currently selected, it removes them from the selection.
   * @param {Object} self - The current component instance.
   * @param {Function} setMyPresence - The function to update the presence state.
   **/
  const unselectLayers = useMutation(({ self, setMyPresence }) => {
    if (self.presence.selection.length > 0) {
      // If there are layers selected
      setMyPresence({ selection: [] }, { addToHistory: true }); // Clear the selection
    }
  }, []);

  /**
   * Updates the selection net based on the current and origin points.
   * @param {Point} current - The current point on the canvas.
   * @param {Point} origin - The origin point of the multi-selection.
   */
  const updateSelectionNet = useMutation(
    ({ storage, setMyPresence }, current: Point, origin: Point) => {
      // Get the layers map from the storage
      const layers = storage.get("layers").toImmutable();

      // Update the canvas state with the current point
      setCanvasState({
        mode: CanvasMode.SelectionNet,
        current,
        origin,
      });

      // Get the layer IDs of the intersecting layers
      const ids = findIntersectionLayerWithRectangle(
        layerIds,
        layers,
        origin,
        current
      );

      setMyPresence({ selection: ids });
    },
    [layerIds]
  );

  /**
   * Starts the multi-selection of layers.
   * @param {Point} current - The current point on the canvas.
   * @param {Point} origin - The origin point of the multi-selection.
   */
  const startMultiSelection = useCallback((current: Point, origin: Point) => {
    // If the distance between the current point and the origin point is greater than 10
    if (Math.abs(current.x - origin.x) + Math.abs(current.y - origin.y) > 7) {
      setCanvasState({
        mode: CanvasMode.SelectionNet,
        current,
        origin,
      });
    }
  }, []);

  /**
   * Continues the drawing process.
   *
   * @param setMyPresence - The function to set the user's presence.
   * @param point - The current point of the drawing.
   * @param e - The pointer event.
   */
  const continueDrawing = useMutation(
    ({ self, setMyPresence }, point: Point, e: React.PointerEvent) => {
      const { pencilDraft } = self.presence;

      // If the canvas is not in drawing mode, return
      if (
        canvasState.mode !== CanvasMode.Pencil ||
        e.button !== 1 ||
        pencilDraft == null
      ) {
        return;
      }

      // Set the user's presence with the current cursor position and pencil draft
      setMyPresence({
        cursor: point,
        pencilDraft:
          pencilDraft.length === 1 &&
          pencilDraft[0][0] === point.x &&
          pencilDraft[0][1] === point.y
            ? pencilDraft // Return the pencil draft
            : [...pencilDraft, [point.x, point.y, e.pressure]], // Otherwise, add the current point to the pencil draft
      });
    },
    [canvasState.mode]
  );

  /**
   * Inserts a new path layer into the canvas.
   *
   * @param {Object} options - The options for inserting the path layer.
   * @param {Object} options.storage - The storage object.
   * @param {Object} options.self - The self object.
   * @param {Function} options.setMyPresence - The function to set the presence.
   */
  const insertPath = useMutation(
    ({ storage, self, setMyPresence }) => {
      const liveLayers = storage.get("layers");

      const { pencilDraft } = self.presence;

      // If the pencil draft is null or has less than 2 points, or the number of layers is greater than the maximum number of layers, return
      if (
        pencilDraft == null ||
        pencilDraft.length < 2 ||
        liveLayers.size >= MAX_LAYERS
      ) {
        setMyPresence({ pencilDraft: null });
        return;
      }

      const id = nanoid(); // Generate a new id
      liveLayers.set(
        id,
        new LiveObject(penPointsToPathLayer(pencilDraft, lastUsedColor))
      );

      const liveLayerIds = storage.get("layerIds"); // Get the list of layer ids
      liveLayerIds.push(id); // Add the new layer id to the list of layer ids

      setMyPresence({ pencilDraft: null }); // Reset the pencil draft
      setCanvasState({ mode: CanvasMode.Pencil }); // Set the canvas state to pencil mode
    },
    [lastUsedColor]
  );

  /**
   * Starts the drawing process.
   *
   * @param setMyPresence - The function to set the user's presence.
   * @param point - The starting point of the drawing.
   * @param pressure - The pressure applied while drawing.
   */
  const startDrawing = useMutation(
    ({ setMyPresence }, point: Point, pressure: number) => {
      setMyPresence({
        pencilDraft: [[point.x, point.y, pressure]],
        penColor: lastUsedColor,
      });
    },
    [lastUsedColor]
  );

  /**
   * Resizes the selected layer based on the corner and point.
   *
   * @param storage - The storage object.
   * @param self - The self object.
   * @param point - The point where the resizing is happening.
   */
  const resizeSelectedLayer = useMutation(
    ({ storage, self }, point: Point) => {
      // if the canvas is not in resizing mode, return
      if (canvasState.mode !== CanvasMode.Resizing) {
        return;
      }

      // Resize the bounds based on the corner and point
      const bounds = resizeBounds(
        canvasState.initialBounds,
        canvasState.corner,
        point
      );

      // Get the layers map from the storage
      const liveLayers = storage.get("layers");
      // Get the selected layer from the user's presence
      const layer = liveLayers.get(self.presence.selection[0]);

      // Update the layer with the new bounds
      if (layer) {
        layer.update(bounds);
      }
    },
    [canvasState]
  );

  /**
   * When the user clicks on the small rectangle in the top-left corner of the layer, the layer should be resized.
   * Handles the pointer down event on a resize handle.
   */
  const onResizeHandlePointerDown = useCallback(
    (corner: Side, initialBounds: XYWH) => {
      history.pause();
      setCanvasState({
        mode: CanvasMode.Resizing,
        initialBounds,
        corner,
      });
    },
    [history]
  );

  /**
   * Handles the wheel event to move the camera.
   *
   * @param e - The wheel event.
   */
  const onWheel = useCallback((e: React.WheelEvent) => {
    setCamera((camera) => ({
      x: camera.x - e.deltaX,
      y: camera.y - e.deltaY,
    }));
  }, []);

  /**
   * Handles the pointer move event.
   *
   * @param setMyPresence - The function to set the user's presence.
   * @param e - The pointer event.
   */
  const onPointerMove = useMutation(
    ({ setMyPresence }, e: React.PointerEvent) => {
      e.preventDefault();

      const current = pointerEventToCanvasPoint(e, camera);

      // Logic for translating and resizing layers:
      if (canvasState.mode === CanvasMode.Pressing) {
        // Start the multi-selection
        startMultiSelection(current, canvasState.origin);
      } else if (canvasState.mode === CanvasMode.SelectionNet) {
        // Update the selection net
        updateSelectionNet(current, canvasState.origin);
      } else if (canvasState.mode === CanvasMode.Translating) {
        // Translate the selected layers
        translateSelectedLayers(current);
      } else if (canvasState.mode === CanvasMode.Resizing) {
        // Resize the selected layer
        resizeSelectedLayer(current);
      } else if (canvasState.mode === CanvasMode.Pencil) {
        continueDrawing(current, e);
      }

      // Set the user's presence with the current cursor position
      setMyPresence({ cursor: current });
    },
    [
      canvasState,
      resizeSelectedLayer,
      camera,
      translateSelectedLayers,
      continueDrawing,
      startMultiSelection,
      updateSelectionNet,
    ]
  );

  /**
   * Handles the pointer leave event.
   *
   * @param setMyPresence - The function to set the user's presence.
   */
  const onPointerLeave = useMutation(({ setMyPresence }) => {
    setMyPresence({ cursor: null });
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Get the point on the canvas where the pointer event occurred
      const point = pointerEventToCanvasPoint(e, camera);

      if (canvasState.mode === CanvasMode.Inserting) {
        return;
      }

      // logic for when the canvas state is in drawing mode
      if (canvasState.mode === CanvasMode.Pencil) {
        startDrawing(point, e.pressure); // Start drawing
        return;
      }

      setCanvasState({ origin: point, mode: CanvasMode.Pressing });
    },
    [camera, canvasState.mode, setCanvasState, startDrawing]
  );

  /**
   * Handles the pointer up event.
   * @param {PointerEvent} e - The pointer event.
   */
  const onPointerUp = useMutation(
    ({}, e) => {
      // Get the point on the canvas where the pointer event occurred
      const point = pointerEventToCanvasPoint(e, camera);

      // If the canvas is in none or pressing mode
      if (
        canvasState.mode === CanvasMode.None ||
        canvasState.mode === CanvasMode.Pressing
      ) {
        unselectLayers(); // Unselect the layers
        setCanvasState({ mode: CanvasMode.None }); // Reset the canvas state
        // If the canvas is in inserting mode
      } else if (canvasState.mode === CanvasMode.Pencil) {
        insertPath(); // Insert the path
      } else if (canvasState.mode === CanvasMode.Inserting) {
        // Insert a new layer at the point
        insertLayer(canvasState.layerType, point);
      } else {
        // Otherwise
        setCanvasState({
          // Reset the canvas state
          mode: CanvasMode.None,
        });
      }

      history.resume();
    },
    [
      setCanvasState,
      camera,
      canvasState,
      history,
      insertLayer,
      unselectLayers,
      insertPath,
    ]
  );

  // Get the selections of other users
  const selections = useOthersMapped((other) => other.presence.selection);

  /**
   * Handles the pointer down event on a layer in the canvas.
   * @param {Object} self - The self object.
   * @param {Function} setMyPresence - The function to set the user's presence.
   * @param {React.PointerEvent} e - The pointer event.
   * @param {string} layerId - The ID of the layer that was clicked.
   */
  const onLayerPointerDown = useMutation(
    ({ self, setMyPresence }, e: React.PointerEvent, layerId: string) => {
      if (
        canvasState.mode === CanvasMode.Pencil ||
        canvasState.mode === CanvasMode.Inserting
      ) {
        return;
      }

      history.pause();
      e.stopPropagation();

      const point = pointerEventToCanvasPoint(e, camera);

      if (!self.presence.selection.includes(layerId)) {
        setMyPresence({ selection: [layerId] }, { addToHistory: true });
      }

      setCanvasState({ mode: CanvasMode.Translating, current: point });
    },
    [setCanvasState, camera, history, canvasState.mode]
  ); // Dependencies of the onLayerPointerDown function

  /**
   * Calculates the color selection for each layer based on the user selections.
   * The resulting object maps layer IDs to their corresponding color selection.
   *
   * @param selections - An array of user selections, where each selection is represented as a tuple of connection ID and an array of layer IDs.
   * @returns An object that maps layer IDs to their corresponding color selection.
   */
  const layerIdsToColorSelection = useMemo(() => {
    const layerIdsToColorSelection: Record<string, string> = {};

    for (const user of selections) {
      // For each user selection; example of the selection looks like this: ["connectionId", ["layerId1", "layerId2"]]. Selections is a list of these tuples.
      const [connectionId, selection] = user; // Get the connection ID and the selection; example: ["connectionId", ["layerId1", "layerId2"]]

      for (const layerId of selection) {
        // For each layer in the selection
        layerIdsToColorSelection[layerId] = connectionIdToColor(connectionId); // Map the layer ID to the color selection; example: { "layerId1": "#FF0000" }
      }
    }

    return layerIdsToColorSelection; // Return the resulting object. Example: { "layerId1": "#FF0000", "layerId2": "#00FF00" }
  }, [selections]);


  // Add the deleteLayers hook
  const deleteLayers = useDeleteLayers(); 

  // This useEffect hook is used to set up a keyboard event listener.
  useEffect(() => {
    // This function is the event handler for the 'keydown' event.
    function onKeyDown(e: KeyboardEvent) {
      switch (e.key) {
        case "z": {
          // If the 'z' key is pressed along with either the control key or the meta key, it triggers an undo or redo action.
          if (e.ctrlKey || e.metaKey) {
            if (e.shiftKey) {
              // If the shift key is also pressed, it triggers a redo action.
              history.redo();
            } else {
              // If the shift key is not pressed, it triggers an undo action.
              history.undo();
            }
            break; 
          }
        }
      }
    }

    // The 'keydown' event listener is added to the document.
    // Whenever a key is pressed, the onKeyDown function is called.
    document.addEventListener("keydown", onKeyDown);

    // The cleanup function removes the 'keydown' event listener when the component is unmounted.
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };

    // The useEffect hook will re-run whenever the 'deleteLayers' or 'history' props change.
  }, [deleteLayers, history]); 


  return (
    <main className="h-full  w-full relative bg-neutral-100 touch-none">
      <Info boardId={boardId} />
      <Participants />
      <Toolbar
        canvasState={canvasState}
        setCanvasState={setCanvasState}
        canRedo={canRedo}
        canUndo={canUndo}
        undo={history.undo} // Function to undo the last action
        redo={history.redo} // Function to redo the last action
      />
      <SelectionTools
        camera={camera}
        setLastUsedColor={setLastUsedColor} // Function to set the last used color
      />
      <svg
        className="h-[100vh] w-[100vw]"
        onWheel={onWheel}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        onPointerUp={onPointerUp}
        onPointerDown={onPointerDown}
      >
        <g
          style={{
            transform: `translate(${camera.x}px, ${camera.y}px)`,
          }}
        >
          {layerIds.map((layerId) => (
            <LayerPreview
              key={layerId}
              id={layerId}
              onLayerPointerDown={onLayerPointerDown}
              selectionColor={layerIdsToColorSelection[layerId]} // Get the color selection for the layer
            />
          ))}
          <SelectionBox onResizeHandlePointerDown={onResizeHandlePointerDown} />
          {/* // Draw the selection net */}
          {canvasState.mode === CanvasMode.SelectionNet &&
            canvasState.current != null && (
              <rect
                className="fill-blue-500/5 stroke-blue-500 stroke-1"
                // Set the x and y coordinates of the rectangle to the minimum of the origin and current points
                x={Math.min(canvasState.origin.x, canvasState.current.x)}
                y={Math.min(canvasState.origin.y, canvasState.current.y)}
                width={Math.abs(canvasState.origin.x - canvasState.current.x)}
                height={Math.abs(canvasState.origin.y - canvasState.current.y)}
              />
            )}
          <CursorsPresence />
          {pencilDraft != null && pencilDraft.length > 0 && (
            <Path
              points={pencilDraft}
              fill={colorToCss(lastUsedColor)}
              x={0}
              y={0}
            />
          )}
        </g>
      </svg>
    </main>
  );
};
