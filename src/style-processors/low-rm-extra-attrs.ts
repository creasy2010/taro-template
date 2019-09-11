import { ILayoutNode } from "../typings";
import { delKeys } from "./utils";

/**
 * 删除结点无用样式
 **/

export function test(node: ILayoutNode): boolean {
  return true;
}

export function enter(node: ILayoutNode) {

}

export function exit(node: ILayoutNode) {
  const { type, style: { flexDirection, justifyContent, alignItems } } = node;
  if (type === 'Text') {
    delKeys(['whiteSpace', 'overflow', 'textOverflow', 'whiteSpace', 'maxWidth', 'height', 'width'], node.style);
    if (node.style.fontWeight == 400) delete node.style.fontWeight;
  }
  if(type === 'Image') {
    delKeys([ 'opacity'], node.style);
  }
  delKeys(['overflow', 'boxSizing'], node.style);
  if (flexDirection === 'row') delete node.style.flexDirection;
  if (justifyContent === 'flex-start') delete node.style.justifyContent;
  if (alignItems === 'stretch') delete node.style.alignItems;
}
