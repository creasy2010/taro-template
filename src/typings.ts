
export interface IParseConfig {
  moduleId: string;
  pagePath: string;
  imgDir?: string;
}

export interface ILayoutData {
  data: ILayoutNode;
  originData: any; // originData目前没用到
}

export interface ILayoutNode {
  children: ILayoutNode[];
  type: string;
  componentType: string;
  componentName: string;
  refComponentName: string;
  attrs: ILayoutNodeAttr;
  props: {
    attrs: ILayoutNodeAttr;
  }
  style: Object;
  modStyleConfig: {
    designWidth: number;
    designHeight: number;
  };
  dataBindingStore?: any[];
}

interface ILayoutNodeAttr {
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
