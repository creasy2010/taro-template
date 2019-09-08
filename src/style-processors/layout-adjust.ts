import { ILayoutNode } from "../typings";
import { contentHeight, marginHeight, appendVal } from './utils';

/**
 * 布局类型调整
 **/

export function test(node: ILayoutNode): boolean {
  return true;
}

export function enter(node: ILayoutNode) {
  const { flexDirection, justifyContent, alignItems } = node.style;
  if (flexDirection === 'row') {
    if (!['flex-start', 'flex-end', 'center', 'space-between', 'space-around'].includes(justifyContent)) {
      console.error('在flexDirection: row的情况下，出现了justifyContent: ', justifyContent);
    }
    if (['flex-start', 'flex-end'].includes(alignItems)) {
      console.error('在flexDirection: row的情况下，出现了alignItems: ', alignItems);
      console.log(node.attrs.className);
    }
  } else if(flexDirection === 'column') {
    if (!['flex-start', 'center', 'space-between', 'space-around'].includes(justifyContent)) {
      console.error('在flexDirection: column的情况下，出现了justifyContent: ', justifyContent);
    }

    if (justifyContent === 'space-between') {
      // 将space-between转为flex-start
      node.style.justifyContent = 'flex-start';
      // 给子结点加marginTop
      const childrenHeight = node.children.reduce((total, child) => total + marginHeight(child), 0);
      const marginTop = Math.round((contentHeight(node) - childrenHeight) / (node.children.length - 1));
      node.children.forEach((child, idx) => {
        if (idx > 0) appendVal(child.style, 'marginTop', marginTop);
      });
    }
    if (justifyContent === 'space-around') {
      // 将space-around转为flex-start
      node.style.justifyContent = 'flex-start';
      // 给结点加paddingTB、子结点加marginTop
      const childrenHeight = node.children.reduce((total, child) => total + marginHeight(child), 0);
      const spacing = Math.round((contentHeight(node) - childrenHeight) / node.children.length);
      node.children.forEach((child, idx) => {
        if (idx > 0) appendVal(child.style, 'marginTop', spacing);
      });
      appendVal(node.style, 'paddingTop', Math.round(spacing / 2));
      appendVal(node.style, 'paddingBottom', Math.round(spacing / 2));
    }
    if (justifyContent === 'center') {
      // 将center转为flex-start
      node.style.justifyContent = 'flex-start';
      // 给结点加paddingTB、子结点加marginTop
      const childrenHeight = node.children.reduce((total, child) => total + marginHeight(child), 0);
      const paddingTB = Math.round((contentHeight(node) - childrenHeight) / 2);
      appendVal(node.style, 'paddingTop', paddingTB);
      appendVal(node.style, 'paddingBottom', paddingTB);
    }
  }
}

export function exit(node: ILayoutNode) {

}



