import { ILayoutNode } from "../typings";
import { newNode, val } from './utils';

/**
 * 两列、三列列表调整
 **/

export function test(node: ILayoutNode): boolean {
  return matchCol(node, 2).length > 0 || matchCol(node, 3).length > 0;
}

export function enter(node: ILayoutNode) {
}

export function exit(node: ILayoutNode) {
  const twoResults = matchCol(node, 2);
  const threeResults = matchCol(node, 3);

  const adjust = ({ start, end, nodes }, number) => {
    // 1.建立外层结点
    const newBlock: ILayoutNode = newNode({ type: 'Block' });
    // 2.外层结点加样式
    // fixme 样式命名
    newBlock.attrs.className = 'twoCols';
    newBlock.style = {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'flex-start',
      flexWrap: 'wrap'
    };
    // 3.将相似结点加入外层结点子结点
    newBlock.children = nodes;
    newBlock.children.forEach(child => child.parent = newBlock);
    let oldRow1 = node.children[start];
    // 4.外层结点删除原子结点、加入新子结点
    node.children.splice(start, end - start + 1, newBlock);
    newBlock.parent = node;
    // 5.计算样式
    let spacing = val(newBlock.children[0].style.marginRight) + val(newBlock.children[0].style.marginLeft);
    let padding = val(oldRow1.style.paddingLeft);
    let marginLR = spacing / 2;
    let paddingLR = padding - marginLR;
    newBlock.style.paddingLeft = newBlock.style.paddingRight = paddingLR;
    newBlock.children.forEach(child => {
      // fixme 临时删了
      // child.style.width = `calc(${Math.floor(oldRow1.attrs.__ARGS__.width - number * spacing - 2 * paddingLR) * 2}px / ${number})`;
      child.style.marginRight = child.style.marginLeft = marginLR;
      if (oldRow1.style.marginBottom) {
        child.style.marginBottom = oldRow1.style.marginBottom;
      }
    });
    console.log(`${node.attrs.className} ${number}列布局调整 index:${start}`);
  }
  if (twoResults.length > 0) twoResults.forEach(item => adjust(item, 2));
  if (threeResults.length > 0) threeResults.forEach(item => adjust(item, 3));
}

const matchCol = (node: ILayoutNode, number) => {
  const twoCols = [];
  let twoCol = { start: null, end: null, nodes: [] };
  node.children.forEach((child, idx) => {
    if (child.style.flexDirection === 'row'
      && child.children.length == number
      && sameNodes(twoCol.nodes.concat(child.children))) {
      if (twoCol.nodes.length == 0) {
        twoCol = { start: idx, end: null, nodes: [].concat(child.children) };
      }else {
        twoCol.nodes.push(...child.children);
      }
    } else if (twoCol.nodes.length > 0) {
      if (sameNodes(twoCol.nodes.concat(child))) {
        twoCol.nodes.push(child);
      } else if(sameNodes(twoCol.nodes.concat(child.children)) && child.children.length < number){
        twoCol.nodes.push(...child.children);
      }
      twoCol.end = idx;
      twoCols.push(twoCol);
      twoCol = { start: null, end: null, nodes: [] };
    }
  });
  if (twoCol.nodes.length > 0) {
    twoCol.end = node.children.length - 1;
    twoCols.push(twoCol);
  }
  return twoCols;
}



const sameNodes = (nodes: ILayoutNode[]) => {
  const tWidth = nodes[0].attrs.__ARGS__.width;
  const tHeight = nodes[0].attrs.__ARGS__.height;
  for (let i = 1; i < nodes.length; i++) {
    const { width, height } = nodes[i].attrs.__ARGS__;
    if (width != tWidth) return false;
    if (height != tHeight) return false;
  }
  return true;
}
