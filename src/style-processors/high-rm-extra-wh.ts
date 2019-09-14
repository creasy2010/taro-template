import { ILayoutNode } from "../typings";
import { borderBoxWidth } from './utils';

/**
 * 删除多余的宽高调整
 **/

export function test(node: ILayoutNode): boolean {
  return true;
}

export function enter(node: ILayoutNode) {

  // 宽度
  if (node.type === 'Text') {
    delete node.style.width;
    console.log(`结点${node.attrs.className}删除文本宽度`);
  }
  if (node.type === 'Block') {
    if (node.parent
      && node.parent.style.flexDirection === 'column'
      && node.parent.style.alignItems === 'stretch') {
      // 父容器给了宽度，父容器为column布局、streach；
      delete node.style.width;
      console.log(`结点${node.attrs.className}删除块宽度`);
    }
    if (borderBoxWidth(node, false) == node.style.width) {
      // 内部元素可以撑开宽度，内部元素水平方向宽度和等于当前元素宽度(用坐标宽度)
      delete node.style.width;
      console.log(`结点${node.attrs.className}删除块宽度`);
    }
  }
  // 高度
  if (node.type === 'Text') {
    delete node.style.height;
    console.log(`结点${node.attrs.className}删除文本高度`);
  }
  if (node.type === 'Block') {
    delete node.style.height;
    console.log(`结点${node.attrs.className}删除块高度`);
  }

}

export function exit(node: ILayoutNode) {
}
