import { ILayoutNode } from "../typings";
import { calcHMargin, calcHPadding, delMargin } from './utils';

/**
 * 多行重复元素布局调整（先只考虑两行）
 **/

export function test(node: ILayoutNode): boolean {
  if (node.style.flexDirection !== 'row') return false;
  let nodesArr = [];
  node.children.forEach((child) => {
    if (child.style.flexDirection === 'column') nodesArr.push(child.children);
    else nodesArr.push([child]);
  });
  let nodes = [];
  nodesArr.forEach(child => nodes.push(child[0]));
  nodesArr.forEach(child => child[1] && nodes.push(child[1]));

  let hMargin;
  return nodes.length > 3 && !nodes.some((node, idx) => {
    if(idx == 0) {
      hMargin = calcHMargin(node, nodes[idx + 1]);
      return false;
    }
    let tmpMargin = calcHMargin(nodes[idx - 1], node);
    if(tmpMargin < 0) return false;
    else if(tmpMargin == hMargin) return false;
    return true;
  });
}

export function enter(node: ILayoutNode) {

  let nodesArr = [];
  node.children.forEach((child, idx) => {
    if (child.style.flexDirection === 'column') nodesArr.push(child.children);
    else nodesArr.push([child]);
  });
  let nodes: ILayoutNode[] = [];
  nodesArr.forEach(child => nodes.push(child[0]));
  nodesArr.forEach(child => child[1] && nodes.push(child[1]));

  let marginLeft = calcHMargin(nodes[0], nodes[1]);
  let padding = calcHPadding(node, nodes[0]);

  // 1.外层重新设置children
  node.children = nodes;
  nodes.forEach(item => item.parent = node);
  // 2.设置样式 fixme 上边距
  node.style.flexDirection = 'row';
  node.style.justifyContent = 'flex-start';
  node.style.flexWrap = 'wrap';
  nodes.forEach(item => {
    delMargin(item.style);
    item.style.marginRight = marginLeft;
  });
  console.log(`${node.attrs.className} 多行重复元素布局调整 `);
}

export function exit(node: ILayoutNode) {
}
