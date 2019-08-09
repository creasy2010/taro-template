module.exports = function (layoutTree, originData) {

  // 重复item只定义一套样式


  // 解决各种宽度写死问题(taro已经自适应了)


  // 垂直列表不用space-between布局


  return data;

}

/**
 * 重复item移除多余样式定义
 */
const removeDuplicateClass = (layoutTree) => {

  const matchList = () => {

  }

  const matchText = (originNode, targetNode) => {

    const oParents = originNode.parents;
    const tParents = targetNode.parents;

    let ignoreKeys = ['maxWidth', 'whiteSpace', 'width', 'height'];
    // 删除不需要比较的属性
    ignoreKeys.forEach(key => {
      delete originNode[key];
      delete targetNode[key];
    });
    matchStyle(originNode, targetNode);
  }

  const matchImage = (originNode, targetNode) => {

  }

  const matchView = (originNode, targetNode) => {

  }

  // 比较两个样式对象
  const matchStyle = (origin, target) => {
    if (Object.keys(origin).length == Object.keys(target).length) {
      for (let key in origin) {
        if (origin[key] !== target[key]) {
          return false;
        }
      }
      return true;
    } else {
      return false;
    }
  }
}
