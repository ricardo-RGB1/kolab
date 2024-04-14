export type Color = {
  r: number;
  g: number;
  b: number;
};

export type Camera = {
  x: number;
  y: number;
};

export enum LayerType {
  Rectangle,
  Ellipse,
  Path,
  Text,
  Note,
}

export type RectangleLayer = {
  type: LayerType.Rectangle;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: Color;
  value?: string;
};

export type EllipseLayer = {
  type: LayerType.Ellipse;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: Color;
  value?: string;
};

export type PathLayer = {
  type: LayerType.Path;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: Color;
  points: number[][]; // Matrix of points
  value?: string;
};

export type TextLayer = {
  type: LayerType.Text;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: Color;
  value?: string;
};

export type NoteLayer = {
  type: LayerType.Note;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: Color;
  value?: string;
};

export type Point = {
  x: number;
  y: number;
};

export type XYWH = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export enum Side {
  Top = 1,
  Bottom = 2,
  Left = 4,
  Right = 8,
}

/**
 * Represents the state of the canvas.
 */
export type CanvasState =
  | {
      mode: CanvasMode.None; // The current mode of the canvas
    }
  | {
      mode: CanvasMode.SelectionNet,
      origin: Point; // The origin point of the selection net
      current?: Point; // The current point of the selection net
    }
  | {
      mode: CanvasMode.Translating,
      current: Point; // The current point of the translation
    }
  | {
      mode: CanvasMode.Inserting,
      layerType: LayerType.Ellipse | LayerType.Rectangle | LayerType.Text | LayerType.Note; // The type of layer to insert
    }
  | {
      mode: CanvasMode.Resizing,
      initialBounds: XYWH; // The initial bounds of the layer
      corner: Side; // The corner to resize
    }
  | {
      mode: CanvasMode.Pencil;
    }
  | {
      mode: CanvasMode.Pressing,
      origin: Point;
    };

/**
 * Represents the different modes of the canvas.
 */
export enum CanvasMode {
  None,
  Pressing,
  SelectionNet,
  Translating,
  Inserting,
  Resizing,
  Pencil,
}


export type Layer = RectangleLayer | EllipseLayer | PathLayer | TextLayer | NoteLayer;