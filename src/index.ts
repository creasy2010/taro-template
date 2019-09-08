import parser from './parser';
import { IParseConfig, IParseResult } from "./typings";

export default async (config: IParseConfig): Promise<IParseResult> => {
  config.pageName = config.pagePath.split('/').pop();
  return parser(config);
}
