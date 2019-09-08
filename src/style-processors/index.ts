import * as LayoutAdjust from './layout-adjust';
import * as LayoutSpacing from './layout-spacing';
import * as LayoutRmWh from './layout-rm-wh';
import * as NodeExtraAttrs from './node-extra-attrs';
import * as RenameClassname from './rename-classname';
import * as UnifyClassname from './unify-classname';
import * as CommonStyle from './common-style';

const processors = [
  LayoutAdjust,
  LayoutSpacing,
  LayoutRmWh,
  NodeExtraAttrs,
  RenameClassname,
  UnifyClassname,
  CommonStyle
];

export const processStyle = (node) => {
  processors.forEach(visitor => {
    if (visitor.test(node)) visitor.enter(node);
  });
  node.children.forEach(child => processStyle(child));
  processors.forEach(visitor => {
    if (visitor.test(node)) visitor.exit(node);
  });
};
