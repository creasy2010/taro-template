export interface IParseConfig {
  moduleId: string;
  pagePath: string;
  pageName?: string;
  pwd: string;
  fsExtra: any;
  urllib: any;
  imgDir?: string;
}

export interface ILayoutNode {
  children: ILayoutNode[];
  type: 'Text' | 'Image' | 'Block' | 'Repeat' | 'Shape';
  parent: ILayoutNode;
  attrs: ILayoutNodeAttr;
  style: IStyle;
  innerText?: string;
  // fixme 以下属性后面尝试删除
  componentType?: string;
  componentName?: string;
  refComponentName?: string;
}

export interface ILayoutNodeAttr {
  className?: string;
  src?: string;
  source?: string;
  __ARGS__?: IPosition
}

export interface IPosition {
  x: number,
  y: number,
  width: number,
  height: number
}

export interface ICompData {
  imports: string;
  vdom: string;
  style: string;
  componentName?: string;
}

export interface IParseResult {
  mainComp: ICompData;
  subComps: ICompData[];
}

export interface IStyle {
  justifyContent?: string;
  alignItems?: string;
  display?: string;
  position?: string;
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  flexDirection?: string;
  flexWrap?: string;
  paddingTop?: number;
  paddingBottom?: number;
  paddingRight?: number;
  paddingLeft?: number;
  marginTop?: number;
  marginBottom?: number;
  marginRight?: number;
  marginLeft?: number;
  width?: number | string;
  height?: number;
  lineHeight?: number;
  fontSize?: number;
  fontWeight?: number;
  borderWidth?: number;
  borderRadius?: number;
  backgroundColor?: string;
  backgroundImage?: string;
  lines?: number;
}

export interface IOriginNode {
  props: {
    style: IStyle
    attrs: { x: number, y: number }
  }
  extra: {
    // 结点的同行结点
    sameRows: IOriginNode[],
    // 结点的同列结点
    sameCols: IOriginNode[],
  },
  children: IOriginNode[]
}
