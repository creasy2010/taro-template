import { ILayoutNode } from "../typings";

/**
 * 公共样式提取处理器
 **/

export function test(node: ILayoutNode): boolean {
  return true;
}

export function enter(node: ILayoutNode) {
}

export function exit(node: ILayoutNode) {
  // 文本公共样式
  if (node.type === 'Text') {
    const commonTextStyle = {
      fontWeight: 400
    };
    Object.keys(commonTextStyle).forEach(key => {
      if (node.style[key] === commonTextStyle[key]) {
        delete node.style[key];
      }
    });
  }
}
