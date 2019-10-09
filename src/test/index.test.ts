import parser from '../parser';
import * as urllib from 'urllib';
import {join} from 'path';
import * as fsExtra from 'fs-extra';
/**
 * @desc
 *
 * @使用场景
 *
 * @coder.yang2010@gmail.com
 * @Date    2019/10/9
 **/

it('should 正常解析', async () => {
  let config = {
    urllib,
    fsExtra,
    moduleId: '13398',
    pagePath: '/test',
    pageName: 'pageTitle',
    pwd: join(__dirname, 'index.workbench'),
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
  setTimeout(() => {
    console.log('over ');
  }, 10000);
});
