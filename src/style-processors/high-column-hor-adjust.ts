import { ILayoutNode } from "../typings";
import debug from  'debug';
const log  = debug('style:hign-hor-adjust');

/**
 * column方向布局，flex-start改为stretch
 **/

export function test(node: ILayoutNode): boolean {
  const { flexDirection, alignItems } = node.style;
  // fixme 全改stretch
  return flexDirection === 'column'
    && alignItems === 'flex-start';
    // && node.children.some(child => borderBoxWidth(child) == contentBoxWidth(node));
}

export function enter(node: ILayoutNode) {
  node.style.alignItems = 'stretch';
  log(`结点${node.attrs.className}由布局column.alignItems.flex-start转为stretch`);
}

export function exit(node: ILayoutNode) {
}
