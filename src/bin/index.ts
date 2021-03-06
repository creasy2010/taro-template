import parser from '../parser';
import { join } from "path";
import { IParseConfig, IParseResult } from "../typings";
import * as urllib from 'urllib';
import * as fsExtra from 'fs-extra';

let config: IParseConfig = {
  fsExtra: fsExtra,
  urllib: urllib,
  moduleId: process.argv[2],
  pagePath: process.argv[3],
  pwd: process.cwd(),
};

config.pageName = config.pagePath.split('/').pop();
parser(config).then((res: IParseResult) => {
  console.log(res.mainComp.imports);
  // console.log(res.mainComp.vdom);
  // console.log(res.mainComp.style);
  fsExtra.writeFile(`${join(config.pwd, `./data/${config.pageName}`)}/index.js`, res.mainComp.style);
  fsExtra.writeFile(`${join(config.pwd, `./data/${config.pageName}`)}/index.html`, res.mainComp.vdom);
});


