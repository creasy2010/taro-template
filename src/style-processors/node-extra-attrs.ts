import { ILayoutNode } from "../typings";
import { delKeys } from "./utils";

/**
 * 移除结点额外样式处理器
 **/

export function test(node: ILayoutNode): boolean {
  return true;
}

export function enter(node: ILayoutNode) {
}

export function exit(node: ILayoutNode) {
  const { type, style: { flexDirection, justifyContent, alignItems } } = node;
  if (type === 'Text') {
    delKeys(['whiteSpace', 'overflow', 'textOverflow', 'whiteSpace', 'maxWidth'], node.style);
  }
  if(type === 'Image') {
    delKeys([ 'opacity'], node.style);
  }
  if (flexDirection === 'row') delete node.style.flexDirection;
  if (justifyContent === 'flex-start') delete node.style.justifyContent;
  if (alignItems === 'stretch') delete node.style.alignItems;
}
