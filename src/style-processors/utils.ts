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

export function calcAbsPosition(outer: ILayoutNode, inner: ILayoutNode, precision = 0) {

  const precisionX = inner.attrs.__ARGS__.width * precision;
  const precisionY = inner.attrs.__ARGS__.height * precision;

  const samePosition = (source, target) => {
    return Math.abs(source.x - target.x) <= precisionX
      && Math.abs(source.y- target.y) <= precisionY;
  }
  const iCoords = calcNodeCoords(inner);
  const oCoords = calcNodeCoords(outer);
  if (samePosition(iCoords[0], oCoords[0])) return { top: 0, left: 0, type: 0 };
  if (samePosition(iCoords[1], oCoords[1])) return { top: 0, right: 0, type: 1 };
  if (samePosition(iCoords[2], oCoords[2])) return { bottom: 0, right: 0, type: 2 };
  if (samePosition(iCoords[3], oCoords[3])) return { bottom: 0, left: 0, type: 3 };
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
 * 计算两块间的内左边距
 */
export function calcHPadding(outer: ILayoutNode, inner: ILayoutNode) {
  return inner.attrs.__ARGS__.y - outer.attrs.__ARGS__.y;
}


export function borderBoxWidth(node: ILayoutNode) {
  return node.attrs.__ARGS__.width;
}

export function borderBoxHeight(node: ILayoutNode) {
  return node.attrs.__ARGS__.height;
}

export function marginBoxWidth(node: ILayoutNode) {
  return val(node.style.marginLeft) + borderBoxWidth(node) + val(node.style.marginRight);
}

export function marginBoxHeight(node: ILayoutNode) {
  return val(node.style.marginTop) + borderBoxHeight(node) + val(node.style.marginBottom);
}

export function contentBoxWidth(node: ILayoutNode) {
  const { borderWidth, paddingLeft, paddingRight } = node.style;
  return borderBoxWidth(node) - val(borderWidth) * 2 - val(paddingLeft) - val(paddingRight);
}

export function contentBoxHeight(node: ILayoutNode) {
  const { borderWidth, paddingTop, paddingBottom } = node.style;
  return borderBoxHeight(node) - val(borderWidth) * 2 - val(paddingTop) - val(paddingBottom);
}

