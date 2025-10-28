// FIX: Add type definitions for the application
export type EditorTab = 'adjust' | 'filter' | 'remove' | 'crop' | 'text';

export interface EditState {
  brightness: number;
  contrast: number;
  saturation: number;
  exposure: number;
  warmth: number;
  highlights: number;
  shadows: number;
  sepia: number;
  grayscale: number;
}

export const defaultEditState: EditState = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  exposure: 0,
  warmth: 0,
  highlights: 0,
  shadows: 0,
  sepia: 0,
  grayscale: 0,
};

export interface Filter {
  name: string;
  edits: Partial<EditState>;
}

export interface TextItem {
  id: string;
  text: string;
  font: string;
  size: number;
  color: string;
  position: { x: number; y: number };
}

export interface CropBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

// History state for undo/redo
export interface HistoryState {
  image: string;
  edits: EditState;
  texts: TextItem[];
}
