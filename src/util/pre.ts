import { ILayoutNode } from "../typings";

/**
 * @desc
 *
 * @使用场景
 *
 * @coder.yang2010@gmail.com
 * @Date    2019/10/9
 **/



export function preClean (node: ILayoutNode):ILayoutNode{
  addParent(node);
  return node;
}



//去除px的单位;
const rmLineHeightPx = (style) => {
  let lineHeight = style.lineHeight;
  if (lineHeight && lineHeight.endsWith('px')) {
    style.lineHeight = parseInt(lineHeight.slice(0, lineHeight.length - 2));
  }
}

// 添加parent、设置默认值
const addParent = (node: ILayoutNode) => {
  const { display, flexDirection, justifyContent, alignItems } = node.style;
  if (display === 'flex' && !flexDirection) node.style.flexDirection = 'row';
  if (display === 'flex' && !justifyContent) node.style.justifyContent = 'flex-start';
  if (display === 'flex' && !alignItems) node.style.alignItems = 'stretch';
  rmLineHeightPx(node.style);
  node.children.forEach(child => {
    child.parent = node;
    addParent(child);
  });
};
