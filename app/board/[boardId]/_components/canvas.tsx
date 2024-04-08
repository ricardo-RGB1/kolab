"use client";

import { useCallback, useState } from "react";
import { nanoid } from "nanoid";  
import {
  useHistory,
  useCanRedo,
  useCanUndo,
  useMutation,
  useStorage,
} from "@/liveblocks.config";
import { CanvasState, CanvasMode, Camera, Color, Point, LayerType } from "@/types/canvas";
import { Info } from "./info";
import { Participants } from "./participants";
import { Toolbar } from "./toolbar";
import { CursorsPresence } from "./cursors-presence";
import { pointerEventToCanvasPoint } from "@/lib/utils";
import { LiveObject } from "@liveblocks/client";
import { LayerPreview } from "./layer-preview";


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

  // The current state of the canvas
  const [canvasState, setCanvasState] = useState<CanvasState>({
    mode: CanvasMode.None,
  });

  // The last used color
  const [lastUsedColor, setLastUsedColor ] = useState<Color>({
    r: 0,
    g: 0,
    b: 0,
  }); 

  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0 });

  // history, canRedo, and canUndo are provided by the useLiveBlocks hook
  const history = useHistory();
  const canRedo = useCanRedo();
  const canUndo = useCanUndo();

  
  /**
   * Inserts a new layer into the canvas.
   * 
   * @param storage - The storage object.
   * @param setMyPresence - The function to set the user's presence.
   * @param layerType - The type of the layer to insert.
   * @param position - The position of the layer.
   */
  const insertLayer = useMutation((
    {storage, setMyPresence},
    layerType: LayerType.Ellipse | LayerType.Rectangle | LayerType.Text | LayerType.Note, 
    position: Point,
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
    })
    liveLayerIds.push(nanoId); // Add the layer id to the list of layer ids
    liveLayers.set(nanoId, layer); // Add the layer to the layers map

    setMyPresence({ selection: [nanoId]}, {addToHistory: true}); // Set the user's presence
    setCanvasState({ mode: CanvasMode.None }); // Reset the canvas mode
  }, [lastUsedColor]); 



  // Handles the wheel event to move the camera
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
      setMyPresence({ cursor: current });
    },
    []
  );

  /**
   * Handles the pointer leave event.
   *
   * @param setMyPresence - The function to set the user's presence.
   */
  const onPointerLeave = useMutation(({ setMyPresence }) => {
    setMyPresence({ cursor: null });
  }, []);



  /**
   * Handles the pointer up event.
   * @param {PointerEvent} e - The pointer event.
   */
  const onPointerUp = useMutation((
    {},
    e
  ) => {
    // Get the point on the canvas where the pointer event occurred
    const point = pointerEventToCanvasPoint(e, camera); 

    if(canvasState.mode === CanvasMode.Inserting) { // If the canvas is in inserting mode
      insertLayer(canvasState.layerType, point); // Insert a new layer
    } else { // Otherwise
      setCanvasState({ // Reset the canvas state
        mode: CanvasMode.None,
      }); 
    }

    history.resume(); 
  }, [camera, canvasState, history, insertLayer ])

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
      <svg
        className="h-[100vh] w-[100vw]"
        onWheel={onWheel}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        onPointerUp={onPointerUp}
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
              onLayerPointerDown={() => {}}
              selectionColor="#000"
            />
          ))}
          <CursorsPresence />
        </g>
      </svg>
    </main>
  );
};


