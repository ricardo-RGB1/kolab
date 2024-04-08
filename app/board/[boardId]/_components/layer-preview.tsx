"use client";

import { useStorage } from "@/liveblocks.config";
import { LayerType } from "@/types/canvas";
import { memo } from "react";
import { Rectangle } from "./rectangle";

interface LayerPreviewProps {
  id: string;
  onLayerPointerDown: (e: React.PointerEvent, layerId: string) => void; // Callback when the pointer is down on the layer
  selectionColor?: string; // The color of the selection border
}

export const LayerPreview = memo(
  ({ id, onLayerPointerDown, selectionColor }: LayerPreviewProps) => {
    // Get the layer from the storage
    const layer = useStorage((root) => root.layers.get(id));

    console.log({layer}, 'LAYER_PREVIEW')

    if (!layer) {
      return null;
    }

    switch (layer.type) { // Render the layer based on its type
      case LayerType.Rectangle:
        return (
          <Rectangle
            id={id}
            layer={layer}
            onPointerDown={onLayerPointerDown}
            selectionColor={selectionColor}
          />
        );
      default:
        console.log("Unknown layer type");
        return null;
    }
  }
);

LayerPreview.displayName = "LayerPreview";
