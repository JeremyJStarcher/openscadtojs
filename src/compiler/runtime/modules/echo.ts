import { RunTime } from "../../cc/run-time";
import * as TokenType from "../../runtime/token-type";

export default function echo(runtime: RunTime, ...args: TokenType.Value2[]) {
    const valsAsStr = args.map(arg => arg.value);
    runtime.logger.log(valsAsStr.join(", "));
    // console.log('ECHO: ' + valsAsStr);
}
