import { join } from "path";
import { ILayoutNode, IParseConfig, IParseResult } from "./typings";
import { processStyle } from './style-processors';
import { generateCode } from './code-generators';


const dealImg = (config: IParseConfig, data: ILayoutNode) => {
  if (!config.imgDir) {
    config.imgDir = "./src/assets/image/";
  }
  config.imgDir = join(config.pwd, config.imgDir) + config.pagePath;
  config.fsExtra.ensureDirSync(config.imgDir);

  // 递归处理图片方法
  const dealImage = (data: ILayoutNode) => {
    // 如果当前结点是图片，处理当前结点
    if (data.type === "Image") {
      const imgSrc = downloadImg(data.attrs.src);
      data.attrs.src = imgSrc;
      data.attrs.source = imgSrc;
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

}

/**
 * 获取模块的页面布局json
 * @param moduleId
 */
const getLayoutJson = async (config: IParseConfig): Promise<ILayoutNode> => {
  const url = `https://imgcook.taobao.org/api/getModule?moduleId=${JSON.parse(config.moduleId)}`;
  let { data, originData } = await new Promise((resolve) => {
    config.urllib.request(url, (err, data) => {
      try {
        const moduleData = JSON.parse(data.toString()).data;
        resolve({
          data: JSON.parse(moduleData.json),
          originData: JSON.parse(moduleData.originjson)
        });
      } catch (e) {
        throw new Error("读取imgcook layout数据失败");
      }
    });
  });

  const rmLineHeightPx = (style) => {
    let lineHeight = style.lineHeight;
    if (lineHeight && lineHeight.endsWith('px')) {
      style.lineHeight = parseInt(lineHeight.slice(0, lineHeight.length - 2));
    }
  }

  // 添加parent、设置默认值
  const addParent = (node: ILayoutNode) => {
    const { display, flexDirection, justifyContent, alignItems } = node.style;
    if (display === 'flex' && !flexDirection) node.style.flexDirection = 'row';
    if (display === 'flex' && !justifyContent) node.style.justifyContent = 'flex-start';
    if (display === 'flex' && !alignItems) node.style.alignItems = 'stretch';
    rmLineHeightPx(node.style);
    node.children.forEach(child => {
      child.parent = node;
      addParent(child);
    });
  };
  addParent(data);

  return data;
}



/**
 * 布局数据转页面代码
 * @param params
 */
export default async (config: IParseConfig): Promise<IParseResult> => {

  // 1.获取依赖数、预处理
  let data = await getLayoutJson(config);

  // 2.样式优化
  processStyle(data);

  // 3.图片处理
  dealImg(config, data);

  // 4.代码输出
  return generateCode(config, data);
};
