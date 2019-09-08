import { ILayoutNode } from "../typings";
import { borderBoxWidth, isContainer } from './utils';

/**
 * 布局宽高调整
 **/

export function test(node: ILayoutNode): boolean {
  return true;
}

export function enter(node: ILayoutNode) {
  rmLineHeightPx(node.style);
  const { type, style: { lineHeight, fontSize, flexDirection, width } } = node;
  if (type === 'Text') {
    if (lineHeight === fontSize) delete node.style.lineHeight;
    delete node.style.height;
    delete node.style.width;
  } else if(isContainer(type)) {
    if (flexDirection === 'column') {
      delete node.style.height;
      if (width == borderBoxWidth(node)) delete node.style.width;
    }
    // fixme 这边还要优化
    if (node.children.length == 1 && node.children[0].type === 'Text' && node.style.width) {
      const fontSize = parseInt(node.children[0].style.fontSize);
      const padding = Math.round(fontSize / 3 * 2);
      node.style.paddingLeft = padding;
      node.style.paddingRight = padding;
      delete node.style.width;
    }
  }
}

export function exit(node: ILayoutNode) {

}

function rmLineHeightPx(style) {
  let lineHeight = style.lineHeight;
  if (lineHeight && lineHeight.endsWith('px')) {
      style.lineHeight = parseInt(lineHeight.slice(0, lineHeight.length - 2));
  }
}
