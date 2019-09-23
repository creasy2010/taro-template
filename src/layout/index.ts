import { IOriginNode } from "../typings";
import { calcNodeCoords, createOriginNode, calcBoundaryBox, calcHSpacing, calcInnerSpacings } from "./utils";


/**
 * 划分行与列
 */
const calcRowCol = (nodes: IOriginNode[]) => {

  filterAbsFixNodes(nodes);
  calcSameColRow(nodes);
  let i = 0;
  while(true) {
    if (i > 1000) throw new Error('超出循环上限');
    i++;
    nodes = mergeNodes(nodes);
    if (nodes.length == 1) break;
    rowFirstConnect(nodes);
  }
  mergeSameColRow(nodes[0]);
  return nodes[0];
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
const mergeNodes = (nodes: IOriginNode[]): IOriginNode[] => {

  const merge = (direction: string, nodes: IOriginNode[], sameNodes: IOriginNode[]) => {
    nodes = nodes.filter(node => !sameNodes.includes(node));
    nodes.push(createOriginNode(direction, sameNodes));
    return nodes;
  }

  const mergeNodesOnce = (nodes) => {
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
      const keys = Object.keys(samerowsMap);
      for (let i = 0; i < keys.length; i++) {
        if (samerowsMap[keys[i]].length > 1) {
          nodes = merge('row', nodes, samerowsMap[keys[i]]);
          return { nodes, isEnd: false };
        }
      }
    }

    // 同列结点合并(同列且有相同同行结点)
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      let sameCols = [node, ...node.extra.sameCols];
      node.extra.sameCols.forEach(col => {
        sameCols.push(...col.extra.sameCols.filter(item => !sameCols.includes(item)));
      });
      let samecolsMap = {} as any;
      sameCols.forEach(item => {
        const key = item.extra.sameRows.map(n => n.id).sort().toString();
        if (samecolsMap[key]) {
          samecolsMap[key].push(item);
        } else {
          samecolsMap[key] = [item];
        }
      });
      const keys = Object.keys(samecolsMap);
      for (let i = 0; i < keys.length; i++) {
        if (samecolsMap[keys[i]].length > 1) {
          nodes = merge('column', nodes, samecolsMap[keys[i]]);
          return { nodes, isEnd: false };
        }
      }
    }
    return { nodes, isEnd: true };
  }

  let i = 0;
  while(true) {
    i++;
    const { nodes: newNodes, isEnd } = mergeNodesOnce(nodes);
    nodes = newNodes;
    if (isEnd) break;
    if (i > 1000) throw new Error('超出循环上限');
  }
  return nodes;
}

/**
 * 行优先连接
 */
const rowFirstConnect = (nodes: IOriginNode[]) => {}

/**
 * 嵌套的行列，合并为一行一列
 */
const mergeSameColRow = (node: IOriginNode) => {
  const walkNode = (node: IOriginNode) => {
    if (node.children) {
      node.children.forEach(child => walkNode(child));
    }
    const style = node.props.style;
    const parentStyle = node.parent.props.style;
    if (style.flexDirection && style.flexDirection === parentStyle.flexDirection) {
      node.parent.children.splice(node.parent.children.indexOf(node), 1, ...node.children);
    }
  }
}


/**
 * 行布局计算
 */
