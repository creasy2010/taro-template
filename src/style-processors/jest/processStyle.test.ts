import {processStyle} from '../index';
import { getLayoutJson } from "../../parser";
import { readJSONSync, writeJSONSync } from "fs-extra";
import { join } from "path";
import { preClean } from "../../util/pre";

/**
 * @desc
 *
 * @使用场景
 *
 * @coder.yang2010@gmail.com
 * @Date    2019/10/9
 **/

it('确认订单页面转换', async function() {
  // let layout = await getLayoutJson("13398");
  // writeJSONSync(join(__dirname,"confirmOrder-layout.json"),layout);

  let layout= readJSONSync(join(__dirname,"confirmOrder-layout.json"));
  preClean(layout);
  processStyle(layout);
  expect(layout).toMatchSnapshot("基本格式转化");
});

it('分组件处理', async function() {

})


