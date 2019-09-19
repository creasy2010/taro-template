import { ILayoutNode } from "../typings";
import { delKeys } from "./utils";

/**
 * 公共的单倍行高
 **/

export function test(node: ILayoutNode): boolean {
  return !node.parent;
}

export function enter(node: ILayoutNode) {
}

export function exit(node: ILayoutNode) {
  // node.style.lineHeight = 1;
  const rmLineHeight = (node: ILayoutNode) => {
    const { fontSize, lineHeight } = node.style;
    if (fontSize == lineHeight) delete node.style.lineHeight;
    node.children.forEach(child => rmLineHeight(child));
  }
  rmLineHeight(node);
}
