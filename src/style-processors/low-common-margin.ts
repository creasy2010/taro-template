import { ILayoutNode } from "../typings";
import { sameVal } from "./utils";

/**
 * 尽量使用外层边距
 **/

export function test(node: ILayoutNode): boolean {
  return false;
}

export function enter(node: ILayoutNode) {

}

export function exit(node: ILayoutNode) {
  // 左侧
  // node.children.map(child => child.style.padding);
}
