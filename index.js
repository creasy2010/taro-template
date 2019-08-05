const {resolve, join ,basename} = require("path");
const fs = require("fs");
const prettier = require('prettier');
const dslHelper = require('@imgcook/dsl-helper');
const _ = require('lodash');

const getData = require("./get-data");
// const codeData = require("./src/assets/test-data");    //json数据文件
const switchFn = require('./src/taro-index');          //转换函数

(async () => {
  const baseName = basename(resolve(__dirname, './src/assets/test-data'));

  const { data } = await getData();

  const renderInfo = switchFn(data, {
    prettier,
    _,
    helper: dslHelper,
  },baseName);

  /*const ret = xtplRender(
    resolve(__dirname, '../src/template.xtpl'),
    renderInfo,
    {}
  );*/

  const {tsx, less} = renderInfo.renderData;
  fs.mkdirSync(resolve(__dirname, './dist'));
  await fs.writeFile(join(__dirname, `./dist/${baseName}.tsx`), tsx, () => console.log(`${baseName}.tsx文件生成完成`));
  await fs.writeFile(join(__dirname, `./dist/${baseName}.less`), less, () => console.log(`${baseName}.less文件生成完成`));
})();
