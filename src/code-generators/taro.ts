import { ICompData, ILayoutNode, IParseConfig } from "../typings";
import * as helper from "@imgcook/dsl-helper";

export default (data: ILayoutNode, config: IParseConfig): ICompData => {


  const { printer, utils } = helper;
  const line = (content, level) => utils.line(content, { indent: { space: level * 2 } });

  let imports: string;

  const typeMap = {
    'Text': 'Text',
    'Image': 'Image',
    'Block': 'View',
    'Repeat': 'View',
    'Shape': 'View'
  };


  // 生成dom、样式数组
  const styleArr = [];
  const parseVdom = (node: ILayoutNode, level) => {
    const lines = [], nodeType = typeMap[node.type];
    if (!styleArr.map(i => i.className).includes(node.attrs.className)) {
      styleArr.push({
        style: node.style,
        className: node.attrs.className
      });
    }
    let attrStr = '';
    attrStr += node.attrs.src ? ` src={${node.attrs.src}}` : '';
    attrStr += node.attrs.className ? ` className="${node.attrs.className}"` : '';

    if (node.innerText) {
      lines.push(line(`<${nodeType}${attrStr}>${node.innerText}</${nodeType}>`, level));
    } else if (nodeType === 'Image') {
      lines.push(line(`<${nodeType}${attrStr}/>`, level));
    } else {
      lines.push(line(`<${nodeType}${attrStr}>`, level));
      node.children.forEach(child => {
        lines.push(...parseVdom(child, level + 1));
      });
      lines.push(line(`</${nodeType}>`, level));
    }
    return lines;
  }
  const vdom = printer(parseVdom(data, 0));


  // 生成style
  const lines = [];
  const transKey = str => {
    return str.replace(/\B([A-Z])/g, '-$1').toLowerCase()
  }
  const transVal = val => {
    val = val ? val : 0;
    if (typeof(val) === 'number') val = val * 2 + 'px';
    return val;
  }
  styleArr.forEach(item => delete item.style.lines);
  lines.push(line(`.${styleArr[0].className} {`, 0));
  Object.keys(styleArr[0].style).forEach(key => {
    lines.push(line(`${transKey(key)}: ${transVal(styleArr[0].style[key])};`, 1));
  });
  styleArr.forEach((item, idx) => {
    if (idx > 0) {
      lines.push(line(`.${item.className} {`, 1));
      Object.keys(item.style).forEach(key => {
        lines.push(line(`${transKey(key)}: ${transVal(item.style[key])};`, 2));
      });
      lines.push(line(`}`, 1));
    }
  })
  lines.push(line(`}`, 0));

  return {
    imports,
    vdom,
    style: printer(lines)
  };
}
