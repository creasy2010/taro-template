import { ILayoutNode, IParseConfig } from "./typings";
import visitors from './style-processors';

/**
 * 处理布局数据中的图片url
 * 将图片下载，并将url转成相对路径
 */
const dealImageUrl = (data: ILayoutNode, config: IParseConfig) => {

  // 递归处理图片方法
  const dealImage = (data: ILayoutNode) => {
    // 如果当前结点是图片，处理当前结点
    if (data.type === "Image") {
      const imgSrc = downloadImg(data.attrs.src);
      data.attrs.src = imgSrc;
      data.attrs.source = imgSrc;
      data.props.attrs.src = imgSrc;
      data.props.attrs.source = imgSrc;
    }
    // 递归处理子节点
    data.children && data.children.forEach(i => {
      dealImage(i);
    });
  };

  // 下载图片方法
  let imgIdx = 0;
  const downloadImg = (src) => {
    let imgName = `${config.pageName}${imgIdx++}`;
    config.urllib.request(src, (err, data) => {
      config.fsExtra.writeFile(`${config.imgDir}/${imgName}.png`, data);
    });
    return imgName;
  };

  // 1.递归处理图片结点并下载图片
  dealImage(data);

  // 2.去掉数据绑定字段
  if (data.dataBindingStore) {
    data.dataBindingStore = [];
  }
};

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

export default async (data: ILayoutNode, config: IParseConfig): Promise<ILayoutNode[]> => {

  // 处理图片
  dealImageUrl(data, config);

  // 添加parent
  init(data);

  // 优化样式
  dealNodeStyle(data);

  // 切分布局
  const nodes = divideLayout(data, config);

  return nodes;
}

const init = (data: ILayoutNode) => {
  addParent(data);
}

const addParent = (node: ILayoutNode) => {
  const { display, flexDirection, justifyContent, alignItems } = node.style;
  if (display === 'flex' && !flexDirection) node.style.flexDirection = 'row';
  if (display === 'flex' && !justifyContent) node.style.justifyContent = 'flex-start';
  if (display === 'flex' && !alignItems) node.style.alignItems = 'stretch';
  node.children.forEach(child => {
    child.parent = node;
    addParent(child);
  });
}

const dealNodeStyle = (node) => {
  visitors.forEach(visitor => {
    if (visitor.test(node)) visitor.enter(node);
  });
  node.children.forEach(child => dealNodeStyle(child));
  visitors.forEach(visitor => {
    if (visitor.test(node)) visitor.exit(node);
  });
}