const calcRowLayout = (node: IOriginNode) => {

  node.children.forEach(child => calcRowLayout(child));

  if (node.props.style.flexDirection !== 'row') return;

  // 子结点是否为等分分布
  const isNDivide = (node: IOriginNode) => {
    // 依次判断子结点中点是否在等分点上
    for (let i = 0; i < children.length; i++) {
      const x1 = node.points[0].x, n = children.length, w = node.props.style.width;
      let x = x1 + 1 / 2 * n + (i - 1) * w / n;
      if (children[i].points[4].x != x) {
        return false;
      }
    }
    return true;
  }

  const { width: nodeWidth } = node.props.style;
  const connSpace = nodeWidth / 10;
  // fixme 要用到breakSpace
  const breakSpace = nodeWidth / 5;
  const children = node.children;
  const boundaryBox = calcBoundaryBox(node.children);

  // 1.计算justifyContent
  if (children.length == 1 && children[0].points[4].x == node.points[4].x) {
    // 1.1.单节点、外框中点，center
    node.props.style.justifyContent = 'center';
  }

  // 计算leftBoxes和rightBoxes
  let leftBoxes, rightBoxes = [];
  children.sort((a, b) => a.points[4].x - b.points[4].x)
  let rightBoundary = node.points[1].x;
  let rightFlag = false;
  for (let i = children.length - 1; i >= 0; i--) {
    if (rightBoundary - children[i].points[1].x < connSpace) {
      rightBoxes.push(children[i]);
      rightBoundary = children[i].points[0].x;
    } else if(rightBoxes.length > 0) {
      rightFlag = true;
    } else {
      break;
    }
  }
  if (!rightFlag) rightBoxes = [];
  leftBoxes = children.filter(child => !rightBoxes.includes(child));

  if (rightBoxes.length == 0) {
    // 1.2.全部为左结点，flex-start
    node.props.style.justifyContent = 'flex-start';
    node.props.style.paddingLeft = calcInnerSpacings(node, boundaryBox)[3];
    if(isNDivide(node)) {
      // 平均分布
    } else {
      // 计算marginRight
      children.forEach((child, idx) => {
        if (idx == 0) return;
        children[idx - 1].props.style.marginRight = calcHSpacing(children[idx - 1], child);
      });
    }
  } else if(leftBoxes.length == 0) {
    // 1.3.全部为右结点，flex-end
    node.props.style.justifyContent = 'flex-end';
    node.props.style.paddingRight = calcInnerSpacings(node, boundaryBox)[1];
    // 计算marginLeft
    children.forEach((child, idx) => {
      if (idx == children.length - 1) return;
      children[idx + 1].props.style.marginLeft = calcHSpacing(child, children[idx + 1]);
    });
  } else {
    // 1.4.既有左结点又有右结点，space-between
    node.props.style.justifyContent = 'space-between';
    node.props.style.paddingLeft = calcInnerSpacings(node, boundaryBox)[3];
    node.props.style.paddingRight = calcInnerSpacings(node, boundaryBox)[1];
    node.children = [];
    if (leftBoxes.length > 1) {
      node.children.push(createOriginNode('row', leftBoxes));
      // 计算marginRight
      leftBoxes.forEach((box, idx) => {
        if (idx == 0) return;
        leftBoxes[idx - 1].props.style.marginRight = calcHSpacing(leftBoxes[idx - 1], box);
      });
    } else {
      node.children.push(...leftBoxes);
    }
    if (rightBoxes.length > 1) {
      // 计算marginLeft
      node.children.push(createOriginNode('row', rightBoxes));
      rightBoxes.forEach((box, idx) => {
        if (idx == rightBoxes.length - 1) return;
        rightBoxes[idx + 1].props.style.marginLeft = calcHSpacing(box, rightBoxes[idx + 1]);
      });
    } else {
      node.children.push(...rightBoxes);
    }
  }

  // 2.计算alignItems
  let alignItemsMap = {
    'center': [],
    'flex-start': [],
    'flex-end': [],
    'stretch': [],
    'others': []
  };
  // 根据坐标位置，计算每个节点的布局位置
  children.forEach(child => {
    if (child.points[4].y == node.points[4].y) {
      // 2.1.外框中点，center
      alignItemsMap['center'].push(child);
    } else if (child.points[0].y == boundaryBox[0].y && child.points[3].y == boundaryBox[3].y) {
      // 2.2.包围框上下边，stretch
      alignItemsMap['stretch'].push(child);
    } else if(child.points[0].y == boundaryBox[0].y) {
      // 2.3.包围框上边，flex-start
      alignItemsMap['flex-start'].push(child);
    } else if(child.points[3].y == boundaryBox[3].y) {
      // 2.4.包围框下边，flex-end
      alignItemsMap['flex-end'].push(child);
    } else {
      alignItemsMap['others'].push(child);
    }
  });
  // 选取子结点中出现最多的布局作为alignItems的布局，其余非主流布局的结点设置自己的alignSelf
  const alignItemsArr = Object.entries(alignItemsMap).sort((a, b) => b[1].length - a[1].length);
  const key = alignItemsArr[0][0];
  node.props.style.alignItems = key;
  // 设置padding
  if(key === 'stretch') {
    node.props.style.paddingTop = calcInnerSpacings(node, boundaryBox)[0];
    node.props.style.paddingBottom = calcInnerSpacings(node, boundaryBox)[2];
  } else if(key === 'flex-start') {
    node.props.style.paddingTop = calcInnerSpacings(node, boundaryBox)[0];
  } else if(key === 'flex-end') {
    node.props.style.paddingBottom = calcInnerSpacings(node, boundaryBox)[2];
  }
  alignItemsArr.forEach((item, idx) => {
    if (idx == 0) return;
    if (item[0] === 'others') {
      // 给alignSelf:flex-start和marginTop
      item[1].forEach(child => {
        child.props.style.alignSelf = 'flex-start';
        child.props.style.marginTop = calcInnerSpacings(node, child.points)[0];
      });
    } else {
      item[1].forEach(n => n.props.style.alignSelf = item[0]);
    }
  });
}

