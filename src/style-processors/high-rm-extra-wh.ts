import { ILayoutNode } from "../typings";
import { marginBoxWidth, marginBoxHeight, contentBoxWidth, contentBoxHeight, isContainer } from "./utils";

/**
 * 删除多余的宽高调整
 **/

export function test(node: ILayoutNode): boolean {
  return true;
}

export function enter(node: ILayoutNode) {

  const childrenWidth = (node: ILayoutNode) => {
    const flexDirection = node.style.flexDirection;
    if (flexDirection === 'row') {
      // 宽度和
      return node.children.reduce((total, child) => total + marginBoxWidth(child), 0);
    } else if(flexDirection === 'column') {
      // 宽度最大值
      return node.children.map(child => marginBoxWidth(child)).sort().reverse()[0];
    }
  };
  const childrenHeight = (node: ILayoutNode) => {
    const flexDirection = node.style.flexDirection;
    if (flexDirection === 'column') {
      // 高度和
      return node.children.reduce((total, child) => total + marginBoxHeight(child), 0);
    } else if(flexDirection === 'row') {
      // 高度最大值
      return node.children.map(child => marginBoxHeight(child)).sort().reverse()[0];
    }
  };

  // 文本不设宽高
  if (node.type === 'Text') {
    delete node.style.width;
    delete node.style.height;
    console.log(`结点${node.attrs.className}删除文本宽高`);
  }

  if (isContainer(node.type)) {
    // 子结点宽高等于当前结点内容宽高
    if (node.style.justifyContent === 'flex-start') {
      if (childrenWidth(node) == contentBoxWidth(node)) {
        delete node.style.width;
        console.log(`结点${node.attrs.className}删除宽度`);
      }
      if (childrenHeight(node) == contentBoxHeight(node)) {
        delete node.style.height;
        console.log(`结点${node.attrs.className}删除高度`);
      }
    }
    // 父结点column布局并设置了stretch
    if (node.attrs.className == 'hd') {
      console.log(`parent: ${JSON.stringify(node.parent.style)}`);
    }
    if (node.parent
      && node.parent.style.flexDirection === 'column'
      && node.parent.style.alignItems === 'stretch') {
      delete node.style.width;

      console.log(`结点${node.attrs.className}删除宽度`);
    }
  }
}

export function exit(node: ILayoutNode) {
}
