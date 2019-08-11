// TODO import方式
const { join } = require("path");
const fs = require("fs");
import { ICompData, ILayoutData, ILayoutNode, IParseConfig, IParseResult } from "./typings";
import dataProcessor from './data-processor';
import codeGenerator from './code-generator';

/**
 * 初始化配置
 * @param config
 */
const initConfig = (config: IParseConfig) => {

  const projPath: string = process.cwd();

  if (!config.imgDir) {
    config.imgDir = "./src/assets/image/";
  }
  config.imgDir = join(projPath, config.imgDir) + config.pagePath;

  return config;
}

/**
 * 处理文件目录
 * @param config
 */
const resolveDir = (config: IParseConfig) => {
  if (!fs.existsSync(config.imgDir)) {
    fs.mkdirSync(config.imgDir);
  }
};

/**
 * 获取模块的页面布局json
 * @param moduleId
 */
const getLayoutJson = (moduleId: string): Promise<ILayoutData> => {
  const urllib = require('urllib');
  const url = `https://imgcook.taobao.org/api/getModule?moduleId=${moduleId}`;
  return new Promise((resolve) => {
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
}

/**
 * 布局数据转页面代码
 * @param params
 */
export default async (config: IParseConfig): Promise<IParseResult> => {

  initConfig(config);

  resolveDir(config);

  let { data } = await getLayoutJson(config.moduleId);

  const nodes: ILayoutNode[] = await dataProcessor(data, config);

  let subComps: ICompData[] = [];
  nodes.forEach(node => {
    const subComp = codeGenerator(node, config);
    subComp.componentName = node.componentName;
    subComps.push(subComp);
  });
  let mainComp: ICompData = codeGenerator(data, config);

  return {
    subComps,
    mainComp
  };
};