/**
 * 列布局计算
 */
const calcColLayout = (node: IOriginNode) => {

  node.children.forEach(child => calcColLayout(child));

  if (node.props.style.flexDirection !== 'column') return;

  const children = node.children;
  const boundaryBox = calcBoundaryBox(node.children);

  // 1.justifyContent计算
  if (children.length == 1 && children[0].points[4].y == node.points[4].y) {
    // 1.1.单节点外框中点，center
    node.props.style.justifyContent = 'center';
  } else {
    // 1.2.其它情况，flex-start
    node.props.style.justifyContent = 'flex-start';
    node.props.style.paddingTop = calcInnerSpacings(node, boundaryBox)[0];
  }

  // 2.alignItems计算
  let alignItemsMap = {
    'center': [],
    'flex-start': [],
    'flex-end': [],
    'stretch': [],
    'others': []
  };
  // 根据坐标位置，计算每个节点的布局位置
  children.forEach(child => {
    if (child.points[4].x == node.points[4].x) {
      // 2.1.外框中点，center
      alignItemsMap['center'].push(child);
    } else if (child.points[0].x == boundaryBox[0].x && child.points[1].x == boundaryBox[1].x) {
      // 2.2.包围框左右边，stretch
      alignItemsMap['stretch'].push(child);
    } else if(child.points[0].x == boundaryBox[0].x) {
      // 2.3.包围框左边，flex-start
      alignItemsMap['flex-start'].push(child);
    } else if(child.points[1].x == boundaryBox[1].x) {
      // 2.4.包围框右边，flex-end
      alignItemsMap['flex-end'].push(child);
    } else {
      // 2.5.其它情况
      alignItemsMap['others'].push(child);
    }
  });
  // 选取子结点中出现最多的布局作为alignItems的布局，其余非主流布局的结点设置自己的alignSelf
  const alignItemsArr = Object.entries(alignItemsMap).sort((a, b) => b[1].length - a[1].length);
  const key = alignItemsArr[0][0];
  // 设置padding
  if(key === 'stretch') {
    node.props.style.paddingLeft = calcInnerSpacings(node, boundaryBox)[3];
    node.props.style.paddingRight = calcInnerSpacings(node, boundaryBox)[1];
  } else if(key === 'flex-start') {
    node.props.style.paddingLeft = calcInnerSpacings(node, boundaryBox)[3];
  } else if(key === 'flex-end') {
    node.props.style.paddingRight = calcInnerSpacings(node, boundaryBox)[1];
  }
  node.props.style.alignItems = key;
  alignItemsArr.forEach((item, idx) => {
    if (idx == 0) return;
    if (item[0] === 'others') {
      // 给alignSelf:flex-start和marginTop
      item[1].forEach(child => {
        child.props.style.alignSelf = 'flex-start';
        child.props.style.marginLeft = calcInnerSpacings(node, child.points)[3];
      });
    } else {
      item[1].forEach(n => n.props.style.alignSelf = item[0]);
    }
  });

}

