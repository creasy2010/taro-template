import { ILayoutNode } from "../typings";

export function delKeys(keys: string[], obj) {
  keys.forEach(key => delete obj[key]);
}

export function isContainer(type: string) {
  return ['Block','Repeat', 'Shape'].includes(type);
}

export function isSameNodes(nodes: ILayoutNode[], ignoreKeys: string[] = [], includeKeys: string[]) {

  if (ignoreKeys.length > 0 && includeKeys.length > 0) {
    throw new Error('不可以同时传ignoreKeys和includeKeys');
  }

  let styleMap = {};
  nodes.forEach(node => {
    const style = node.style;
    Object.keys(style).forEach(key => {
      if (ignoreKeys && ignoreKeys.includes(key)) return;
      if (includeKeys && !includeKeys.includes(key)) return;
      if (style[key]) {
        if (styleMap[key]) {
          styleMap[key].push(style[key]);
        } else {
          styleMap[key] = [style[key]];
        }
      }
    });
  });

  const styleMapKeys = Object.keys(styleMap);
  for (let i = 0; i < styleMapKeys.length; i++) {
    if (styleMap[styleMapKeys[i]].length != nodes.length) {
      return false;
    }
  }
  return true;
}

export function sameVal(values: number[], precision = 0.2) {
  if (!values || values.length == 0) {
    throw new Error('参数错误');
  }
  const average = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  for (let i = 0; i < values.length; i++) {
    if ((Math.abs(values[i] - average) / average) > precision) return null;
  }
  return average;
}

export function appendVal(obj, key: string, value: number) {
  const preValue = obj[key];
  obj[key] = preValue ? preValue + value : value;
}

export function val(value) {
  return value ? value : 0;
}

export function contentHeight(node: ILayoutNode) {
  const { borderWidth, paddingTop, paddingBottom } = node.style;
  return borderBoxHeight(node) - val(borderWidth) * 2 - val(paddingTop) - val(paddingBottom);
}

export function marginHeight(node: ILayoutNode) {
  const { marginTop, marginBottom } = node.style;
  return borderBoxHeight(node) + val(marginTop) + val(marginBottom);
}

/**
 * 计算一个结点的高度
 */
function borderBoxHeight(node: ILayoutNode) {
  let { type, style: { fontSize, lineHeight, height, lines, flexDirection } } = node;
  const { paddingTop, paddingBottom, borderWidth } = node.style;

  if (height) return height;

  if (type === 'Text') {
    height = (lineHeight ? lineHeight : fontSize) * lines;
  } else if (isContainer(type)) {
    if (flexDirection === 'row') {
      height = node.children.map(child => marginHeight(child)).sort().reverse()[0];
    } else if(flexDirection === 'column') {
      height = node.children.reduce((total, child) => total + marginHeight(child), 0);
    } else {
      console.error('非row、column的容器');
    }
  }
  height = height + val(paddingTop) + val(paddingBottom) + val(borderWidth) * 2;
  return height;
}

/**
 * 计算一个结点宽度
 */
export function borderBoxWidth(node: ILayoutNode, useWidth: boolean) {
  let { type, style: { width, flexDirection, paddingLeft, paddingRight, borderWidth } } = node;
  if (width && useWidth) return width;

  if (type === 'Text') {
    return NaN;
  } else if (isContainer(type)) {
    if (flexDirection === 'row') {
      width = node.children.reduce((total, child) => total + marginWidth(child), 0);
    } else if(flexDirection === 'column') {
      width = node.children.map(child => marginWidth(child)).sort().reverse()[0];
    } else {
      console.error('非row、column的容器');
    }
  }
  width = width + val(paddingLeft) + val(paddingRight) + val(borderWidth) * 2;
  return width;
}

export function marginWidth(node: ILayoutNode) {
  const { marginLeft, marginRight } = node.style;
  return borderBoxWidth(node, true) + val(marginLeft) + val(marginRight);
}

