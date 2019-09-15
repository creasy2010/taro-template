import { ILayoutNode } from "../typings";

/**
 * 样式重命名处理器
 * 比如 block_2-->block; img_2,img_4,img_6-->img,img_1,img_2
 **/

export function test(node: ILayoutNode): boolean {
  return !node.parent;
}

export function enter(node: ILayoutNode) {
}

// fixme 换位置后，重命名样式在切分布局之上，要调整逻辑；后面考虑换地方
export function exit(data: ILayoutNode) {
  console.log('样式重命名处理器');

  let map = {};
  const deal = (node) => {
    let className = node.attrs.className;
    const pre = className.lastIndexOf('_') == -1 ? className: className.slice(0, className.lastIndexOf('_'));
    if (map[pre]) {
      map[pre].push(node);
    } else {
      map[pre] = [node];
    }
    node.children.forEach(child => {
      deal(child);
    });
  }
  deal(data);

  // 重命名样式
  for (let key in map) {
    let idx = -1, curKey = null;
    const nodes = map[key].sort((a, b) => a.attrs.className > b.attrs.className);
    for (let i = 0; i < nodes.length; i++) {
      if (curKey != nodes[i].attrs.className) {
        idx++;
        curKey = nodes[i].attrs.className;
      }
      if (idx == 0) {
        nodes[i].attrs.className = key;
      } else {
        nodes[i].attrs.className = key + idx;
      }
    }
  }

}