/**
 * 计算间距
 */
const calcSpacing = (node: IOriginNode) => {}



// 1.划分行与列
const originNodes: IOriginNode[] = [{
  "props": {
    "style": { "width": 80, "height": 80, "opacity": "1.00" },
    "attrs": {
      "x": 0,
      "y": 0,
      "source": "https://ai-sample.oss-cn-hangzhou.aliyuncs.com/test/fec662b0dc4111e995dc8f284499d2a1.png"
    }
  },
  "children": [],
  "nodeLayerName": "位图-合并",
  "type": "Image",
  "id": "Image_0"
}, {
  "props": {
    "style": {
      "width": 196,
      "height": 36,
      "color": "rgba(51, 51, 51, 1)",
      "fontFamily": "PingFang SC",
      "fontSize": 14,
      "fontWeight": 400,
      "lineHeight": 18
    }, "attrs": { "x": 92, "y": 4, "text": "大型犬只野兽派洗剪吹，凶悍大叔专业洗狗12年，洗遍天下无…", "lines": 2 }
  },
  "selfId": "C178AF40-59D4-4C89-BB1F-8F3351BA14E40",
  "nodeLayerName": "大型犬只野兽派洗剪吹，凶悍大叔专业洗狗1",
  "type": "Text",
  "id": "Text_1_0"
}, {
  "__VERSION__": "2.0",
  "props": {
    "style": {
      "width": 57,
      "height": 16,
      "color": "rgba(179, 179, 179, 1)",
      "fontFamily": "PingFang SC",
      "fontSize": 12,
      "fontWeight": 400,
      "lineHeight": 16
    }, "attrs": { "x": 92, "y": 46, "text": "鸡肉 400g", "lines": 1 }
  },
  "selfId": "895DE0AC-A7FA-4E0D-A821-3348A84DB5CD0",
  "nodeLayerName": "鸡肉 400g",
  "type": "Text",
  "id": "Text_2_0"
}, {
  "__VERSION__": "2.0",
  "props": {
    "style": {
      "width": 43,
      "height": 18,
      "color": "rgba(51, 51, 51, 1)",
      "fontFamily": "PingFang SC",
      "fontSize": 14,
      "fontWeight": 400,
      "lineHeight": 18
    }, "attrs": { "x": 308, "y": 2, "text": "¥198.9", "lines": 1 }
  },
  "selfId": "B09D13BE-36F0-4B64-9546-D9F1598BC56A0",
  "nodeLayerName": "¥198.9",
  "type": "Text",
  "id": "Text_3_0"
}, {
  "__VERSION__": "2.0",
  "props": {
    "style": {
      "width": 15,
      "height": 18,
      "color": "rgba(51, 51, 51, 1)",
      "fontFamily": "PingFang SC",
      "fontSize": 14,
      "fontWeight": 400,
      "lineHeight": 18
    }, "attrs": { "x": 336, "y": 24, "text": "×1", "lines": 1 }
  },
  "selfId": "13B94B1F-4094-404D-8E6A-2263906552F70",
  "nodeLayerName": "×1",
  "type": "Text",
  "id": "Text_4_0"
}];

// init
originNodes.forEach(node => {
  node.extra = { sameRows: [], sameCols: []};
  node.points = calcNodeCoords(node);
  node.children = [];
});

// 划分行与列
const node = calcRowCol(originNodes);
// 计算row、column布局
calcRowLayout(node);
calcColLayout(node);
const rmAttr = (node: IOriginNode) => {
  delete node.extra;
  delete node.parent;
  delete node.points;
  if (node.children) {
    node.children.forEach(child => {
      rmAttr(child);
    });
  } else {
  }
}
rmAttr(node);

console.log(JSON.stringify(node));
// 2.行布局、列布局
// calcRowLayout(node);
// calcColLayout(node);
// // 3.间距处理
// calcSpacing(node);

