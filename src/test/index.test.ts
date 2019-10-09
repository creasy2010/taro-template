import parser from '../parser';
import * as urllib from 'urllib';
import {join} from 'path';
import {tmpdir} from 'os';
import * as fsExtra from 'fs-extra';
import { readDirFiles, sleep } from "../util/jest-util";
/**
 * @desc
 *
 * @使用场景
 *
 * @coder.yang2010@gmail.com
 * @Date    2019/10/9
 **/

it('正常解析', async () => {
  let tmpDir =  join(tmpdir(), 'index.workbench')
  let config = {
    urllib,
    fsExtra,
    moduleId: '13398',
    pagePath: '/test',
    pageName: 'pageTitle',
    pwd: tmpDir,
  };

  let res = await parser(config);


  // console.log(res.mainComp.imports);
  fsExtra.ensureDirSync(`${join(config.pwd, `./data/${config.pageName}`)}`);

  await fsExtra.writeFile(
    `${join(config.pwd, `./data/${config.pageName}`)}/index.js`,
    res.mainComp.style,
  );
  await fsExtra.writeFile(
    `${join(config.pwd, `./data/${config.pageName}`)}/index.html`,
    res.mainComp.vdom,
  );
  await sleep(1000);
  let constent =  await readDirFiles(join(tmpDir,"data/pageTitle"));
  expect(constent).toMatchSnapshot('正常解析');
});
