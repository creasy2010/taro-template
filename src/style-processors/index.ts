import * as HighColumnVerAdjust from './high-column-ver-adjust';
import * as HighColumnHorAdjust from './high-column-hor-adjust';
import * as HighRowLayoutAdjust from './high-row-layout-adjust';
import * as HighSpacingAdjust from './high-spacing-adjust';
import * as HighButtonAdjust from './high-button-adjust';
import * as HighMultiColumnList from './high-multi-column-list';
import * as HighMultilineItemsAdjust from './high-multiline-items-adjust';
import * as HighRmExtraWh from './high-rm-extra-wh';
import * as LowRmExtraAttrs from './low-rm-extra-attrs';
import * as CommonRenameClassname from './common-rename-classname';
import * as CommonUnifyClassname from './common-unify-classname';

const processors = [
  HighColumnVerAdjust,
  HighColumnHorAdjust,
  HighRowLayoutAdjust,
  HighSpacingAdjust,
  HighButtonAdjust,
  HighMultiColumnList,
  HighMultilineItemsAdjust,
  HighRmExtraWh,
  LowRmExtraAttrs,
  CommonUnifyClassname,
  CommonRenameClassname
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
