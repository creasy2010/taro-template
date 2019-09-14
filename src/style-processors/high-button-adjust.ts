import { ILayoutNode } from "../typings";
import { calcAbsPosition, delMarginPadding, delPadding, marginBoxWidth } from "./utils";

/**
 * button类型结点样式调整
 **/

export function test(node: ILayoutNode): boolean {
  return true;
}

export function enter(node: ILayoutNode) {
  const { style: { flexDirection, justifyContent, width, borderWidth, backgroundColor, backgroundImage }, children } = node;
  if (flexDirection === 'row' && !['space-between', 'space-around'].includes(justifyContent)
    && children.length <= 3
    && (width || borderWidth || backgroundColor || backgroundImage && backgroundImage.startsWith('linear-gradient'))) {

    // 1.结点类型判定
    const textNode: ILayoutNode[] = children.filter(child => child.type === 'Text');
    let iconNode: ILayoutNode[] = [];
    let absNode: { node: ILayoutNode, absStyle: any }[] = [];
    children.forEach(child => {
      if (child.type === 'Image') {
        const absStyle = calcAbsPosition(node, child);
        if (absStyle) {
          absNode.push({ node: child, absStyle });
        } else {
          iconNode.push(child);
        }
      }
    });

    if (!((children.length == 1 && textNode.length == 1)
      || (children.length == 2 && textNode.length == 1 && iconNode.length == 1)
      || (children.length == 2 && textNode.length == 1 && absNode.length == 1)
      || (children.length == 3 && textNode.length == 1 && iconNode.length == 1 && absNode.length == 1))) return;

    console.log(`按钮结点${node.attrs.className}样式调整，按钮内容"${textNode[0].innerText}"`);

    // 2.处理内容结点
    delPadding(textNode[0].style);
    delete textNode[0].style.marginTop;
    delete textNode[0].style.marginBottom;
    if (iconNode[0]) {
      delPadding(iconNode[0].style);
      delete iconNode[0].style.marginTop;
      delete iconNode[0].style.marginBottom;
    }
    const contentWidth = marginBoxWidth(textNode[0]) + (iconNode[0] ? marginBoxWidth(iconNode[0]) : 0);
    const paddingRL = Math.floor((node.attrs.__ARGS__.width - contentWidth) / 2);

    node.style.alignItems = 'center';
    delete node.style.width;
    node.style.paddingRight = paddingRL;
    node.style.paddingLeft = paddingRL;

    // 3.处理绝对定位图片
    if (absNode.length > 0) {
      delMarginPadding(absNode[0].node.style);
      node.style.position = 'relative';
      absNode[0].node.style.position = 'absolute';
      Object.assign(absNode[0].node.style, absNode[0].absStyle);
    }
  }
}

export function exit(node: ILayoutNode) {
}
