import { ILayoutNode, IParseConfig } from "./typings";

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
    if (className && className.startsWith('com-')) {
      // com开头的结点，单独提取布局树、标记为引用组件
      componentNodes.push(node);
      node.refComponentName = className.substring(4);
      node.componentName = node.refComponentName;
    }
  }

  dealNode(data);

  return componentNodes;
}

/**
 * 重命名className
 * 比如 block_2-->block; img_2,img_4,img_6-->img,img_1,img_2
 */
const renameClassName = (data: ILayoutNode, config: IParseConfig) => {
  let map = {};

  const deal = (node, isRoot?: boolean) => {

    // 引用结点不处理
    if (!isRoot && node.refComponentName) return;

    let className = node.attrs.className;
    if (/_\d+$/.test(className)) {
      // 扫描出样式以"_数字"结尾的结点，放入map
      const pre = className.slice(0, className.lastIndexOf('_'));
      node.attrs.className = pre;
      className = pre;
    }

    if (map[className]) {
      map[className].push(node);
    } else {
      map[className] = [node];
    }

    node.children.forEach(child => {
      deal(child);
    });
  }

  deal(data, true);

  // 重命名样式
  for (let key in map) {
    for (let i = 0; i < map[key].length; i++) {
      if (i != 0) {
        map[key][i].attrs.className = map[key][i].attrs.className + i;
      }
    }
  }

  if (data.refComponentName) {
    data.attrs.className = data.refComponentName;
  } else {
    data.attrs.className = config.pageName;
  }
}

export default async (data: ILayoutNode, config: IParseConfig): Promise<ILayoutNode[]> => {

  // 处理图片
  dealImageUrl(data, config);

  // 切分布局
  const nodes = divideLayout(data, config);

  // 重命名className
  renameClassName(data, config);
  nodes.forEach(node => {
    renameClassName(node, config);
  });

  return nodes;
}
