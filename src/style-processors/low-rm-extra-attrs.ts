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
  const { type, style: { flexDirection, justifyContent, alignItems, display } } = node;
  if (type === 'Text') {
    delKeys(['whiteSpace', 'overflow', 'textOverflow', 'whiteSpace', 'maxWidth', 'height', 'width', 'lines', 'fontWeight', 'lineHeight', 'letterSpacing'], node.style);
    if (node.style.fontWeight == 400) delete node.style.fontWeight;
  }
  if(type === 'Image') {
    delKeys([ 'opacity'], node.style);
  }
  delKeys(['overflow', 'boxSizing'], node.style);
  if (flexDirection === 'column') delete node.style.flexDirection;
  if (justifyContent === 'flex-start') delete node.style.justifyContent;
  if (alignItems === 'stretch') delete node.style.alignItems;
  if (display === 'flex') delete node.style.display;

  // fixme 这边写法可优化
  if(node.style.marginTop == 0) delete node.style.marginTop;
  if(node.style.marginBottom == 0) delete node.style.marginBottom;
  if(node.style.marginLeft == 0) delete node.style.marginLeft;
  if(node.style.marginRight == 0) delete node.style.marginRight;
  if(node.style.paddingTop == 0) delete node.style.paddingTop;
  if(node.style.paddingBottom == 0) delete node.style.paddingBottom;
  if(node.style.paddingLeft == 0) delete node.style.paddingLeft;
  if(node.style.paddingRight == 0) delete node.style.paddingRight;
}
