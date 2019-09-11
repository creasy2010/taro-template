import { ILayoutNode, ILayoutNodeAttr } from "../typings";
import { appendVal, contentHeight, contentWidth, marginHeight, marginWidth, val } from "./utils";

/**
 * row方向布局，尽量不使用center
 **/

export function test(node: ILayoutNode): boolean {
  const { style: { flexDirection, justifyContent }, children } = node;
  const length = children.filter(child => child.style.position !== 'absolute').length;
  if (flexDirection === 'row') {
    // if (['space-between', 'space-around'].includes(justifyContent) && length > 2) return true;
    if (['center'].includes(justifyContent) && length > 1) return true;
  }
  return false;
}

export function enter(node: ILayoutNode) {
  const { justifyContent } = node.style;

  // // 将space-between转为flex-start
  // if (justifyContent === 'space-between') {
  //   node.style.justifyContent = 'flex-start';
  //   // 给子结点加marginLeft fixme
  //   const childrenWidth = node.children.reduce((total, child) => total + marginWidth(child), 0);
  //   const marginLeft = Math.round((contentWidth(node) - childrenWidth) / (node.children.length - 1));
  //   node.children.forEach((child, idx) => {
  //     if (idx > 0) appendVal(child.style, 'marginLeft', marginLeft);
  //   });
  //   console.log(`结点${node.attrs.className}row.space-between转为row.flex-start`);
  // }
  //
  // // 将space-around转为flex-start
  // if (justifyContent === 'space-around') {
  //   node.style.justifyContent = 'flex-start';
  //   // 子结点加marginLeft fixme
  //   const childrenWidth = node.children.reduce((total, child) => total + marginWidth(child), 0);
  //   const spacing = Math.round((contentWidth(node) - childrenWidth) / node.children.length);
  //   node.children.forEach((child, idx) => {
  //     if (idx > 0) appendVal(child.style, 'marginLeft', spacing);
  //   });
  //   appendVal(node.style, 'paddingLeft', Math.round(spacing / 2));
  //   appendVal(node.style, 'paddingRight', Math.round(spacing / 2));
  //   console.log(`结点${node.attrs.className}由布局row.space-around转为row.flex-start`);
  // }

  //  将center转为flex-start或space-between
  if (justifyContent === 'center') {
    node.style.justifyContent = 'flex-start';
    const childrenWidth = node.children.reduce((total, child) => total + marginWidth(child), 0);
    const paddingLR = Math.round((contentWidth(node) - childrenWidth) / 2);
    appendVal(node.style, 'paddingLeft', paddingLR);
    appendVal(node.style, 'paddingRight', paddingLR);
    console.log(`结点${node.attrs.className}由布局row.center转为row.flex-start`);

    // 尝试使用space-between
    // 元素间间距小于1/20宽度，左右块间距大于1/5间距
    const fivePerc = Math.round(node.attrs.__ARGS__.width / 20);
    const twentyPerc = Math.round(node.attrs.__ARGS__.width / 5);

    // 分割点索引
    // let splitIdx = null;
    // for (let i = 0; i < node.children.length; i++) {
    //   if (i > 0) continue;
    //   const spacing = val(node.children[i].style.marginLeft) + val(node.children[i - 1].style.marginRight);
    //   if (spacing < fivePerc) continue;
    //   if (spacing > twentyPerc) {
    //     if (splitIdx != null) return;
    //     splitIdx = i;
    //   }
    // }
    // if (splitIdx == null) return;

    // parent跳帧
    // const headNodes = node.children.slice(0, splitIdx - 1);
    // const tailNodes = node.children.slice(splitIdx - 1);
    // node.children = [{
    //   children: headNodes,
    //   type: 'Block',
    //   parent: node,
    //   attrs: {
    //
    //   },
    // }];

    // export interface ILayoutNode {
    //   children: ILayoutNode[];
    //   type: 'Text' | 'Image' | 'Block' | 'Repeat' | 'Shape';
    //   parent: ILayoutNode;
    //   componentType: string;
    //   componentName: string;
    //   refComponentName: string;
    //   attrs: ILayoutNodeAttr;
    //   props: {
    //     attrs: ILayoutNodeAttr;
    //   }
    //   style: any;
    //   modStyleConfig: {
    //     designWidth: number;
    //     designHeight: number;
    //   };
    //   dataBindingStore?: any[];
    //   innerText: string;
    // }
  }

}

export function exit(node: ILayoutNode) {
}
