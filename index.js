const {resolve, join ,basename} = require("path");
const fs = require("fs");
const prettier = require('prettier');
const dslHelper = require('@imgcook/dsl-helper');
const _ = require('lodash');

const getData = require("./get-data");
// const codeData = require("./src/assets/test-data");    //json数据文件
const switchFn = require('./src/taro-index');          //转换函数
const urllib = require('urllib');

(async () => {
  const baseName = basename(resolve(__dirname, './src/assets/test-data'));

  const { data } = await getData();

  // 处理dist目录
  resolveDir();

  // 处理布局数据中的图片url
  dealImageUrl(data);

  // 转换代码
  const renderInfo = switchFn(data, {
    prettier,
    _,
    helper: dslHelper,
  },baseName);

  // 输出
  const {tsx, less} = renderInfo.renderData;
  await fs.writeFile(join(__dirname, `./dist/${baseName}.tsx`), tsx, () => console.log(`${baseName}.tsx文件生成完成`));
  await fs.writeFile(join(__dirname, `./dist/${baseName}.less`), less, () => console.log(`${baseName}.less文件生成完成`));
})();


/**
 * 处理dist目录
 * 每次生成前先清空
 */
const resolveDir = () => {
  delDir(join(__dirname, './dist/'));
  fs.mkdirSync(join(__dirname, './dist'));
  fs.mkdirSync(join(__dirname, './dist/images'));
}
const delDir = (path) => {
  let files = [];
  if(fs.existsSync(path)){
    files = fs.readdirSync(path);
    files.forEach((file, index) => {
      let curPath = path + "/" + file;
      if(fs.statSync(curPath).isDirectory()){
        delDir(curPath); //递归删除文件夹
      } else {
        fs.unlinkSync(curPath); //删除文件
      }
    });
    fs.rmdirSync(path);
  }
}

/**
 * 处理布局数据中的图片url
 * 将图片下载，并将url转成相对路径
 */
const dealImageUrl = (data) => {

  // 递归处理图片方法
  const dealImage = (data) => {
    // 如果当前结点是图片，处理当前结点
    if (data.type === 'Image') {
      const imgSrc = './images/' + downloadImg(data.attrs.src);
      data.attrs.src = imgSrc;
      data.attrs.source = imgSrc;
      data.props.attrs.src = imgSrc;
      data.props.attrs.source = imgSrc;
    }
    // 递归处理子节点
    data.children && data.children.forEach(i => {
      dealImage(i);
    });
  }

  // 下载图片方法
  let imgIdx = 0;
  const downloadImg = (src) => {
    let imgName = `image-${imgIdx++}.png`;
    urllib.request(src, (err, data) => {
      fs.writeFileSync(join(__dirname, `./dist/images/${imgName}`), data);
    });
    return imgName;
  };

  // 1.递归处理图片结点并下载图片
  dealImage(data);

  // 2.去掉数据绑定字段
  if (data.dataBindingStore) {
    data.dataBindingStore = [];
  }
}
