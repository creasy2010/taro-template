import { ILayoutNode } from "../typings";
import { val, appendVal } from "./utils";

import debug from  'debug';
const log  = debug('style:low-padding-to-margin');
/**
 * 把结点的padding尽量转成margin
 **/

export function test(node: ILayoutNode): boolean {
  const { backgroundColor, backgroundImage, borderWidth } = node.style;
  return !backgroundColor && !backgroundImage && !borderWidth;
}

export function enter(node: ILayoutNode) {
  const paddingLeft = val(node.style.paddingLeft);
  appendVal(node.style, 'marginLeft', paddingLeft);
  delete node.style.paddingLeft;
  const paddingRight = val(node.style.paddingRight);
  appendVal(node.style, 'marginRight', paddingRight);
  delete node.style.paddingRight;
  const paddingTop = val(node.style.paddingTop);
  appendVal(node.style, 'marginTop', paddingTop);
  delete node.style.paddingTop;
  const paddingBottom = val(node.style.paddingBottom);
  appendVal(node.style, 'marginBottom', paddingBottom);
  delete node.style.paddingBottom;
  const position = node.attrs.__ARGS__;
  node.attrs.__ARGS__ = {
    x: position.x + paddingLeft,
    y: position.y + paddingTop,
    width: position.width - paddingLeft - paddingRight,
    height: position.height - paddingTop - paddingBottom
  }
  log(`结点${node.attrs.className}的padding转化成了margin`);
}

export function exit(node: ILayoutNode) {

}
