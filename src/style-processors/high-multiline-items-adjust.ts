import { ILayoutNode } from "../typings";

/**
 * 多行重复元素布局调整
 **/

export function test(node: ILayoutNode): boolean {
  // 判断容器是否为水平列表容器
  // 相似元素匹配
  // 错误识别为多行、错误识别为多列

  return true;
}

export function enter(node: ILayoutNode) {

  // 对水平列表容器重新布局

}

export function exit(node: ILayoutNode) {
}
