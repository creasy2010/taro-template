import { ILayoutNode } from "../typings";

/**
 * 样式重命名处理器
 * 比如 block_2-->block; img_2,img_4,img_6-->img,img_1,img_2
 **/

export function test(node: ILayoutNode): boolean {
  return false;
}

export function enter(node: ILayoutNode) {
}

// fixme 换位置后，重命名样式在切分布局之上，要调整逻辑；后面考虑换地方
export function exit(data: ILayoutNode) {

  let map = {};

  const deal = (node, isRoot?: boolean) => {

    // 引用结点不处理
    if (!isRoot && node.refComponentName) return;

    let className = node.attrs.className;
    if (/_\d+$/.test(className)) {
      // 扫描出样式以"_数字"结尾的结点，放入map
      const pre = className.slice(0, className.lastIndexOf('_'));
      node.attrs.className = pre;
      className = pre;
    }

    if (map[className]) {
      map[className].push(node);
    } else {
      map[className] = [node];
    }

    node.children.forEach(child => {
      deal(child);
    });
  }

  deal(data, true);

  // 重命名样式
  for (let key in map) {
    for (let i = 0; i < map[key].length; i++) {
      if (i != 0) {
        map[key][i].attrs.className = map[key][i].attrs.className + i;
      }
    }
  }

  if (data.refComponentName) {
    data.attrs.className = data.refComponentName;
  } else {
    data.attrs.className = 'index';
  }

}

