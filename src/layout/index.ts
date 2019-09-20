import { IOriginNode } from "../typings";

/**
 * 划分行与列
 */
const calcRowCol = (nodes: IOriginNode[]) => {

  filterAbsFixNodes(nodes);
  calcSameColRow(nodes);
  let node, i = 0;
  while(!(node = mergeNodes(nodes))) {
    i++;
    rowFirstConnect(nodes);
    if (i > 1000) throw new Error('超出循环上限');
  }
  mergeSameColRow(node);
  return node;
}

/**
 * 过滤掉绝对定位、固定定位的结点
 */
const filterAbsFixNodes = (nodes: IOriginNode[]): IOriginNode[] => {
  return [];
}

/**
 * 计算结点的同行同列结点
 */
const calcSameColRow = (nodes: IOriginNode[]) => {}

/**
 * 合并同行/同列结点
 */
const mergeNodes = (nodes: IOriginNode[]): IOriginNode => {
  return null;
}

/**
 * 行优先连接
 */
const rowFirstConnect = (nodes: IOriginNode[]) => {}

/**
 * 嵌套的行列，合并为一行一列
 */
const mergeSameColRow = (node: IOriginNode) => {}


/**
 * 行布局计算
 */
const calcRowLayout = (node: IOriginNode) => {
}

/**
 * 列布局计算
 */
const calcColLayout = (node: IOriginNode) => {

}

/**
 * 计算间距
 */
const calcSpacing = (node: IOriginNode) => {}



const originNodes: IOriginNode[] = [];
// 1.划分行与列
const node = calcRowCol(originNodes);
// 2.行布局、列布局
calcRowLayout(node);
calcColLayout(node);
// 3.间距处理
calcSpacing(node);

