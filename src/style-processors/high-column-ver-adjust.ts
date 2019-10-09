import { ILayoutNode } from "../typings";
import { appendVal, contentBoxHeight, marginBoxHeight, borderBoxWidth, contentBoxWidth } from "./utils";

import debug from  'debug';
const log  = debug('style:hign-ver-adjust');
/**
 * column方向布局，不使用space-between、space-around
 **/

export function test(node: ILayoutNode): boolean {
  const { flexDirection, justifyContent } = node.style;
  return flexDirection === 'column' && ['space-between', 'space-around'].includes(justifyContent);
}

export function enter(node: ILayoutNode) {
  const { justifyContent } = node.style;

  if (justifyContent === 'space-between') {
    // 将space-between转为flex-start
    node.style.justifyContent = 'flex-start';
    // 给子结点加marginTop fixme
    const childrenHeight = node.children.reduce((total, child) => total + marginBoxHeight(child), 0);
    const marginTop = Math.round((contentBoxHeight(node) - childrenHeight) / (node.children.length - 1));
    node.children.forEach((child, idx) => {
      if (idx > 0) appendVal(child.style, 'marginTop', marginTop);
    });
    log(`结点${node.attrs.className}由布局column.space-between转为column.flex-start`);
  }

  if (justifyContent === 'space-around') {
    // 将space-around转为flex-start
    node.style.justifyContent = 'flex-start';
    // 给结点加paddingTB、子结点加marginTop fixme
    const childrenHeight = node.children.reduce((total, child) => total + marginBoxHeight(child), 0);
    const spacing = Math.round((contentBoxHeight(node) - childrenHeight) / node.children.length);
    node.children.forEach((child, idx) => {
      if (idx > 0) appendVal(child.style, 'marginTop', spacing);
    });
    appendVal(node.style, 'paddingTop', Math.round(spacing / 2));
    appendVal(node.style, 'paddingBottom', Math.round(spacing / 2));
    log(`结点${node.attrs.className}由布局column.space-around转为column.flex-start`);
  }
}

export function exit(node: ILayoutNode) {
}
