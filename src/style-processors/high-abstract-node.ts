import { ILayoutNode, IPosition } from "../typings";
import { contentBoxWidth, contentBoxHeight, calcAbsPosition, marginBoxWidth, marginBoxHeight, delMargin } from "./utils";
import debug from  'debug';
const log  = debug('style:hign-abstrace-node');

/**
 * 绝对定位结点识别
 **/

export function test(node: ILayoutNode): boolean {
  if (!node.parent) return false;
  const { flexDirection, justifyContent } = node.parent.style;
  const position: IPosition = node.attrs.__ARGS__;
  const pPosition = node.parent.attrs.__ARGS__;
  const absStyle = calcAbsPosition(node.parent, node, 0.1);

  // 长宽小于父结点的三分之一、位置在父结点右下角、父结点为column排列...判定为绝对定位元素
  return position.width * 3 < pPosition.width
    && position.height * 3 < pPosition.height
    &&  absStyle && absStyle.type == 2
    && (flexDirection === 'column' && justifyContent === 'flex-start' && node.style.marginLeft > pPosition.width / 2);
}

export function enter(node: ILayoutNode) {

  const totalHeight = node.parent.children.reduce((total, child) => total + marginBoxHeight(child), 0);
  if (totalHeight == contentBoxHeight(node.parent)) {
    // 影响外层高度
    node.parent.style.height = node.parent.attrs.__ARGS__.height;
  }

  const maxWidth = node.parent.children.map(child => marginBoxWidth(child)).sort((a, b) => b - a)[0];
  if (maxWidth == contentBoxWidth(node.parent)) {
    // 影响外层宽度
    node.parent.style.width = node.parent.attrs.__ARGS__.width;
  }

  // 1.node使用绝对定位
  const absStyle = calcAbsPosition(node.parent, node, 0.1);
  node.style.position = 'absolute';
  node.style.bottom = absStyle.bottom;
  node.style.right = absStyle.right;
  node.parent.style.position = 'relative';
  delMargin(node.style);

  log(`结点${node.attrs.className}调整为绝对定位`);

}

export function exit(node: ILayoutNode) {

}
