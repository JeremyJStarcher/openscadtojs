import { RunTime } from '../../cc/run-time';
import * as TokenType from '../../runtime/token-type';

export default function echo(runtime: RunTime, ...args: TokenType.Value2[]) {
    const argValues = args.map(arg => arg.valueOf(runtime));
    const valsAsStr = argValues.map(arg => arg.toScadString(runtime));
    const out = valsAsStr.join(', ');

    // console.info("ECHO: ", out);
    runtime.logger.echo(out);
}
