import parser from '../index';
import { join } from "path";
import * as fs from "fs";
import { IParseConfig, IParseResult } from "../typings";

const projPath: string = process.cwd();
let configFilePath: string = join(projPath, ".dsl.json");
let config: IParseConfig;
try {
  console.log("读取配置文件", configFilePath);
  if (fs.existsSync(configFilePath)) {
    const res = fs.readFileSync(configFilePath);
    config = JSON.parse(res.toString());
  }
} catch (err) {
  throw new Error("配置读取失败:" + configFilePath);
}

parser(config).then((res: IParseResult) => {
  console.log(res.mainComp.imports);
  console.log(res.mainComp.vdom);
  console.log(res.mainComp.style);
});


