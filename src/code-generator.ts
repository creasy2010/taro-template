import { ICompData, ILayoutNode, IParseConfig } from "./typings";
import unifyClassname from "./helper/unify-classname";
import * as helper from "@imgcook/dsl-helper";
import * as _ from "lodash";

export default (layoutData: ILayoutNode, config: IParseConfig): ICompData => {
  const pageName = config.pageName;

  helper.clearInheritedAttr(layoutData, false);
  unifyClassname(layoutData);

  if (layoutData.attrs.className === "root") {
    layoutData = layoutData.children[0];
  }
  const { printer, utils } = helper;
  const _line = helper.utils.line;

  const COMPONENT_TYPE_MAP = {
    link: "View",
    video: "video",
    expview: "View",
    scroller: "ScrollView",
    slider: "Swiper",
    view: "View",
    text: "Text",
    picture: "Image"
  };

  const line = (content, level) => utils.line(content, { indent: { space: level * 2 } });
  const styleMap = {};
  let modConfig = layoutData.modStyleConfig || {  //控制设备宽高
    designWidth: 750,
    designHeight: 1334
  };

  let openCode = {
    start: [],
    end: []
  };

  // 自定义组件
  const extComs = {
    "CartCount": ["<CartCount count={0} getNum={(num) => {}} inventory={0} />", "import CartCount from '@/common/cart-count';"]
  };
  const extComTypes = [];

  // 资源图片
  const images = [];

  // 基础组件
  let componentType = [];
  let _rImport = [
    _line("import Taro, { Component, Config } from '@tarojs/taro';", { indent: { tab: 0 } })
  ];
  openCode.end.push(
    _line(")", { indent: { tab: 2 } }),
    _line("}", { indent: { tab: 1 } }),
    _line("}", { indent: { tab: 0 } })
  );
  openCode.start = _rImport;
  //度量单位转换
  const normalizeStyleValue = (key, value) => {
    switch (key) {
      case "font-size":
      case "margin-left":
      case "margin-top":
      case "margin-right":
      case "margin-bottom":
      case "padding-left":
      case "padding-top":
      case "padding-right":
      case "padding-bottom":
      case "max-width":
      case "width":
      case "height":
      case "border-width":
      case "border-radius":
      case "top":
      case "left":
      case "right":
      case "bottom":
      case "line-height":
      case "letter-spacing":
      case "border-top-right-radius":
      case "border-top-left-radius":
      case "border-bottom-left-radius":
      case "border-bottom-right-radius":
        value = "" + value;
        value = value.replace(/(rem)|(px)/, "");
        value = (Number(value) * 2 * 750) / modConfig.designWidth;
        value = "" + value;

        if (value.length > 3 && value.substr(-3, 3) == "rem") {  //度量单位转换
          value = value.slice(0, -3) + "px";
        } else {
          value += "px";
        }
        break;
      default:
        break;
    }
    return value;
  };

  const parseStyleObject = style =>
    Object.entries(style)
      .filter(([, value]) => value || value === 0)
      .map(([key, value]) => {
        key = _.kebabCase(key);
        return `${key}: ${normalizeStyleValue(key, value)};`;
      });

  const renderStyleItem = (className, style) => [
    line(`.${className} {`, 1),
    ...parseStyleObject(style).map(item => line(item, 2)),
    line("}", 1)
  ];

  const renderStyle = (map) => {
    const styleArr = [];
    // 取第一个样式为外层样式
    const entries = Object.entries(map);
    const first = entries.shift();
    styleArr.push(line(`.${first[0]} {`, 0));
    styleArr.push(...parseStyleObject(first[1]).map(item => line(item, 1)));
    styleArr.push(...[].concat(
      ...entries.map(([className, style]) =>
        renderStyleItem(className, style)
      )
    ));
    styleArr.push(line("}", 0));
    return styleArr;
  };


  const renderTemplateAttr = (key, value) => {
    if (["src", "source"].includes(key)) {
      value = `{${value}}`;
    } else {
      value = JSON.stringify(value);
    }
    return `${key}=${value}`;
  };

  const getFuncBody = content => {
    if (content) {
      return content.match(
        /(?:\/\*[\s\S]*?\*\/|\/\/.*?\r?\n|[^{])+\{([\s\S]*)\};$/
      )[1];
    }
    return "";
  };
  let depth = 0;
  let { dataBindingStore } = layoutData;

  const renderTemplate = (obj, level = 3) => {
    depth = depth + 1;

    obj.element = COMPONENT_TYPE_MAP[obj.componentType] || obj.componentType;

    if (componentType.indexOf(obj.element) === -1) {
      componentType.push(obj.element);
    }

    if (!obj.style) obj.style = {};
    if (!obj.attrs) obj.attrs = {};

    if (obj.style.borderWidth) {
      obj.style.boxSizing = "border-box";
    }

    if (obj.type && obj.type.toLowerCase() === "repeat") {
      obj.style.display = "flex";
      obj.style.flexDirection = "row";
      obj.children.forEach(function(child) {
        delete child.style.marginTop;
      });
    }

    switch (obj.element) {
      case "view":
        obj.element = "view";
        obj.style.display = "flex";
        break;
      case "picture":
        obj.element = "image";
        obj.children = null;
        break;
      case "text":
        obj.children = obj.innerText;
        break;
    }

    if (obj.style.lines == 1 || obj.attrs.lines == 1) {
      delete obj.style.width;
    }

    delete obj.style.lines;
    delete obj.attrs.x;
    delete obj.attrs.y;

    let ret = [];
    let extComFlag = false;
    if (obj.attrs.className) {
      const className = obj.attrs.className;
      obj.attrs.className = _.kebabCase(obj.attrs.className);
      // 处理自定义组件
      let extComTag = className.lastIndexOf("_") == -1 ?
        "" : className.substr(className.lastIndexOf("_") + 1);
      if (Object.keys(extComs).includes(extComTag)) {
        if (extComTypes.indexOf(extComTag) == -1) {
          extComTypes.push(extComTag);
        }
        ret.push(line(extComs[extComTag][0], level));
        extComFlag = true;
      }

      // 处理引用组件
      if (obj.refComponentName && level != 3) { // TODO 用level判断不好
        ret.push(line(`<${obj.refComponentName.replace(/^\S/, s => s.toUpperCase())} />`, level));
        extComFlag = true;
      }
    }

    // 处理普通组件
    if (!extComFlag) {
      if (obj.attrs.source && obj.attrs.src) {
        obj.attrs.src = obj.attrs.source;
        delete obj.attrs.source;
      }

      styleMap[obj.attrs.className] = {
        ...styleMap[obj.attrs.className],
        ...obj.style
      };

      // if (obj.element === "Text") {
      //   let textStyle = styleMap[obj.attrs.className];
      //   if (textStyle.width && textStyle.maxWidth) {
      //     delete textStyle.maxWidth;
      //   }
      // }

      if (obj.element === "Image") {
        if (!images.includes(obj.attrs.src)) {
          images.push(obj.attrs.src);
        }
      }

      let nextLine = "";
      const attrs = Object.entries(obj.attrs).filter(([key, value]) => {
        if (obj.element === "Image") {
          return ["className", "src"].includes(key);
        } else if (obj.element === "video") {
          return [
            "className",
            "src",
            "controls",
            "autoplay",
            "muted",
            "poster"
          ].includes(key);
        }
        return key === "className";
      });
      if (attrs.length > 3) {
        ret.push(line(`<${obj.element}`, level));
        ret = ret.concat(
          attrs.map(([key, value]) =>
            line(renderTemplateAttr(key, value), level + 1)
          )
        );
      } else {
        nextLine = `<${obj.element}`;
        if (attrs.length) {
          nextLine += ` ${attrs
            .map(([key, value]) => renderTemplateAttr(key, value))
            .join(" ")}`;
        }
      }
      if (obj.children) {
        if (Array.isArray(obj.children) && obj.children.length) {
          // 多行 Child
          ret.push(line(`${nextLine}>`, level));
          ret = ret.concat(
            ...obj.children.map(o => renderTemplate(o, level + 1))
          );
          ret.push(line(`</${obj.element}>`, level));
        } else {
          // 单行 Child
          ret.push(line(nextLine.includes("Image") ? `${nextLine}/>` : `${nextLine}>${obj.innerText ? obj.innerText : ""}</${obj.element}>`, level));
        }
      } else {
        // 自闭合标签
        ret.push(line(`${nextLine} />`, level));
      }
    }

    return ret;
  };

  const renderDataText = renderTemplate(layoutData);

  const renderData: ICompData = {
    imports: printer([
      ...extComTypes.map(type => _line(extComs[type][1], { indent: { tab: 0 } })),
      ...images.map(img => _line(`import ${img} from "@/assets/image/${pageName}/${img}.png";`, { indent: { tab: 0 } }))
    ]),
    vdom: printer([
      _line("return (", { indent: { tab: 2 } }),
      ...renderDataText,
      _line(");", { indent: { tab: 2 } })
    ]),
    style: printer(renderStyle(styleMap))
  };
  return renderData;
}
