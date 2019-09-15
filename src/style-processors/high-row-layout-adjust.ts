import { ILayoutNode } from "../typings";
import { appendVal, contentBoxWidth, marginBoxWidth, val, newNode } from "./utils";

/**
 * row方向布局，尽量不使用center
 **/

export function test(node: ILayoutNode): boolean {
  const { style: { flexDirection, justifyContent }, children } = node;
  const length = children.filter(child => child.style.position !== 'absolute').length;
  if (flexDirection === 'row') {
    // if (['space-between', 'space-around'].includes(justifyContent) && length > 2) return true;
    // TODO 直接大于1会有问题，按钮~
    if (['center'].includes(justifyContent) && length > 1) return true;
  }
  return false;
}

export function enter(node: ILayoutNode) {
  const { justifyContent } = node.style;

  //  将center转为flex-start或space-between
  if (justifyContent === 'center') {
    // 1.先将center转为flex-start
    node.style.justifyContent = 'flex-start';
    const childrenWidth = node.children.reduce((total, child) => total + marginBoxWidth(child), 0);
    const paddingLR = Math.round((contentBoxWidth(node) - childrenWidth) / 2);
    appendVal(node.style, 'paddingLeft', paddingLR);
    appendVal(node.style, 'paddingRight', paddingLR);
    console.log(`结点${node.attrs.className}由布局row.center转为row.flex-start`);

    // 2.再尝试转为space-between
    // 元素间间距小于1/20宽度，左右块间距大于1/6间距
    const fivePerc = Math.round(node.attrs.__ARGS__.width / 20);
    const twentyPerc = Math.round(node.attrs.__ARGS__.width / 6);
    console.log(`fivePerc:${fivePerc}, twentyPerc:${twentyPerc}`);

    // 分割点索引
    let splitIdx = null;
    for (let i = 0; i < node.children.length; i++) {
      if (i == 0) continue;
      const spacing = val(node.children[i].style.marginLeft) + val(node.children[i - 1].style.marginRight);
      if (spacing < fivePerc) continue;
      if (spacing > twentyPerc) {
        if (splitIdx != null) return;
        splitIdx = i;
      }
    }
    if (splitIdx == null) return;

    const headNodes = node.children.slice(0, splitIdx);
    const tailNodes = node.children.slice(splitIdx);

    delete headNodes[headNodes.length - 1].style.marginRight;
    let headBlock = headNodes[0];
    let tailBlock = tailNodes[0];
    if (headNodes.length > 1) {
      headBlock = newNode({ parent: node, children: headNodes, type: 'Block' });
      headNodes.forEach(head => head.parent = headBlock);
      // fixme classnName防重处理
      headBlock.attrs.className = 'disFlex';
      headBlock.style = {
        display: 'flex',
        alignItems: 'center'
      };
    }
    if (tailNodes.length > 1) {
      tailBlock = newNode({ parent: node, children: tailNodes, type: 'Block' });
      tailNodes.forEach(tail => tail.parent = tailBlock);
    }
    node.children = [headBlock, tailBlock];
    node.style.justifyContent = 'space-between';
    console.log(`结点${node.attrs.className}由布局row.flex-star转为row.space-between`);
  }

}

export function exit(node: ILayoutNode) {
}
