import { ILayoutNode } from "../../typings";
import { isContainer } from "../utils";

// fixme
/**
 * 误差抹平
 **/

export function test(node: ILayoutNode): boolean {
  return isContainer(node.type);
}

export function enter(node: ILayoutNode) {
}

export function exit(node: ILayoutNode) {

  node.children.forEach(node => {
    // fixme 先这么简单处理
    const { paddingTop, paddingBottom } = node.style;
    const data = [paddingTop, paddingBottom].sort();
    if (((data[1] - data[0]) / data[0]) < 0.1) {
      console.log(JSON.stringify(node.style));
      node.style.paddingTop = data[1];
      node.style.paddingBottom = data[1];
    }
  });
}
