const {resolve, join} = require("path");
const fs = require("fs");
const prettier = require('prettier');
const dslHelper = require('@imgcook/dsl-helper');
const _ = require('lodash');

const codeData = require("./src/assets/test-data");//json数据文件
const switchFn = require('./src/taro-index');          //转换函数

(async () => {
  const renderInfo = switchFn(codeData, {
    prettier,
    _,
    helper: dslHelper,
  });

  /*const ret = xtplRender(
    resolve(__dirname, '../src/template.xtpl'),
    renderInfo,
    {}
  );*/

  const {tsx, less} = renderInfo.renderData;
  fs.mkdirSync(resolve(__dirname, './dist'));
  await fs.writeFile(join(__dirname, './dist/index.tsx'), tsx, () => console.log('tsx文件生成完成'));
  await fs.writeFile(join(__dirname, './dist/index.less'), less, () => console.log('less文件生成完成'));
})();
