
export interface IParseConfig {
  moduleId: string;
  pagePath: string;
  pageName?: string;
  pwd: string;
  fsExtra: any;
  urllib: any;
  imgDir?: string;
}

export interface ILayoutData {
  data: ILayoutNode;
  originData: any; // originData目前没用到
}

export interface ILayoutNode {
  children: ILayoutNode[];
  type: 'Text' | 'Image' | 'Block' | 'Repeat' | 'Shape';
  parent: ILayoutNode;
  componentType: string;
  componentName: string;
  refComponentName: string;
  attrs: ILayoutNodeAttr;
  props: {
    attrs: ILayoutNodeAttr;
  }
  style: any;
  modStyleConfig: {
    designWidth: number;
    designHeight: number;
  };
  dataBindingStore?: any[];
}

export interface ILayoutNodeAttr {
  className: string;
  src?: string;
  source?: string;
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

