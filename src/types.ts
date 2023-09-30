export interface OriginalFormat {
  id: string;
  name: string;
  type: string;
  children?: OriginalFormat[];
  characters?: string;
  absoluteBoundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  background: {
    blendMode: string;
    type: string;
    color: {
      r: number;
      g: number;
      b: number;
      a: number;
    };
  }[];
  backgroundColor: {
    r: number;
    g: number;
    b: number;
    a: number;
  };
  itemSpacing: number;
  paddingLeft: number;
  paddingRight: number;
  paddingTop: number;
  paddingBottom?: number;
  layoutMode?: "HORIZONTAL" | "VERTICAL";
  primaryAxisAlignItems?: "SPACE_BETWEEN" | "CENTER" | "MIN" | "MAX";
  counterAxisAlignItems: "CENTER" | "MIN" | "MAX" | "BASELINE";
  style?: {
    fontFamily?: string;
    fontPostScriptName?: string;
    fontWeight?: number;
    fontSize?: number;
    textAlignHorizontal?: "LEFT" | "RIGHT" | "CENTER";
    textAlignVertical?: "BASELINE" | "TOP" | "MIDDLE" | "BOTTOM" | "SUB" | "TEXT-TOP";
    letterSpacing?: string;
    lineHeightPx?: number;
  };
}

export interface MappedFormat {
  name: string;
  id: string;
  parent: null | string;
  type: string;
  text?: string;
  styles: {
    backgroundColor: string;
    paddingLeft?: number;
    paddingRight?: number;
    paddingTop?: number;
    paddingBottom?: number;
    width?: number;
    height: number;
    fontFamily?: string;
    fontPostScriptName?: string;
    fontWeight?: number;
    fontSize?: number;
    textAlign?: "LEFT" | "RIGHT" | "CENTER";
    verticalAlign?: "BASELINE" | "TOP" | "MIDDLE" | "BOTTOM" | "SUB" | "TEXT-TOP";
    letterSpacing?: string;
    lineHeight?: string;
  };
}

export interface FigmaData {
  document: OriginalFormat;
}

export interface CssLayout {
  display: string;
  flexDirection: string;
  justifyContent?: string;
  alignItems?: string;
}
export interface UserPrompt {
  role: "user";
  content: string;
}