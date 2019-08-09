const { join } = require("path");
const fs = require("fs");
const prettier = require("prettier");
const dslHelper = require("@imgcook/dsl-helper");
const _ = require("lodash");
const urllib = require("urllib");

const cssProcessor = require('./css-processor');
const switchFn = require("./dsl");          //转换函数
const getData = require("./get-data");

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
  dslConfig.codeDir = "./src/pages/";
}

// 页面名
const pageUrl = dslConfig.pageUrl;
const pageName = pageUrl.split('/').pop();
// imgcook模块id
const moduleId = dslConfig.moduleId;
// 图片存放路径
const imgDir = join(projPath, dslConfig.imgDir) + pageUrl;
// 代码存放路径
const codeDir = join(projPath, dslConfig.codeDir) + pageUrl;


(async () => {

  const { data } = await getData(moduleId);

  // 处理目录
  resolveDir();

  // 处理布局数据中的图片url
  dealImageUrl(data);
  console.log(`图片生成完成 ${imgDir}`);

  // 切分布局
  const nodes = divideLayout(data);

  // 重命名className
  renameClassName(data);
  nodes.forEach(node => {
    renameClassName(node);
  });

  const generateCode = (data) => {
    return switchFn(data, {
      cssProcessor,
      _,
      helper: dslHelper,
      pageName
    }).renderData;
  }

  // 生成组件代码
  nodes.forEach(node => {
    const { tsx, less } = generateCode(node);
    fs.writeFileSync(join(codeDir, `./components/${node.refComponentName}.tsx.temp`), tsx);
    fs.writeFileSync(join(codeDir, `./components/${node.refComponentName}.less`), less);
  });

  // 生成index页代码
  const { tsx, less } = generateCode(data);
  fs.writeFileSync(join(codeDir, `./index.tsx.temp`), tsx);
  fs.writeFileSync(join(codeDir, `./index.less`), less);

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
    let imgName = `${pageName}${imgIdx++}`;
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


/**
 * 切分布局
 */
const divideLayout = (data) => {
  let componentNodes = [];

  data.componentName = pageName;

  const dealNode = (node) => {
    node.children.forEach(child => {
      dealNode(child);
    });
    const className = node.attrs.className;
    if (className && className.startsWith('com-')) {
      // com开头的结点，单独提取布局树、标记为引用组件
      componentNodes.push(node);
      node.refComponentName = className.substring(4);
      node.componentName = node.refComponentName;
    }
  }

  dealNode(data);

  return componentNodes;
}

/**
 * 重命名className
 * 比如 block_2-->block; img_2,img_4,img_6-->img,img_1,img_2
 */
const renameClassName = (data) => {
  let map = {};

  const deal = (node, isRoot) => {

    // 引用结点不处理
    if (!isRoot && node.refComponentName) return;

    let className = node.attrs.className;
    if (/_\d+$/.test(className)) {
      // 扫描出样式以"_数字"结尾的结点，放入map
      const pre = className.slice(0, className.lastIndexOf('_'));
      node.attrs.className = pre;
      className = pre;
    }

    if (map[className]) {
      map[className].push(node);
    } else {
      map[className] = [node];
    }

    node.children.forEach(child => {
      deal(child);
    });
  }

  deal(data, true);

  // 重命名样式
  for (let key in map) {
    for (let i = 0; i < map[key].length; i++) {
      if (i != 0) {
        map[key][i].attrs.className = map[key][i].attrs.className + i;
      }
    }
  }

  if (data.refComponentName) {
    data.attrs.className = data.refComponentName;
  } else {
    data.attrs.className = pageName;
  }
}
