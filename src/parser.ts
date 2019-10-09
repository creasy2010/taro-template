import { ILayoutNode, IParseConfig, IParseResult } from "./typings";
import * as urllib from 'urllib';
import { processStyle } from './style-processors';
import { generateCode } from './code-generators';
import { join } from "path";
import * as fsExtra from "fs-extra";
import {preClean} from './util/pre';


const dealImg = (config: IParseConfig, data: ILayoutNode) => {
  if (!config.imgDir) {
    config.imgDir = "./src/assets/image/";
  }
  config.imgDir = './data/' + config.pagePath + '/img';
  fsExtra.ensureDirSync(join(config.pwd, config.imgDir));

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
      config.fsExtra.writeFile( join(config.pwd,config.imgDir,`${imgName}.png`), data);
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
export async  function getLayoutJson (moduleId :string): Promise<ILayoutNode> {
  const url = `https://imgcook.taobao.org/api/getModule?moduleId=${moduleId}`;
  let { data, originData } = await new Promise((resolve) => {
    urllib.request(url, (err, data) => {
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
  return data;
}



/**
 * 布局数据转页面代码
 * @param params
 */
export default async (config: IParseConfig): Promise<IParseResult> => {

  // 1.获取依赖数、预处理
  let data = await getLayoutJson(config.moduleId);

   preClean(data);


  // 2.样式优化
  processStyle(data);

  // 3.图片处理
  dealImg(config, data);

  // 4.代码输出
  return generateCode(config, data);
};

