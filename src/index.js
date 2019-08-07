const { join } = require("path");
const fs = require("fs");
const prettier = require("prettier");
const dslHelper = require("@imgcook/dsl-helper");
const _ = require("lodash");

const getData = require("./get-data");
const switchFn = require("./dsl");          //转换函数
const urllib = require("urllib");

const projPath = process.cwd();

// 读取配置文件
let dslConfig;
let configFilePath = join(projPath, ".dsl.json");
try {
  console.log("读取配置文件", configFilePath);
  if (fs.existsSync(configFilePath)) {
    const res = fs.readFileSync(configFilePath);
    dslConfig = JSON.parse(res.toString());
  } else {
    throw new Error("配置不存在:" + configFilePath);
  }
} catch (err) {
  throw new Error("配置读取失败:" + configFilePath);
}

// 初始值设置
if (!dslConfig.imgDir) {
  dslConfig.imgDir = "./src/assets/image/";
}
if (!dslConfig.codeDir) {
  dslConfig.codeDir = "./src/pages/tempcode/";
}

// 页面名
const pageName = dslConfig.pageName;
// 模块名
const componentName = dslConfig.componentName;
// imgcook模块id
const moduleId = dslConfig.moduleId;
// 图片存放路径
const imgDir = join(projPath, dslConfig.imgDir) + pageName;
// 代码存放路径
const codeDir = join(projPath, dslConfig.codeDir);



(async () => {

  const { data } = await getData(moduleId);

  // 处理目录
  resolveDir();

  // 处理布局数据中的图片url
  dealImageUrl(data);
  console.log(`图片生成完成 ${imgDir}`);

  // 转换代码
  const renderInfo = switchFn(data, {
    prettier,
    _,
    helper: dslHelper,
    // TODO imgcook中没有这两个变量
    pageName,
    componentName
  });

  const { tsx, less } = renderInfo.renderData;
  fs.writeFileSync(join(codeDir, `./${componentName}.tsx`), tsx);
  fs.writeFileSync(join(codeDir, `./${componentName}.less`), less);
  console.log(`文件生成完成 ${codeDir}`);

})();


const resolveDir = () => {
  if (!fs.existsSync(imgDir)) {
    fs.mkdirSync(imgDir);
  }
  if (!fs.existsSync(codeDir)) {
    fs.mkdirSync(codeDir);
  }
};

/**
 * 处理布局数据中的图片url
 * 将图片下载，并将url转成相对路径
 */
const dealImageUrl = (data) => {

  // 递归处理图片方法
  const dealImage = (data) => {
    // 如果当前结点是图片，处理当前结点
    if (data.type === "Image") {
      const imgSrc = downloadImg(data.attrs.src);
      data.attrs.src = imgSrc;
      data.attrs.source = imgSrc;
      data.props.attrs.src = imgSrc;
      data.props.attrs.source = imgSrc;
    }
    // 递归处理子节点
    data.children && data.children.forEach(i => {
      dealImage(i);
    });
  };

  // 下载图片方法
  let imgIdx = 0;
  const downloadImg = (src) => {
    let imgName = `${componentName}${imgIdx++}`;
    urllib.request(src, (err, data) => {
      fs.writeFileSync(`${imgDir}/${imgName}.png`, data);
    });
    return imgName;
  };

  // 1.递归处理图片结点并下载图片
  dealImage(data);

  // 2.去掉数据绑定字段
  if (data.dataBindingStore) {
    data.dataBindingStore = [];
  }
};
