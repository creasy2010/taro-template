import { IOriginNode } from "../typings";
import { calcNodeCoords, createOriginNode } from './utils';


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
const calcSameColRow = (nodes: IOriginNode[]) => {
  const calcNode = (node: IOriginNode, others: IOriginNode[]) => {
    const isSameRow = (source: IOriginNode, target: IOriginNode) => {
      const srcCoords = calcNodeCoords(source);
      const tarCoords = calcNodeCoords(target);
      const { x: xa, y: ya } = srcCoords[0];
      const { x: xb, y: yb } = srcCoords[2];
      const { x: x0, y: y0 } = tarCoords[0];
      const { x: x1, y: y1 } = tarCoords[2];
      return y0 < yb && y1 > ya && (x1 <= xa || x0 >= xb);
    }
    const isSameCol = (source: IOriginNode, target: IOriginNode) => {
      const srcCoords = calcNodeCoords(source);
      const tarCoords = calcNodeCoords(target);
      const { x: xa, y: ya } = srcCoords[0];
      const { x: xb, y: yb } = srcCoords[2];
      const { x: x0, y: y0 } = tarCoords[0];
      const { x: x1, y: y1 } = tarCoords[2];
      return x0 < xb && x1 > xa && (y1 <= ya || y0 >= yb);
    }
    // 计算同行结点
    node.extra.sameRows = others.filter(other => isSameRow(node, other));
    // 计算同列结点
    node.extra.sameCols = others.filter(other => isSameCol(node, other));
  }
  nodes.forEach(node => {
    calcNode(node, nodes.filter(item => item != node));
  });
}

/**
 * 合并同行/同列结点
 *
 */
const mergeNodes = (nodes: IOriginNode[]): IOriginNode => {

  const merge = (direction: string, nodes: IOriginNode[], sameNodes: IOriginNode[]) => {
    nodes = nodes.filter(node => !sameNodes.includes(node));
    nodes.push(createOriginNode(direction, sameNodes));
    return nodes;
  }

  // 同行结点合并(同行且有相同同列结点)
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    let sameRows = [node, ...node.extra.sameRows];
    node.extra.sameRows.forEach(row => {
      sameRows.push(...row.extra.sameRows.filter(item => !sameRows.includes(item)));
    });
    let samerowsMap = {} as any;
    sameRows.forEach(item => {
      const key = item.extra.sameCols.map(n => n.id).sort().toString();
      if (samerowsMap[key]) {
        samerowsMap[key].push(item);
      } else {
        samerowsMap[key] = [item];
      }
    });
    Object.keys(samerowsMap).forEach(key => {
      if (samerowsMap[key].length > 1) {
        nodes = merge('row', nodes, samerowsMap[key]);
      }
    });
  }

  // 同列结点合并(同列且有相同同行结点)


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

