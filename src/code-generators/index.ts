import { ICompData, ILayoutNode, IParseConfig, IParseResult } from "../typings";
// import codeGenerator from "../code-generator";
import h5Generrator from './html5';
import taroGenerrator from './taro';
import rnGenerrator from './react-native';

/**
 * 切分布局
 */
const divideLayout = (data: ILayoutNode, config: IParseConfig) => {
  let componentNodes = [];

  data.componentName = config.pageName;

  const dealNode = (node: ILayoutNode) => {
    node.children.forEach(child => {
      dealNode(child);
    });
    const className = node.attrs.className;
    if (className && className.startsWith('com_')) {
      // com开头的结点，单独提取布局树、标记为引用组件
      componentNodes.push(node);
      node.refComponentName = className.substring(4);
      node.componentName = node.refComponentName;
    }
  }

  dealNode(data);

  return componentNodes;
}

export const generateCode =  async (config: IParseConfig, data: ILayoutNode): Promise<IParseResult> => {
  const nodes: ILayoutNode[] = divideLayout(data, config);
  let subComps: ICompData[] = [];
  nodes.forEach(node => {
    const subComp = h5Generrator(node, config);
    subComp.componentName = node.componentName;
    subComps.push(subComp);
  });
  let mainComp: ICompData = h5Generrator(data, config);

  return {
    subComps,
    mainComp
  };;
}
