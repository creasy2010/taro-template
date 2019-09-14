import { ILayoutNode } from "../typings";
import { appendVal, sameVal, val } from "./utils";

/**
 * 垂直方向间距使用marginBottom、水平方向间距使用marginRight
 **/

export function test(node: ILayoutNode): boolean {
  return true;
}

export function enter(node: ILayoutNode) {
  let { style: { flexDirection }, children } = node;
  children = children.filter(child => child.style.position !== 'absolute');

  // 水平方向间距使用marginRight，外层加padding
  if (flexDirection === 'row') {
    for (let i = 0; i < children.length; i++) {
      const childStyle = children[i].style;
      if (i == 0) {
        appendVal(node.style, 'paddingLeft', val(childStyle.marginLeft));
      } else {
        const preChildStyle = children[i - 1].style;
        preChildStyle.marginRight = val(childStyle.marginLeft) + val(preChildStyle.marginRight);
      }
      delete childStyle.marginLeft;
    }
    if (children.length > 2) {
      const preChilds = children.filter((_, idx) => idx != children.length - 1);
      const marginRight = sameVal(preChilds.map(child => child.style.marginRight));
      const lastChild = children[children.length - 1];
      // fixme 最后一个结点加margin的条件还要调
      if (marginRight && !lastChild.style.marginRight) {
        lastChild.style.marginRight = marginRight;
      }
    }
  }

  // 垂直方向间距使用marginBottom，外层加padding
  if(flexDirection === 'column') {
    for (let i = 0; i < children.length; i++) {
      const childStyle = children[i].style;
      if (i == 0) {
        appendVal(node.style, 'paddingTop', val(childStyle.marginTop));
      } else {
        const preChildStyle = children[i - 1].style;
        preChildStyle.marginBottom = val(childStyle.marginTop) + val(preChildStyle.marginBottom);
      }
      delete childStyle.marginTop;
    }
    if (children.length > 2) {
      const preChilds = children.filter((_, idx) => idx != children.length - 1);
      const marginBottom = sameVal(preChilds.map(child => child.style.marginBottom));
      const lastChild = children[children.length - 1];
      if (marginBottom && !lastChild.style.marginBottom) {
        lastChild.style.marginBottom = marginBottom;
      }
    }
  }
}

export function exit(node: ILayoutNode) {
}
