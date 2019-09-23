import { IOriginNode, IStyle, IPosition, Coords } from "../typings";
import * as uuid from 'uuid';


/**
 * 计算四个顶点和中点的坐标
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
  // 中点坐标
  coords.push({ x: x + width / 2, y: y + height / 2 });
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

/**
 * 计算两结点的垂直间距
 */
export function calcVSpacing(source: IOriginNode, target: IOriginNode) {
  return target.points[0].y; - source.points[3].y;
}

/**
 * 计算两结点的水平间距
 */
export function calcHSpacing(source: IOriginNode, target: IOriginNode) {
  return target.points[0].x; - source.points[1].x;
}

/**
 * 计算内部结点的间距
 */
export function calcInnerSpacings(outer: IOriginNode, innerPoints: Coords[]) {
  return [
    innerPoints[0].y - outer.points[0].y,
    outer.points[2].x - innerPoints[2].x,
    outer.points[2].y - innerPoints[2].y,
    innerPoints[0].x - outer.points[0].x
  ];
}

/**
 * 计算多个结点的边界框的坐标点
 */
export function calcBoundaryBox(nodes: IOriginNode[]): Coords[] {
  // x最小最大值、y最小最大值
  const xMin = nodes.map(node => node.points[0].x).sort((a, b) => a - b)[0];
  const xMax = nodes.map(node => node.points[2].x).sort((a, b) => b - a)[0];
  const yMin = nodes.map(node => node.points[0].y).sort((a, b) => a - b)[0];
  const yMax = nodes.map(node => node.points[2].y).sort((a, b) => b - a)[0];
  // 计算边界框的坐标点
  return [
    {x: xMin, y: yMin},
    {x: xMax, y: yMin},
    {x: xMax, y: yMax},
    {x: xMin, y: yMax},
    {x: (xMin + xMax) / 2, y: (yMin + yMax) / 2},
  ];
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

  const newNode: IOriginNode = {
    id: uuid.v1(),
    type: 'Block',
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
  };
  newNode.points = calcNodeCoords(newNode);
  nodes.forEach(node => node.parent = newNode);

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
