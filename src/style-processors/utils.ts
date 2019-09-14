import { ILayoutNode, ILayoutNodeAttr, IStyle } from "../typings";

export function delKeys(keys: string[], obj) {
  keys.forEach(key => delete obj[key]);
}

export function isContainer(type: string) {
  return ['Block','Repeat', 'Shape'].includes(type);
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
  if (type === 'Text') width = node.attrs.__ARGS__.width;
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

export function contentWidth(node: ILayoutNode) {
  const { borderWidth, paddingLeft, paddingRight } = node.style;
  return borderBoxWidth(node, true) - val(borderWidth) * 2 - val(paddingLeft) - val(paddingRight);
}

export function delMarginPadding(style) {
  delete style.marginTop;
  delete style.marginBottom;
  delete style.marginLeft;
  delete style.marginRight;
  delete style.paddingTop;
  delete style.paddingBottom;
  delete style.paddingLeft;
  delete style.paddingRight;
}

export function delPadding(style) {
  delete style.paddingTop;
  delete style.paddingBottom;
  delete style.paddingLeft;
  delete style.paddingRight;
}

export function delMargin(style) {
  delete style.marginTop;
  delete style.marginBottom;
  delete style.marginLeft;
  delete style.marginRight;
}

export function calcNodeCoords(node: ILayoutNode) {
  let coords = [];
  const { x, y, width, height } = node.attrs.__ARGS__;
  // 顶点坐标
  coords.push({ x, y });
  // 右上点坐标
  coords.push({ x: x + width, y });
  // 右下点坐标
  coords.push({ x: x + width, y: y + height });
  // 左下点坐标
  coords.push({ x, y: y + height });
  return coords;
}

export function calcAbsPosition(outer: ILayoutNode, inner: ILayoutNode) {
  const samePosition = (source, target) => {
    return source.x == target.x && source.y == target.y;
  }
  const iCoords = calcNodeCoords(inner);
  const oCoords = calcNodeCoords(outer);
  if (samePosition(iCoords[0], oCoords[0])) return { top: 0, left: 0 };
  if (samePosition(iCoords[1], oCoords[1])) return { top: 0, right: 0 };
  if (samePosition(iCoords[2], oCoords[2])) return { bottom: 0, right: 0 };
  if (samePosition(iCoords[3], oCoords[3])) return { bottom: 0, left: 0 };
  return null;
}


export function newNode({ parent = null, children = [], type }): ILayoutNode {
  // fixme attrs需要计算
  return {
    children,
    type,
    parent,
    attrs: {
      __ARGS__: { x:null, y:null, width:null, height:null }
    },
    style: {}
  }
}

export function match(matchStr, regex) {
  let match, result = [];
  while (match = regex.exec(matchStr)) {
    result.push({
      index: match.index,
      match: match[0]
    });
  }
  return result;
}

/**
 * 计算两块间的水平间距
 */
export function calcHMargin(source: ILayoutNode, target: ILayoutNode) {
  const { x, width } = source.attrs.__ARGS__;
  return target.attrs.__ARGS__.x - (x + width);
}

/**
 * 计算两块间的垂直间距
 */
export function calcVMargin(source: ILayoutNode, target: ILayoutNode) {
  const { y, height } = source.attrs.__ARGS__;
  return target.attrs.__ARGS__.y - (y + height);
}

/**
 * 计算两款间的内左边距
 */
export function calcHPadding(outer: ILayoutNode, inner: ILayoutNode) {
  return inner.attrs.__ARGS__.y - outer.attrs.__ARGS__.y;
}
