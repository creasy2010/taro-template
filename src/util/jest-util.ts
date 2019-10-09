/**
 * @desc
 *
 * @使用场景
 *
 * @company qianmi.com
 * @Date    2019/7/25
 **/

import * as klaw from 'klaw';
import debug from  'debug';
const log  = debug('jest-util');
import {readFile} from 'fs-extra';
export interface IResult {
  [path: string]: string;
}

export function readDirFiles(dirPath: string): Promise<IResult> {
  log(`读取文件夹${dirPath}下文件内容`);
  dirPath =  dirPath.endsWith("/")?dirPath:dirPath+"/";
  return new Promise((resolve, reject) => {
    let allFilePaths: string[] = [];
    klaw(dirPath)
      .on('data', item => {
        if (item.stats.isFile()) {
          allFilePaths.push(item.path);
        }
      })
      .on('end', async () => {
        let result = {};
        let contents = await Promise.all(
          allFilePaths.map(filePath => readFile(filePath)),
        );
        for (let i = 0, iLen = allFilePaths.length; i < iLen; i++) {
          let fileName = allFilePaths[i].replace(dirPath, '');
          result[fileName] = contents[i].toString();
        }
        resolve(result);
      });
  });
}

export function sleep(time:number){
  return new Promise((resolve)=>{
    setTimeout(resolve,time);
  })
}