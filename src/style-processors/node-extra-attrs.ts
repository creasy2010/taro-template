import { ILayoutNode } from "../typings";
import { delKeys } from "./utils";

/**
 * 移除结点额外样式处理器
 **/

export function test(node: ILayoutNode): boolean {
  return true;
}

export function enter(node: ILayoutNode) {
  const { type } = node;
  if (type === 'Text') {
    delKeys(['whiteSpace', 'overflow', 'textOverflow', 'whiteSpace', 'maxWidth'], node.style);
  } else if(type === 'Image') {
    delKeys([ 'opacity'], node.style);
  }
}

export function exit(node: ILayoutNode) {
}
