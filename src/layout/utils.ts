import { IOriginNode, IStyle, IPosition } from "../typings";
import * as uuid from 'uuid';


/**
 * 计算四个顶点的坐标
 */
export function calcNodeCoords(node: IOriginNode) {
  let coords = [];
  const { props: { attrs: { x, y }, style: { width, height } } } = node;
  // 顶点坐标
  coords.push({ x, y });
  // 右上点坐标
  coords.push({ x: x + width, y });
  // 右下点坐标
  coords.push({ x: x + width, y: y + height });
  // 左下点坐标
  coords.push({ x, y: y + height });
  return coords;
}

/**
 * 计算两个定界点的坐标
 */
export function calcNodeBox(node: IOriginNode) {
  let coords = [];
  const { props: { attrs: { x, y }, style: { width, height } } } = node;
  // 顶点坐标
  coords.push({ x, y });
  // 右下点坐标
  coords.push({ x: x + width, y: y + height });
  return coords;
}

export function createOriginNode(direction: string, nodes: IOriginNode[]): IOriginNode {
  let x, y, width, height, sameRows: IOriginNode[] = [], sameCols: IOriginNode[] = [];
  const coords = [];
  nodes.forEach(node => coords.push(...calcNodeBox(node)));
  const xs = coords.map(i => i.x).sort((a, b) => a - b);
  const ys = coords.map(i => i.y).sort((a, b) => a - b);
  x = xs[0], y = ys[0];
  width = xs[xs.length - 1] - xs[0];
  height = ys[ys.length - 1] - ys[0];

  // 所有子结点的同行结点并集 - 所有子结点
  nodes.forEach(node => {
    sameRows.push(...node.extra.sameRows.filter(node => !sameRows.includes(node)));
  });
  sameRows = sameRows.filter(node => !nodes.includes(node));
  // 所有子结点的同列结点并集 - 所有子结点
  nodes.forEach(node => {
    sameCols.push(...node.extra.sameCols.filter(node => !sameCols.includes(node)));
  });
  sameCols = sameCols.filter(node => !nodes.includes(node));

  const newNode = {
    id: uuid.v1(),
    props: {
      style: {
        flexDirection: direction,
        width,
        height
      },
      attrs: { x: x, y: y }
    },
    extra: {
      // 结点的同行结点
      sameRows,
      // 结点的同列结点
      sameCols,
    },
    children: nodes
  }

  // 修改合并后的同列结点的sameRows、sameCols数组
  sameRows.forEach(node => {
    node.extra.sameRows = node.extra.sameRows.filter(item => !nodes.includes(item));
    node.extra.sameRows.push(newNode);
  });
  sameCols.forEach(node => {
    node.extra.sameCols = node.extra.sameCols.filter(item => !nodes.includes(item));
    node.extra.sameCols.push(newNode);
  });

  return newNode;
}
